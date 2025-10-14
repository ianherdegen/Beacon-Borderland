// =====================================================
// BORDERLAND - TYPESCRIPT TYPES
// =====================================================

// =====================================================
// 1. GAME TEMPLATES
// =====================================================
export interface GameTemplate {
  id: number;
  name: string;
  type: 'Solo' | 'Versus' | 'Group';
  thumbnail: string | null;
  explainer_clip: string | null;
  created_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGameTemplate {
  name: string;
  type: 'Solo' | 'Versus' | 'Group';
  thumbnail?: string;
  explainer_clip?: string;
  description: string;
}

export interface UpdateGameTemplate {
  name?: string;
  type?: 'Solo' | 'Versus' | 'Group';
  thumbnail?: string;
  explainer_clip?: string;
  description?: string;
}

// =====================================================
// 2. PLAYERS
// =====================================================
export interface Player {
  id: number;
  username: string;
  status: 'Active' | 'Eliminated' | 'Forfeit';
  last_game_at: string | null;
  join_date: string;
  avatar: string | null;
  bio: string | null;
  user_id: string | null; // UUID from Supabase auth.users
  created_at: string;
  updated_at: string;
}

export interface CreatePlayer {
  username: string;
  status?: 'Active' | 'Eliminated' | 'Forfeit';
  avatar?: string;
  bio?: string;
}

export interface UpdatePlayer {
  username?: string;
  status?: 'Active' | 'Eliminated' | 'Forfeit';
  avatar?: string;
  bio?: string;
}

export interface PlayerStats extends Player {
  games_last_7_days: number;
}

// =====================================================
// 3. BEACONS
// =====================================================
export interface Arena {
  id: string;
  name: string;
  address: string | null;
  active: boolean;
  game_template_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateArena {
  id?: string;
  name: string;
  address: string;
  active?: boolean;
  game_template_id?: number;
}

export interface UpdateArena {
  name?: string;
  address?: string;
  active?: boolean;
  game_template_id?: number | null;
}

export interface ArenaDetails extends Arena {
  active_games_count: number;
}

// =====================================================
// 4. BEACON GAMES
// =====================================================
export interface GameOutcome {
  result?: 'won' | 'eliminated';
  winners?: string[]; // Now stores player IDs as strings instead of usernames
  eliminated?: string[]; // Now stores player IDs as strings instead of usernames
}

export interface ArenaGame {
  id: string;
  arena_id: string;
  game_template_id: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  start_time: string;
  end_time: string | null;
  outcome: GameOutcome | null;
  actual_clip: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateArenaGame {
  arena_id: string;
  game_template_id: number;
  status?: 'Active' | 'Completed' | 'Cancelled';
}

export interface UpdateArenaGame {
  status?: 'Active' | 'Completed' | 'Cancelled';
  end_time?: string;
  outcome?: GameOutcome;
  actual_clip?: string;
}

export interface ArenaGameWithDetails extends ArenaGame {
  arena_name: string;
  game_template_name: string;
  game_template_type: string;
  players: ArenaGamePlayer[];
}

// =====================================================
// 5. BEACON GAME PLAYERS
// =====================================================
export interface ArenaGamePlayer {
  id: number;
  arena_game_id: string;
  player_id: number;
  player_outcome: 'win' | 'eliminated' | 'forfeit' | null;
  joined_at: string;
}

export interface CreateArenaGamePlayer {
  arena_game_id: string;
  player_id: number;
  player_outcome?: 'win' | 'eliminated' | 'forfeit';
}

export interface UpdateArenaGamePlayer {
  player_outcome?: 'win' | 'eliminated' | 'forfeit';
}

export interface ArenaGamePlayerWithDetails extends ArenaGamePlayer {
  player_username: string;
  player_avatar: string | null;
}


// =====================================================
// 7. API RESPONSE TYPES
// =====================================================
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// =====================================================
// 8. SEARCH AND FILTER TYPES
// =====================================================
export interface GameTemplateFilters {
  type?: 'Solo' | 'Versus' | 'Group' | 'all';
  search?: string;
}

export interface PlayerFilters {
  status?: 'Active' | 'Eliminated' | 'Forfeit' | 'all';
  search?: string;
}

export interface ArenaFilters {
  active?: boolean;
  search?: string;
}

export interface ArenaGameFilters {
  status?: 'Active' | 'Completed' | 'Cancelled' | 'all';
  arena_id?: string;
  game_template_id?: number;
  search?: string;
}


// =====================================================
// 9. DASHBOARD STATISTICS
// =====================================================
export interface DashboardStats {
  total_players: number;
  active_players: number;
  total_arenas: number;
  active_arenas: number;
  total_games: number;
  active_games: number;
  total_templates: number;
  recent_activity: {
    recent_games: ArenaGameWithDetails[];
    top_players: PlayerStats[];
    popular_templates: GameTemplate[];
  };
}

// =====================================================
// 10. FORM TYPES
// =====================================================
export interface GameTemplateForm {
  name: string;
  type: 'Solo' | 'Versus' | 'Group';
  description: string;
  thumbnail: string;
  explainer_clip: string;
  duration: string;
  min_players: number;
  max_players: number;
}

export interface PlayerForm {
  username: string;
  avatar: string;
  bio: string;
}

export interface ArenaForm {
  id: string;
  name: string;
  address: string;
}

