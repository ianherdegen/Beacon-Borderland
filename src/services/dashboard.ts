import { supabase } from '../lib/supabase';
import { DashboardStats, BeaconGameWithDetails, PlayerStats, GameTemplate } from '../types';
import { BeaconGamesService } from './beacon-games';
import { PlayersService } from './players';
import { GameTemplatesService } from './game-templates';

export class DashboardService {
  // Get comprehensive dashboard statistics
  static async getStats(): Promise<DashboardStats> {
    try {
      // Get basic counts
      const [
        playersCount,
        activePlayersCount,
        beaconsCount,
        activeBeaconsCount,
        gamesCount,
        activeGamesCount,
        templatesCount
      ] = await Promise.all([
        this.getTotalPlayers(),
        this.getActivePlayersCount(),
        this.getTotalBeacons(),
        this.getActiveBeaconsCount(),
        this.getTotalGames(),
        this.getActiveGamesCount(),
        this.getTotalTemplates()
      ]);

      // Get recent activity
      const recentActivity = await this.getRecentActivity();

      return {
        total_players: playersCount,
        active_players: activePlayersCount,
        total_beacons: beaconsCount,
        active_beacons: activeBeaconsCount,
        total_games: gamesCount,
        active_games: activeGamesCount,
        total_templates: templatesCount,
        recent_activity: recentActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get total players count
  private static async getTotalPlayers(): Promise<number> {
    const { count, error } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total players count:', error);
      throw error;
    }

    return count || 0;
  }

  // Get active players count
  private static async getActivePlayersCount(): Promise<number> {
    const { count, error } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    if (error) {
      console.error('Error fetching active players count:', error);
      throw error;
    }

    return count || 0;
  }

  // Get total beacons count
  private static async getTotalBeacons(): Promise<number> {
    const { count, error } = await supabase
      .from('beacons')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total beacons count:', error);
      throw error;
    }

    return count || 0;
  }

  // Get active beacons count
  private static async getActiveBeaconsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('beacons')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (error) {
      console.error('Error fetching active beacons count:', error);
      throw error;
    }

    return count || 0;
  }

  // Get total games count
  private static async getTotalGames(): Promise<number> {
    const { count, error } = await supabase
      .from('beacon_games')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total games count:', error);
      throw error;
    }

    return count || 0;
  }

  // Get active games count
  private static async getActiveGamesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('beacon_games')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    if (error) {
      console.error('Error fetching active games count:', error);
      throw error;
    }

    return count || 0;
  }

  // Get total templates count
  private static async getTotalTemplates(): Promise<number> {
    const { count, error } = await supabase
      .from('game_templates')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching total templates count:', error);
      throw error;
    }

    return count || 0;
  }

  // Get recent activity data
  private static async getRecentActivity(): Promise<{
    recent_games: BeaconGameWithDetails[];
    top_players: PlayerStats[];
    popular_templates: GameTemplate[];
  }> {
    try {
      const [recentGames, topPlayers, popularTemplates] = await Promise.all([
        this.getRecentGames(),
        this.getTopPlayers(),
        this.getPopularTemplates()
      ]);

      return {
        recent_games: recentGames,
        top_players: topPlayers,
        popular_templates: popularTemplates
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  // Get recent games (last 10)
  private static async getRecentGames(): Promise<BeaconGameWithDetails[]> {
    try {
      return await BeaconGamesService.getWithDetails();
    } catch (error) {
      console.error('Error fetching recent games:', error);
      return [];
    }
  }

  // Get top players by creation date
  private static async getTopPlayers(): Promise<PlayerStats[]> {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching top players:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching top players:', error);
      return [];
    }
  }

  // Get popular templates (most used)
  private static async getPopularTemplates(): Promise<GameTemplate[]> {
    try {
      return await GameTemplatesService.getPopular(10);
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      return [];
    }
  }

  // Get games by status
  static async getGamesByStatus(): Promise<{
    active: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('beacon_games')
        .select('status');

      if (error) {
        console.error('Error fetching games by status:', error);
        throw error;
      }

      const statusCounts = data?.reduce((acc, game) => {
        acc[game.status.toLowerCase()] = (acc[game.status.toLowerCase()] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        active: statusCounts.active || 0,
        completed: statusCounts.completed || 0,
        cancelled: statusCounts.cancelled || 0
      };
    } catch (error) {
      console.error('Error fetching games by status:', error);
      throw error;
    }
  }

  // Get player status distribution
  static async getPlayerStatusDistribution(): Promise<{
    active: number;
    eliminated: number;
    forfeit: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('status');

      if (error) {
        console.error('Error fetching player status distribution:', error);
        throw error;
      }

      const statusCounts = data?.reduce((acc, player) => {
        acc[player.status.toLowerCase()] = (acc[player.status.toLowerCase()] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        active: statusCounts.active || 0,
        eliminated: statusCounts.eliminated || 0,
        forfeit: statusCounts.forfeit || 0
      };
    } catch (error) {
      console.error('Error fetching player status distribution:', error);
      throw error;
    }
  }

  // Get beacon activity
  static async getBeaconActivity(): Promise<{
    active: number;
    inactive: number;
    with_games: number;
  }> {
    try {
      const [activeCount, inactiveCount, withGamesCount] = await Promise.all([
        this.getActiveBeaconsCount(),
        this.getInactiveBeaconsCount(),
        this.getBeaconsWithGamesCount()
      ]);

      return {
        active: activeCount,
        inactive: inactiveCount,
        with_games: withGamesCount
      };
    } catch (error) {
      console.error('Error fetching beacon activity:', error);
      throw error;
    }
  }

  // Get inactive beacons count
  private static async getInactiveBeaconsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('beacons')
      .select('*', { count: 'exact', head: true })
      .eq('active', false);

    if (error) {
      console.error('Error fetching inactive beacons count:', error);
      throw error;
    }

    return count || 0;
  }

  // Get beacons with active games count
  private static async getBeaconsWithGamesCount(): Promise<number> {
    const { data, error } = await supabase
      .from('beacon_details')
      .select('active_games_count')
      .gt('active_games_count', 0);

    if (error) {
      console.error('Error fetching beacons with games count:', error);
      throw error;
    }

    return data?.length || 0;
  }

  // Get recent activity timeline (last 7 days)
  static async getActivityTimeline(): Promise<{
    date: string;
    games_started: number;
    games_completed: number;
    players_joined: number;
  }[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('beacon_games')
        .select('start_time, end_time, status')
        .gte('start_time', sevenDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching activity timeline:', error);
        throw error;
      }

      // Group by date and count activities
      const timeline: Record<string, { games_started: number; games_completed: number; players_joined: number }> = {};

      data?.forEach(game => {
        const date = new Date(game.start_time).toISOString().split('T')[0];
        if (!timeline[date]) {
          timeline[date] = { games_started: 0, games_completed: 0, players_joined: 0 };
        }
        timeline[date].games_started++;
        if (game.status === 'Completed' && game.end_time) {
          timeline[date].games_completed++;
        }
      });

      // Convert to array and sort by date
      return Object.entries(timeline)
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      throw error;
    }
  }
}
