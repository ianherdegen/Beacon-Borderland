import { supabase } from '../lib/supabase';
import { 
  ArenaGame, 
  CreateArenaGame, 
  UpdateArenaGame, 
  ArenaGameFilters, 
  ArenaGameWithDetails,
  ArenaGamePlayer,
  CreateArenaGamePlayer,
  UpdateArenaGamePlayer,
  ArenaGamePlayerWithDetails
} from '../types';

export class ArenaGamesService {
  // Get all arena games
  static async getAll(): Promise<ArenaGame[]> {
    const { data, error } = await supabase
      .from('arena_games')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching arena games:', error);
      throw error;
    }

    return data || [];
  }

  // Get arena games with details (arena name, template info, players)
  static async getWithDetails(): Promise<ArenaGameWithDetails[]> {
    const { data, error } = await supabase
      .from('arena_games')
      .select(`
        *,
        arenas!inner(name),
        game_templates!inner(name, type),
        arena_game_players(
          *,
          players!inner(username, avatar)
        )
      `)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching arena games with details:', error);
      throw error;
    }

    // Transform the data to match our interface
    return data?.map(game => ({
      ...game,
      arena_name: game.arenas.name,
      game_template_name: game.game_templates.name,
      game_template_type: game.game_templates.type,
      players: game.arena_game_players.map((bgp: any) => ({
        ...bgp,
        player_username: bgp.players.username,
        player_avatar: bgp.players.avatar
      }))
    })) || [];
  }

  // Get a single arena game by ID
  static async getById(id: string): Promise<ArenaGame | null> {
    const { data, error } = await supabase
      .from('arena_games')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching arena game:', error);
      throw error;
    }

    return data;
  }

  // Get arena game with details by ID
  static async getWithDetailsById(id: string): Promise<ArenaGameWithDetails | null> {
    const { data, error } = await supabase
      .from('arena_games')
      .select(`
        *,
        arenas!inner(name),
        game_templates!inner(name, type),
        arena_game_players(
          *,
          players!inner(username, avatar)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching arena game with details:', error);
      throw error;
    }

    return {
      ...data,
      arena_name: data.arenas.name,
      game_template_name: data.game_templates.name,
      game_template_type: data.game_templates.type,
      players: data.arena_game_players.map((bgp: any) => ({
        ...bgp,
        player_username: bgp.players.username,
        player_avatar: bgp.players.avatar
      }))
    };
  }

  // Create a new arena game
  static async create(game: CreateArenaGame): Promise<ArenaGame> {
    // Generate a unique ID for the arena game (max 20 characters)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const gameId = `AG-${timestamp}-${random}`; // Format: AG-12345678-ABCD (19 chars)
    
    const gameWithId = {
      ...game,
      id: gameId
    };

    const { data, error } = await supabase
      .from('arena_games')
      .insert([gameWithId])
      .select()
      .single();

    if (error) {
      console.error('Error creating arena game:', error);
      throw error;
    }

    return data;
  }

  // Update an existing arena game
  static async update(id: string, updates: UpdateArenaGame): Promise<ArenaGame> {
    const { data, error } = await supabase
      .from('arena_games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating arena game:', error);
      throw error;
    }

    return data;
  }

  // Delete a arena game
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('arena_games')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting arena game:', error);
      throw error;
    }
  }

  // Search and filter arena games
  static async search(filters: ArenaGameFilters): Promise<ArenaGameWithDetails[]> {
    let queryBuilder = supabase
      .from('arena_games')
      .select(`
        *,
        arenas!inner(name),
        game_templates!inner(name, type),
        arena_game_players(
          *,
          players!inner(username, avatar)
        )
      `);

    if (filters.search) {
      queryBuilder = queryBuilder.or(`id.ilike.%${filters.search}%,arenas.name.ilike.%${filters.search}%,game_templates.name.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'all') {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    if (filters.arena_id) {
      queryBuilder = queryBuilder.eq('arena_id', filters.arena_id);
    }

    if (filters.game_template_id) {
      queryBuilder = queryBuilder.eq('game_template_id', filters.game_template_id);
    }

    const { data, error } = await queryBuilder.order('start_time', { ascending: false });

    if (error) {
      console.error('Error searching arena games:', error);
      throw error;
    }

    return data?.map(game => ({
      ...game,
      arena_name: game.arenas.name,
      game_template_name: game.game_templates.name,
      game_template_type: game.game_templates.type,
      players: game.arena_game_players.map((bgp: any) => ({
        ...bgp,
        player_username: bgp.players.username,
        player_avatar: bgp.players.avatar
      }))
    })) || [];
  }

  // Get active games
  static async getActive(): Promise<ArenaGameWithDetails[]> {
    return this.search({ status: 'Active' });
  }

  // Get completed games
  static async getCompleted(): Promise<ArenaGameWithDetails[]> {
    return this.search({ status: 'Completed' });
  }

  // Get cancelled games
  static async getCancelled(): Promise<ArenaGameWithDetails[]> {
    return this.search({ status: 'Cancelled' });
  }

  // Start a new game (create and add players)
  static async startGame(arenaId: string, gameTemplateId: number, playerIds: number[]): Promise<ArenaGameWithDetails> {
    // Create the game
    const game = await this.create({
      arena_id: arenaId,
      game_template_id: gameTemplateId,
      status: 'Active'
    });

    // Add players to the game
    for (const playerId of playerIds) {
      await ArenaGamePlayersService.create({
        arena_game_id: game.id,
        player_id: playerId
      });
    }

    // Return the game with details
    const gameWithDetails = await this.getWithDetailsById(game.id);
    if (!gameWithDetails) {
      throw new Error('Failed to fetch game details after creation');
    }

    return gameWithDetails;
  }

  // End a game
  static async endGame(id: string, outcome: any, actualClip?: string): Promise<ArenaGame> {
    return this.update(id, {
      status: 'Completed',
      end_time: new Date().toISOString(),
      outcome,
      actual_clip: actualClip
    });
  }

  // Cancel a game
  static async cancelGame(id: string): Promise<ArenaGame> {
    return this.update(id, {
      status: 'Cancelled',
      end_time: new Date().toISOString()
    });
  }
}

