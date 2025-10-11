import { supabase } from '../lib/supabase';
import { Arena, CreateArena, UpdateArena, ArenaDetails, ArenaFilters } from '../types';

export class ArenasService {
  // Get all arenas
  static async getAll(): Promise<Arena[]> {
    const { data, error } = await supabase
      .from('arenas')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching arenas:', error);
      throw error;
    }

    return data || [];
  }

  // Get arena details with game template info and active games count
  static async getDetails(): Promise<ArenaDetails[]> {
    const { data, error } = await supabase
      .from('arena_details')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching arena details:', error);
      throw error;
    }

    return data || [];
  }

  // Get a single arena by ID
  static async getById(id: string): Promise<Arena | null> {
    const { data, error } = await supabase
      .from('arenas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching arena:', error);
      throw error;
    }

    return data;
  }

  // Get arena details by ID
  static async getDetailsById(id: string): Promise<ArenaDetails | null> {
    const { data, error } = await supabase
      .from('arena_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching arena details:', error);
      throw error;
    }

    return data;
  }

  // Generate next arena ID
  static async generateNextId(): Promise<string> {
    const { data, error } = await supabase
      .from('arenas')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last arena ID:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return 'A-000001';
    }

    const lastId = data[0].id;
    const match = lastId.match(/^A-(\d+)$/);
    
    if (match) {
      const lastNumber = parseInt(match[1], 10);
      const nextNumber = lastNumber + 1;
      return `A-${nextNumber.toString().padStart(6, '0')}`;
    }

    // If no match, start from 1
    return 'A-000001';
  }

  // Create a new arena
  static async create(arena: CreateArena): Promise<Arena> {
    const id = await this.generateNextId();
    const arenaWithId = { ...arena, id };
    
    const { data, error } = await supabase
      .from('arenas')
      .insert([arenaWithId])
      .select()
      .single();

    if (error) {
      console.error('Error creating arena:', error);
      throw error;
    }

    return data;
  }

  // Update an existing arena
  static async update(id: string, updates: UpdateArena): Promise<Arena> {
    const { data, error } = await supabase
      .from('arenas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating arena:', error);
      throw error;
    }

    return data;
  }

  // Delete a arena
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('arenas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting arena:', error);
      throw error;
    }
  }

  // Search and filter arenas
  static async search(filters: ArenaFilters): Promise<ArenaDetails[]> {
    let queryBuilder = supabase
      .from('arena_details')
      .select('*');

    if (filters.search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
    }

    if (filters.active !== undefined) {
      queryBuilder = queryBuilder.eq('active', filters.active);
    }

    const { data, error } = await queryBuilder.order('id');

    if (error) {
      console.error('Error searching arenas:', error);
      throw error;
    }

    return data || [];
  }

  // Get active arenas
  static async getActive(): Promise<ArenaDetails[]> {
    const { data, error } = await supabase
      .from('arena_details')
      .select('*')
      .eq('active', true)
      .order('id');

    if (error) {
      console.error('Error fetching active arenas:', error);
      throw error;
    }

    return data || [];
  }

  // Get inactive arenas
  static async getInactive(): Promise<ArenaDetails[]> {
    const { data, error } = await supabase
      .from('arena_details')
      .select('*')
      .eq('active', false)
      .order('id');

    if (error) {
      console.error('Error fetching inactive arenas:', error);
      throw error;
    }

    return data || [];
  }

  // Activate a arena
  static async activate(id: string): Promise<Arena> {
    return this.update(id, { active: true });
  }

  // Deactivate a arena
  static async deactivate(id: string): Promise<Arena> {
    return this.update(id, { active: false });
  }

  // Assign game template to arena (this would be handled through arena_games table)
  static async assignTemplate(id: string, gameTemplateId: number): Promise<Arena> {
    console.log('Assigning template to arena:', id, 'template:', gameTemplateId);
    return this.update(id, { game_template_id: gameTemplateId });
  }

  // Remove game template from arena
  static async removeTemplate(id: string): Promise<Arena> {
    console.log('Removing template from arena:', id);
    return this.update(id, { game_template_id: null });
  }

  // Get arenas with active games
  static async getWithActiveGames(): Promise<ArenaDetails[]> {
    const { data, error } = await supabase
      .from('arena_details')
      .select('*')
      .gt('active_games_count', 0)
      .order('active_games_count', { ascending: false });

    if (error) {
      console.error('Error fetching arenas with active games:', error);
      throw error;
    }

    return data || [];
  }
}
