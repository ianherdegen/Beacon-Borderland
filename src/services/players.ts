import { supabase } from '../lib/supabase';
import { Player, CreatePlayer, UpdatePlayer, PlayerStats, PlayerFilters } from '../types';

export class PlayersService {
  // Get all players
  static async getAll(): Promise<Player[]> {
    console.log('Fetching players from Supabase...');
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Error fetching players:', error);
      throw error;
    }

    console.log('Players fetched successfully:', data);
    return data || [];
  }

  // Get a single player by ID
  static async getById(id: number): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching player:', error);
      throw error;
    }

    return data;
  }

  // Get player by username
  static async getByUsername(username: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching player by username:', error);
      throw error;
    }

    return data;
  }

  // Create a new player
  static async create(player: CreatePlayer): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .insert([player])
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      throw error;
    }

    return data;
  }

  // Update an existing player
  static async update(id: number, updates: UpdatePlayer): Promise<Player> {
    console.log('Updating player:', id, 'with updates:', updates);
    
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    console.log('Update response:', { data, error });

    if (error) {
      console.error('Error updating player:', error);
      throw error;
    }

    return data;
  }

  // Delete a player
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  }

  // Search and filter players
  static async search(filters: PlayerFilters): Promise<Player[]> {
    let queryBuilder = supabase
      .from('players')
      .select('*');

    if (filters.search) {
      queryBuilder = queryBuilder.or(`username.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'all') {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching players:', error);
      throw error;
    }

    return data || [];
  }

  // Get player statistics (with extended stats)
  static async getStats(id: number): Promise<PlayerStats | null> {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }

    return data;
  }

  // Get top players by creation date
  static async getTopPlayers(limit: number = 10): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top players:', error);
      throw error;
    }

    return data || [];
  }

  // Get active players
  static async getActivePlayers(): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('status', 'Active')
      .order('last_game_at', { ascending: false, nullsLast: true });

    if (error) {
      console.error('Error fetching active players:', error);
      throw error;
    }

    return data || [];
  }

  // Update player status
  static async updateStatus(id: number, status: 'Active' | 'Eliminated' | 'Forfeit'): Promise<Player> {
    // If reinstating a player (setting to Active), clear their last_game_at
    const updateData: any = { status };
    if (status === 'Active') {
      updateData.last_game_at = null;
    }
    
    return this.update(id, updateData);
  }

  // Get player's actual last game information
  static async getPlayerLastGame(playerId: number): Promise<{
    gameId: string;
    endTime: string;
    status: string;
    arenaId: string;
    gameTemplateName: string;
  } | null> {
    console.log('Fetching last game for player ID:', playerId);
    
    // First, let's see what games this player has been in
    const { data: allGames, error: allGamesError } = await supabase
      .from('arena_game_players')
      .select(`
        arena_game_id,
        arena_games!inner(
          id,
          end_time,
          status,
          arena_id,
          start_time,
          game_templates!inner(name)
        )
      `)
      .eq('player_id', playerId);

    if (allGamesError) {
      console.error('Error fetching all games for player:', allGamesError);
      throw allGamesError;
    }

    console.log('All games for player:', allGames);

    if (!allGames || allGames.length === 0) {
      console.log('No games found for player');
      return null;
    }

    // Sort by start_time descending to get the most recent game
    const sortedGames = allGames.sort((a, b) => {
      const timeA = new Date(a.arena_games.start_time).getTime();
      const timeB = new Date(b.arena_games.start_time).getTime();
      return timeB - timeA; // Descending order (most recent first)
    });

    // Get the most recent game
    const mostRecentGame = sortedGames[0];
    console.log('Most recent game:', mostRecentGame);

    if (!mostRecentGame || !mostRecentGame.arena_games) {
      console.log('No valid game data found');
      return null;
    }

    const game = mostRecentGame.arena_games;
    
    return {
      gameId: game.id,
      endTime: game.end_time || game.start_time, // Use start_time if end_time is null
      status: game.status,
      arenaId: game.arena_id,
      gameTemplateName: game.game_templates.name
    };
  }

  // Check and update player forfeit status for inactive players (3+ days)
  static async checkAndUpdateForfeitStatus(): Promise<{ updated: number; players: any[] }> {
    try {
      // Get all active players with last_game_at (exclude already eliminated players)
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, username, status, last_game_at')
        .eq('status', 'Active')
        .not('last_game_at', 'is', null);

      if (playersError) {
        console.error('Error fetching players:', playersError);
        throw playersError;
      }

      if (!players || players.length === 0) {
        return { updated: 0, players: [] };
      }

      const now = new Date();
      const updatedPlayers: any[] = [];
      const playerIdsToUpdate: number[] = [];

      // Check each player
      for (const player of players) {
        // Double-check: only process Active players (exclude Eliminated players)
        if (player.status !== 'Active') {
          console.log(`Skipping player ${player.username}: status is ${player.status}`);
          continue;
        }
        
        if (player.last_game_at) {
          const lastGameDate = new Date(player.last_game_at);
          const daysSinceLastGame = (now.getTime() - lastGameDate.getTime()) / (1000 * 60 * 60 * 24);
          
          console.log(`Player ${player.username}: ${daysSinceLastGame.toFixed(2)} days since last game`);
          
          if (daysSinceLastGame >= 3) {
            playerIdsToUpdate.push(player.id);
            updatedPlayers.push({
              player_id: player.id,
              player_name: player.username,
              last_game_date: player.last_game_at,
              days_since_last_game: Math.floor(daysSinceLastGame),
              status_updated: true
            });
          }
        }
      }

      // Update players to Forfeit status
      if (playerIdsToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('players')
          .update({ 
            status: 'Forfeit',
            updated_at: new Date().toISOString()
          })
          .in('id', playerIdsToUpdate);

        if (updateError) {
          console.error('Error updating players to forfeit:', updateError);
          throw updateError;
        }
      }

      return {
        updated: updatedPlayers.length,
        players: updatedPlayers
      };
    } catch (error) {
      console.error('Error in checkAndUpdateForfeitStatus:', error);
      throw error;
    }
  }

  // Get players who are close to forfeit (2+ days inactive)
  static async getPlayersNearForfeit(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_players_near_forfeit');
      
      if (error) {
        console.error('Error getting players near forfeit:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPlayersNearForfeit:', error);
      throw error;
    }
  }

  // Get player's game history with pagination
  static async getPlayerGameHistory(
    playerId: number, 
    page: number = 0, 
    limit: number = 10
  ): Promise<{
    games: Array<{
      gameId: string;
      endTime: string | null;
      startTime: string;
      status: string;
      arenaId: string;
      gameTemplateName: string;
      playerOutcome: string | null;
    }>;
    hasMore: boolean;
  }> {
    const offset = page * limit;
    
    const { data, error } = await supabase
      .from('arena_game_players')
      .select(`
        arena_game_id,
        player_outcome,
        arena_games!inner(
          id,
          end_time,
          start_time,
          status,
          arena_id,
          game_templates!inner(name)
        )
      `)
      .eq('player_id', playerId);

    if (error) {
      console.error('Error fetching player game history:', error);
      throw error;
    }

    if (!data) {
      return { games: [], hasMore: false };
    }

    // Sort by start_time descending (newest first) in JavaScript
    const sortedData = data.sort((a, b) => {
      const timeA = new Date(a.arena_games.start_time).getTime();
      const timeB = new Date(b.arena_games.start_time).getTime();
      return timeB - timeA; // Descending order (newest first)
    });

    // Apply pagination after sorting
    const paginatedData = sortedData.slice(offset, offset + limit);

    const games = paginatedData.map(item => ({
      gameId: item.arena_games.id,
      endTime: item.arena_games.end_time,
      startTime: item.arena_games.start_time,
      status: item.arena_games.status,
      arenaId: item.arena_games.arena_id,
      gameTemplateName: item.arena_games.game_templates.name,
      playerOutcome: item.player_outcome
    }));

    return {
      games,
      hasMore: sortedData.length > offset + limit
    };
  }

}
