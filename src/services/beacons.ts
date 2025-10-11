import { supabase } from '../lib/supabase';
import { Beacon, CreateBeacon, UpdateBeacon, BeaconDetails, BeaconFilters } from '../types';

export class BeaconsService {
  // Get all beacons
  static async getAll(): Promise<Beacon[]> {
    const { data, error } = await supabase
      .from('beacons')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching beacons:', error);
      throw error;
    }

    return data || [];
  }

  // Get beacon details with game template info and active games count
  static async getDetails(): Promise<BeaconDetails[]> {
    const { data, error } = await supabase
      .from('beacon_details')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching beacon details:', error);
      throw error;
    }

    return data || [];
  }

  // Get a single beacon by ID
  static async getById(id: string): Promise<Beacon | null> {
    const { data, error } = await supabase
      .from('beacons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching beacon:', error);
      throw error;
    }

    return data;
  }

  // Get beacon details by ID
  static async getDetailsById(id: string): Promise<BeaconDetails | null> {
    const { data, error } = await supabase
      .from('beacon_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching beacon details:', error);
      throw error;
    }

    return data;
  }

  // Generate next beacon ID
  static async generateNextId(): Promise<string> {
    const { data, error } = await supabase
      .from('beacons')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last beacon ID:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return 'B-000001';
    }

    const lastId = data[0].id;
    const match = lastId.match(/^B-(\d+)$/);
    
    if (match) {
      const lastNumber = parseInt(match[1], 10);
      const nextNumber = lastNumber + 1;
      return `B-${nextNumber.toString().padStart(6, '0')}`;
    }

    // If no match, start from 1
    return 'B-000001';
  }

  // Create a new beacon
  static async create(beacon: CreateBeacon): Promise<Beacon> {
    const id = await this.generateNextId();
    const beaconWithId = { ...beacon, id };
    
    const { data, error } = await supabase
      .from('beacons')
      .insert([beaconWithId])
      .select()
      .single();

    if (error) {
      console.error('Error creating beacon:', error);
      throw error;
    }

    return data;
  }

  // Update an existing beacon
  static async update(id: string, updates: UpdateBeacon): Promise<Beacon> {
    const { data, error } = await supabase
      .from('beacons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating beacon:', error);
      throw error;
    }

    return data;
  }

  // Delete a beacon
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('beacons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting beacon:', error);
      throw error;
    }
  }

  // Search and filter beacons
  static async search(filters: BeaconFilters): Promise<BeaconDetails[]> {
    let queryBuilder = supabase
      .from('beacon_details')
      .select('*');

    if (filters.search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
    }

    if (filters.active !== undefined) {
      queryBuilder = queryBuilder.eq('active', filters.active);
    }

    const { data, error } = await queryBuilder.order('id');

    if (error) {
      console.error('Error searching beacons:', error);
      throw error;
    }

    return data || [];
  }

  // Get active beacons
  static async getActive(): Promise<BeaconDetails[]> {
    const { data, error } = await supabase
      .from('beacon_details')
      .select('*')
      .eq('active', true)
      .order('id');

    if (error) {
      console.error('Error fetching active beacons:', error);
      throw error;
    }

    return data || [];
  }

  // Get inactive beacons
  static async getInactive(): Promise<BeaconDetails[]> {
    const { data, error } = await supabase
      .from('beacon_details')
      .select('*')
      .eq('active', false)
      .order('id');

    if (error) {
      console.error('Error fetching inactive beacons:', error);
      throw error;
    }

    return data || [];
  }

  // Activate a beacon
  static async activate(id: string): Promise<Beacon> {
    return this.update(id, { active: true });
  }

  // Deactivate a beacon
  static async deactivate(id: string): Promise<Beacon> {
    return this.update(id, { active: false });
  }

  // Assign game template to beacon (this would be handled through beacon_games table)
  static async assignTemplate(id: string, gameTemplateId: number): Promise<Beacon> {
    console.log('Assigning template to beacon:', id, 'template:', gameTemplateId);
    return this.update(id, { game_template_id: gameTemplateId });
  }

  // Remove game template from beacon
  static async removeTemplate(id: string): Promise<Beacon> {
    console.log('Removing template from beacon:', id);
    return this.update(id, { game_template_id: null });
  }

  // Get beacons with active games
  static async getWithActiveGames(): Promise<BeaconDetails[]> {
    const { data, error } = await supabase
      .from('beacon_details')
      .select('*')
      .gt('active_games_count', 0)
      .order('active_games_count', { ascending: false });

    if (error) {
      console.error('Error fetching beacons with active games:', error);
      throw error;
    }

    return data || [];
  }
}
