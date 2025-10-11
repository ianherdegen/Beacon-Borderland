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
    return this.update(id, { status });
  }

  // Get player's actual last game information
  static async getPlayerLastGame(playerId: number): Promise<{
    gameId: string;
    endTime: string;
    status: string;
    beaconId: string;
    gameTemplateName: string;
  } | null> {
    console.log('Fetching last game for player ID:', playerId);
    
    // First, let's see what games this player has been in
    const { data: allGames, error: allGamesError } = await supabase
      .from('beacon_game_players')
      .select(`
        beacon_game_id,
        beacon_games!inner(
          id,
          end_time,
          status,
          beacon_id,
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
      const timeA = new Date(a.beacon_games.start_time).getTime();
      const timeB = new Date(b.beacon_games.start_time).getTime();
      return timeB - timeA; // Descending order (most recent first)
    });

    // Get the most recent game
    const mostRecentGame = sortedGames[0];
    console.log('Most recent game:', mostRecentGame);

    if (!mostRecentGame || !mostRecentGame.beacon_games) {
      console.log('No valid game data found');
      return null;
    }

    const game = mostRecentGame.beacon_games;
    
    return {
      gameId: game.id,
      endTime: game.end_time || game.start_time, // Use start_time if end_time is null
      status: game.status,
      beaconId: game.beacon_id,
      gameTemplateName: game.game_templates.name
    };
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
      beaconId: string;
      gameTemplateName: string;
      playerOutcome: string | null;
    }>;
    hasMore: boolean;
  }> {
    const offset = page * limit;
    
    const { data, error } = await supabase
      .from('beacon_game_players')
      .select(`
        beacon_game_id,
        player_outcome,
        beacon_games!inner(
          id,
          end_time,
          start_time,
          status,
          beacon_id,
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
      const timeA = new Date(a.beacon_games.start_time).getTime();
      const timeB = new Date(b.beacon_games.start_time).getTime();
      return timeB - timeA; // Descending order (newest first)
    });

    // Apply pagination after sorting
    const paginatedData = sortedData.slice(offset, offset + limit);

    const games = paginatedData.map(item => ({
      gameId: item.beacon_games.id,
      endTime: item.beacon_games.end_time,
      startTime: item.beacon_games.start_time,
      status: item.beacon_games.status,
      beaconId: item.beacon_games.beacon_id,
      gameTemplateName: item.beacon_games.game_templates.name,
      playerOutcome: item.player_outcome
    }));

    return {
      games,
      hasMore: sortedData.length > offset + limit
    };
  }

}
