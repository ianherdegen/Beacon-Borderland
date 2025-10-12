import { supabase } from '../lib/supabase';
import { Player } from '../types';

export class UserPlayerConnectionService {
  /**
   * Connect an existing player to a user (admin only)
   */
  static async connectPlayerToUser(playerId: number, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('connect_player_to_user', {
        p_player_id: playerId,
        p_user_id: userId
      });

      if (error) {
        console.error('Error connecting player to user:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in connectPlayerToUser:', error);
      return false;
    }
  }

  /**
   * Get the current user's player profile
   */
  static async getCurrentUserPlayer(): Promise<Player | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.getPlayerByUserId(user.id);
    } catch (error) {
      console.error('Error in getCurrentUserPlayer:', error);
      return null;
    }
  }

  /**
   * Get player profile by user ID
   */
  static async getPlayerByUserId(userId: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase.rpc('get_player_by_user_id', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error getting player for user:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error in getPlayerByUserId:', error);
      return null;
    }
  }

  /**
   * Check if current user has a player profile
   */
  static async hasPlayerProfile(): Promise<boolean> {
    const player = await this.getCurrentUserPlayer();
    return player !== null;
  }

  /**
   * Update current user's player profile
   */
  static async updateCurrentUserPlayer(updates: Partial<Player>): Promise<Player | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating player profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCurrentUserPlayer:', error);
      return null;
    }
  }

  /**
   * Get player by user ID (for admin purposes)
   */
  static async getPlayerByUserId(userId: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase.rpc('get_player_by_user_id', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error getting player by user ID:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error in getPlayerByUserId:', error);
      return null;
    }
  }
}