// =====================================================
// BEACON GAME PLAYERS SERVICE
// =====================================================
export class ArenaGamePlayersService {
  // Get all arena game players
  static async getAll(): Promise<ArenaGamePlayer[]> {
    const { data, error } = await supabase
      .from('arena_game_players')
      .select('*')
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching arena game players:', error);
      throw error;
    }

    return data || [];
  }

  // Get players for a specific game
  static async getByGameId(gameId: string): Promise<ArenaGamePlayerWithDetails[]> {
    const { data, error } = await supabase
      .from('arena_game_players')
      .select(`
        *,
        players!inner(username, avatar)
      `)
      .eq('arena_game_id', gameId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching game players:', error);
      throw error;
    }

    return data?.map(bgp => ({
      ...bgp,
      player_username: bgp.players.username,
      player_avatar: bgp.players.avatar
    })) || [];
  }

  // Create a new arena game player
  static async create(player: CreateArenaGamePlayer): Promise<ArenaGamePlayer> {
    // First, verify that the player is active
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('status')
      .eq('id', player.player_id)
      .single();

    if (playerError) {
      console.error('Error fetching player status:', playerError);
      throw new Error('Player not found');
    }

    if (playerData.status !== 'Active') {
      throw new Error('Only active players can be added to games');
    }

    const { data, error } = await supabase
      .from('arena_game_players')
      .insert([player])
      .select()
      .single();

    if (error) {
      console.error('Error creating arena game player:', error);
      throw error;
    }

    return data;
  }

  // Update a arena game player
  static async update(id: number, updates: UpdateArenaGamePlayer): Promise<ArenaGamePlayer> {
    const { data, error } = await supabase
      .from('arena_game_players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating arena game player:', error);
      throw error;
    }

    return data;
  }

  // Remove a player from a game
  static async remove(id: number): Promise<void> {
    const { error } = await supabase
      .from('arena_game_players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing arena game player:', error);
      throw error;
    }
  }

  // Set player outcome
  static async setOutcome(id: number, outcome: 'win' | 'eliminated' | 'forfeit'): Promise<ArenaGamePlayer> {
    return this.update(id, {
      player_outcome: outcome
    });
  }
}
