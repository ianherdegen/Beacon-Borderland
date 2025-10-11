import { supabase } from '../lib/supabase';
import { 
  BeaconGame, 
  CreateBeaconGame, 
  UpdateBeaconGame, 
  BeaconGameFilters, 
  BeaconGameWithDetails,
  BeaconGamePlayer,
  CreateBeaconGamePlayer,
  UpdateBeaconGamePlayer,
  BeaconGamePlayerWithDetails
} from '../types';

export class BeaconGamesService {
  // Get all beacon games
  static async getAll(): Promise<BeaconGame[]> {
    const { data, error } = await supabase
      .from('beacon_games')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching beacon games:', error);
      throw error;
    }

    return data || [];
  }

  // Get beacon games with details (beacon name, template info, players)
  static async getWithDetails(): Promise<BeaconGameWithDetails[]> {
    const { data, error } = await supabase
      .from('beacon_games')
      .select(`
        *,
        beacons!inner(name),
        game_templates!inner(name, type),
        beacon_game_players(
          *,
          players!inner(username, avatar)
        )
      `)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching beacon games with details:', error);
      throw error;
    }

    // Transform the data to match our interface
    return data?.map(game => ({
      ...game,
      beacon_name: game.beacons.name,
      game_template_name: game.game_templates.name,
      game_template_type: game.game_templates.type,
      players: game.beacon_game_players.map((bgp: any) => ({
        ...bgp,
        player_username: bgp.players.username,
        player_avatar: bgp.players.avatar
      }))
    })) || [];
  }

  // Get a single beacon game by ID
  static async getById(id: string): Promise<BeaconGame | null> {
    const { data, error } = await supabase
      .from('beacon_games')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching beacon game:', error);
      throw error;
    }

    return data;
  }

  // Get beacon game with details by ID
  static async getWithDetailsById(id: string): Promise<BeaconGameWithDetails | null> {
    const { data, error } = await supabase
      .from('beacon_games')
      .select(`
        *,
        beacons!inner(name),
        game_templates!inner(name, type),
        beacon_game_players(
          *,
          players!inner(username, avatar)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching beacon game with details:', error);
      throw error;
    }

    return {
      ...data,
      beacon_name: data.beacons.name,
      game_template_name: data.game_templates.name,
      game_template_type: data.game_templates.type,
      players: data.beacon_game_players.map((bgp: any) => ({
        ...bgp,
        player_username: bgp.players.username,
        player_avatar: bgp.players.avatar
      }))
    };
  }

  // Create a new beacon game
  static async create(game: CreateBeaconGame): Promise<BeaconGame> {
    // Generate a unique ID for the beacon game (max 20 characters)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const gameId = `BG-${timestamp}-${random}`; // Format: BG-12345678-ABCD (19 chars)
    
    const gameWithId = {
      ...game,
      id: gameId
    };

    const { data, error } = await supabase
      .from('beacon_games')
      .insert([gameWithId])
      .select()
      .single();

    if (error) {
      console.error('Error creating beacon game:', error);
      throw error;
    }

    return data;
  }

  // Update an existing beacon game
  static async update(id: string, updates: UpdateBeaconGame): Promise<BeaconGame> {
    const { data, error } = await supabase
      .from('beacon_games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating beacon game:', error);
      throw error;
    }

    return data;
  }

  // Delete a beacon game
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('beacon_games')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting beacon game:', error);
      throw error;
    }
  }

  // Search and filter beacon games
  static async search(filters: BeaconGameFilters): Promise<BeaconGameWithDetails[]> {
    let queryBuilder = supabase
      .from('beacon_games')
      .select(`
        *,
        beacons!inner(name),
        game_templates!inner(name, type),
        beacon_game_players(
          *,
          players!inner(username, avatar)
        )
      `);

    if (filters.search) {
      queryBuilder = queryBuilder.or(`id.ilike.%${filters.search}%,beacons.name.ilike.%${filters.search}%,game_templates.name.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'all') {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }

    if (filters.beacon_id) {
      queryBuilder = queryBuilder.eq('beacon_id', filters.beacon_id);
    }

    if (filters.game_template_id) {
      queryBuilder = queryBuilder.eq('game_template_id', filters.game_template_id);
    }

    const { data, error } = await queryBuilder.order('start_time', { ascending: false });

    if (error) {
      console.error('Error searching beacon games:', error);
      throw error;
    }

    return data?.map(game => ({
      ...game,
      beacon_name: game.beacons.name,
      game_template_name: game.game_templates.name,
      game_template_type: game.game_templates.type,
      players: game.beacon_game_players.map((bgp: any) => ({
        ...bgp,
        player_username: bgp.players.username,
        player_avatar: bgp.players.avatar
      }))
    })) || [];
  }

  // Get active games
  static async getActive(): Promise<BeaconGameWithDetails[]> {
    return this.search({ status: 'Active' });
  }

  // Get completed games
  static async getCompleted(): Promise<BeaconGameWithDetails[]> {
    return this.search({ status: 'Completed' });
  }

  // Get cancelled games
  static async getCancelled(): Promise<BeaconGameWithDetails[]> {
    return this.search({ status: 'Cancelled' });
  }

  // Start a new game (create and add players)
  static async startGame(beaconId: string, gameTemplateId: number, playerIds: number[]): Promise<BeaconGameWithDetails> {
    // Create the game
    const game = await this.create({
      beacon_id: beaconId,
      game_template_id: gameTemplateId,
      status: 'Active'
    });

    // Add players to the game
    for (const playerId of playerIds) {
      await BeaconGamePlayersService.create({
        beacon_game_id: game.id,
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
  static async endGame(id: string, outcome: any, actualClip?: string): Promise<BeaconGame> {
    return this.update(id, {
      status: 'Completed',
      end_time: new Date().toISOString(),
      outcome,
      actual_clip: actualClip
    });
  }

  // Cancel a game
  static async cancelGame(id: string): Promise<BeaconGame> {
    return this.update(id, {
      status: 'Cancelled',
      end_time: new Date().toISOString()
    });
  }
}

// =====================================================
// BEACON GAME PLAYERS SERVICE
// =====================================================
export class BeaconGamePlayersService {
  // Get all beacon game players
  static async getAll(): Promise<BeaconGamePlayer[]> {
    const { data, error } = await supabase
      .from('beacon_game_players')
      .select('*')
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching beacon game players:', error);
      throw error;
    }

    return data || [];
  }

  // Get players for a specific game
  static async getByGameId(gameId: string): Promise<BeaconGamePlayerWithDetails[]> {
    const { data, error } = await supabase
      .from('beacon_game_players')
      .select(`
        *,
        players!inner(username, avatar)
      `)
      .eq('beacon_game_id', gameId)
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

  // Create a new beacon game player
  static async create(player: CreateBeaconGamePlayer): Promise<BeaconGamePlayer> {
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
      .from('beacon_game_players')
      .insert([player])
      .select()
      .single();

    if (error) {
      console.error('Error creating beacon game player:', error);
      throw error;
    }

    return data;
  }

  // Update a beacon game player
  static async update(id: number, updates: UpdateBeaconGamePlayer): Promise<BeaconGamePlayer> {
    const { data, error } = await supabase
      .from('beacon_game_players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating beacon game player:', error);
      throw error;
    }

    return data;
  }

  // Remove a player from a game
  static async remove(id: number): Promise<void> {
    const { error } = await supabase
      .from('beacon_game_players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error removing beacon game player:', error);
      throw error;
    }
  }

  // Set player outcome
  static async setOutcome(id: number, outcome: 'win' | 'eliminated' | 'forfeit'): Promise<BeaconGamePlayer> {
    return this.update(id, {
      player_outcome: outcome
    });
  }
}
