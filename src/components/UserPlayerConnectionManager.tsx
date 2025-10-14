import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Link, Unlink, Search, Mail, Gamepad2 } from 'lucide-react';
import { UserPlayerConnectionService } from '../services/user-player-connection';
import { PlayersService } from '../services/players';
import { Player } from '../types';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabase-admin';

interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
}

export function UserPlayerConnectionManager() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [supabaseUsers, setSupabaseUsers] = useState<SupabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load players
      const playersData = await PlayersService.getAll();
      setPlayers(playersData);

      // Load real Supabase users using admin API
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) {
        console.error('Admin API error:', error);
        toast.error('Failed to load users - check service role key');
        setSupabaseUsers([]);
      } else {
        console.log('Successfully loaded real users:', users.users);
        setSupabaseUsers(users.users || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectUserToPlayer = async () => {
    if (!selectedPlayer || !selectedUser) {
      toast.error('Please select both a player and a user');
      return;
    }

    setConnecting(true);
    try {
      const { error } = await supabase
        .from('players')
        .update({ user_id: selectedUser })
        .eq('id', selectedPlayer);

      if (error) {
        console.error('Error connecting user to player:', error);
        toast.error('Failed to connect user to player');
      } else {
        toast.success('User connected to player successfully!');
        await loadData(); // Reload data
        setSelectedPlayer('');
        setSelectedUser('');
      }
    } catch (error) {
      console.error('Error in handleConnectUserToPlayer:', error);
      toast.error('Failed to connect user to player');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectUserFromPlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ user_id: null })
        .eq('id', playerId);

      if (error) {
        console.error('Error disconnecting user from player:', error);
        toast.error('Failed to disconnect user from player');
      } else {
        toast.success('User disconnected from player successfully!');
        await loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error in handleDisconnectUserFromPlayer:', error);
      toast.error('Failed to disconnect user from player');
    }
  };

  // Filter players based on search term
  const filteredPlayers = players.filter(player =>
    player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.user_id && supabaseUsers.find(u => u.id === player.user_id)?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get available users (not already connected)
  const connectedUserIds = players.filter(p => p.user_id).map(p => p.user_id);
  const availableUsers = supabaseUsers.filter(user => !connectedUserIds.includes(user.id));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#e63946]/10 flex items-center justify-center">
            <Link className="h-5 w-5 text-[#e63946]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">User-Player Connections</h1>
            <p className="text-gray-400">Manage connections between users and players</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#e63946]/10 flex items-center justify-center">
          <Link className="h-5 w-5 text-[#e63946]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">User-Player Connections</h1>
          <p className="text-gray-400">Manage connections between users and players</p>
        </div>
      </div>

      {/* Connection Form */}
      <Card className="bg-[#0f0f0f] border-gray-800">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Connect User to Player</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <Label htmlFor="player-select" className="text-white">Select Player</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white focus:border-[#e63946]">
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 p-2">
                  {players.filter(p => !p.user_id).length > 0 ? (
                    players.filter(p => !p.user_id).map(player => (
                      <SelectItem 
                        key={player.id} 
                        value={player.id.toString()}
                        className="text-white hover:bg-gray-800 focus:bg-gray-800 px-3 py-2 rounded cursor-pointer"
                      >
                        {player.username} ({player.status})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-players" disabled className="text-gray-500 px-3 py-2 rounded">
                      No available players
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="user-select" className="text-white">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white focus:border-[#e63946]">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 p-2">
                  {availableUsers.length > 0 ? (
                    availableUsers.map(user => (
                      <SelectItem 
                        key={user.id} 
                        value={user.id}
                        className="text-white hover:bg-gray-800 focus:bg-gray-800 px-3 py-2 rounded cursor-pointer"
                      >
                        {user.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-users" disabled className="text-gray-500 px-3 py-2 rounded">
                      No available users
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleConnectUserToPlayer}
            disabled={connecting || !selectedPlayer || !selectedUser}
            className="bg-[#e63946] hover:bg-[#e63946]/80"
          >
            <Link className="h-4 w-4 mr-2" />
            {connecting ? 'Connecting...' : 'Connect User to Player'}
          </Button>

        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search players or users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-700 text-white"
        />
      </div>

      {/* Players List */}
      <div className="space-y-3">
        {filteredPlayers.map(player => {
          const connectedUser = supabaseUsers.find(u => u.id === player.user_id);
          
          return (
            <Card key={player.id} className="bg-[#0f0f0f] border-gray-800 hover:border-gray-700 transition-colors">
              <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Player Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-[#e63946]/20 flex items-center justify-center flex-shrink-0">
                      {player.avatar ? (
                        <span className="text-[#e63946] font-bold text-lg">
                          {player.avatar}
                        </span>
                      ) : (
                        <Gamepad2 className="h-6 w-6 text-[#e63946]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">{player.username}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          player.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          player.status === 'Eliminated' ? 'bg-red-500/20 text-red-400' :
                          player.status === 'Forfeit' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {player.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Joined: {new Date(player.join_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Connection Status */}
                  <div className="lg:text-right">
                    {connectedUser ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-400 lg:justify-end">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">Connected</span>
                        </div>
                        <p className="text-sm text-gray-400 break-all lg:break-normal">{connectedUser.email}</p>
                        <p className="text-xs text-gray-500">
                          Connected: {new Date(connectedUser.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 lg:justify-end">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Not connected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400">
            {searchTerm ? 'No players found matching your search.' : 'No available players.'}
          </div>
        </div>
      )}
    </div>
  );
}
