// =====================================================
// BORDERLAND MAKE - SERVICES INDEX
// =====================================================

// Export all services
export { GameTemplatesService } from './game-templates';
export { PlayersService } from './players';
export { BeaconsService } from './beacons';
export { BeaconGamesService, BeaconGamePlayersService } from './beacon-games';
export { DashboardService } from './dashboard';

// Re-export types for convenience
export type {
  GameTemplate,
  CreateGameTemplate,
  UpdateGameTemplate,
  Player,
  CreatePlayer,
  UpdatePlayer,
  PlayerStats,
  Beacon,
  CreateBeacon,
  UpdateBeacon,
  BeaconDetails,
  BeaconGame,
  CreateBeaconGame,
  UpdateBeaconGame,
  BeaconGameWithDetails,
  BeaconGamePlayer,
  CreateBeaconGamePlayer,
  UpdateBeaconGamePlayer,
  BeaconGamePlayerWithDetails,
  DashboardStats,
  GameTemplateFilters,
  PlayerFilters,
  BeaconFilters,
  BeaconGameFilters,
} from '../types';
