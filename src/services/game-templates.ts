import { supabase } from '../lib/supabase';
import { GameTemplate, CreateGameTemplate, UpdateGameTemplate, GameTemplateFilters } from '../types';

export class GameTemplatesService {
  // Get all game templates
  static async getAll(): Promise<GameTemplate[]> {
    const { data, error } = await supabase
      .from('game_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching game templates:', error);
      throw error;
    }

    return data || [];
  }

  // Get a single game template by ID
  static async getById(id: number): Promise<GameTemplate | null> {
    const { data, error } = await supabase
      .from('game_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching game template:', error);
      throw error;
    }

    return data;
  }

  // Create a new game template
  static async create(template: CreateGameTemplate): Promise<GameTemplate> {
    const { data, error } = await supabase
      .from('game_templates')
      .insert([template])
      .select()
      .single();

    if (error) {
      console.error('Error creating game template:', error);
      throw error;
    }

    return data;
  }

  // Update an existing game template
  static async update(id: number, updates: UpdateGameTemplate): Promise<GameTemplate> {
    console.log('Updating game template:', id, 'with updates:', updates);
    
    const { data, error } = await supabase
      .from('game_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    console.log('Update response:', { data, error });

    if (error) {
      console.error('Error updating game template:', error);
      throw error;
    }

    return data;
  }

  // Delete a game template
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('game_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting game template:', error);
      throw error;
    }
  }

  // Increment usage count
  static async incrementUsage(id: number): Promise<void> {
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: id
    });

    if (error) {
      console.error('Error incrementing usage count:', error);
      throw error;
    }
  }

  // Search and filter game templates
  static async search(filters: GameTemplateFilters): Promise<GameTemplate[]> {
    let queryBuilder = supabase
      .from('game_templates')
      .select('*');

    if (filters.search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.type && filters.type !== 'all') {
      queryBuilder = queryBuilder.eq('type', filters.type);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching game templates:', error);
      throw error;
    }

    return data || [];
  }

  // Get popular templates (most used)
  static async getPopular(limit: number = 10): Promise<GameTemplate[]> {
    const { data, error } = await supabase
      .from('game_templates')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular templates:', error);
      throw error;
    }

    return data || [];
  }
}
