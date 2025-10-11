import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Users, Radio, Gamepad2, UserCheck, UserX, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { PlayersService } from '../services/players';
import { BeaconsService } from '../services/beacons';
import { BeaconGamesService } from '../services/beacon-games';
import { Player } from '../types';
import { supabase } from '../lib/supabase';


interface OverviewPageProps {
  onNavigate?: (page: string) => void;
}

export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [beacons, setBeacons] = useState<any[]>([]);
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [beaconGamePlayers, setBeaconGamePlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching overview data...');
        
        // Fetch beacon game players data
        const { data: beaconGamePlayersData, error: beaconGamePlayersError } = await supabase
          .from('beacon_game_players')
          .select('player_id, player_outcome');
        
        if (beaconGamePlayersError) {
          console.error('Error fetching beacon game players:', beaconGamePlayersError);
          throw beaconGamePlayersError;
        }
        
        const [playersData, beaconsData, activeGamesData] = await Promise.all([
          PlayersService.getAll(),
          BeaconsService.getAll(),
          BeaconGamesService.getWithDetails()
        ]);
        
        console.log('Fetched players:', playersData);
        console.log('Fetched beacons:', beaconsData);
        console.log('Fetched active games:', activeGamesData);
        console.log('Fetched beacon game players:', beaconGamePlayersData);
        
        setPlayers(playersData);
        setBeacons(beaconsData);
        setActiveGames(activeGamesData);
        setBeaconGamePlayers(beaconGamePlayersData || []);
        
      } catch (err: any) {
        console.error('Error fetching overview data:', err);
        setError(err?.message || 'Failed to load overview data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate player statistics
  const totalPlayers = players.length;
  const activePlayers = players.filter(p => p.status === 'Active').length;
  const eliminatedPlayers = players.filter(p => p.status === 'Eliminated' || p.status === 'Forfeit').length;

  // Calculate beacon and game statistics
  const activeBeacons = beacons.filter(b => b.active).length;
  const totalActiveGames = activeGames.filter(g => g.status === 'Active').length;

  // Calculate player wins from beacon_game_players
  const calculatePlayerWins = (playerId: number) => {
    return beaconGamePlayers.filter(
      bgp => bgp.player_id === playerId && bgp.player_outcome === 'win'
    ).length;
  };

  // Calculate player total games from beacon_game_players
  const calculatePlayerTotalGames = (playerId: number) => {
    return beaconGamePlayers.filter(
      bgp => bgp.player_id === playerId
    ).length;
  };

  // Get top 5 active players with their actual wins and total games
  const topActivePlayers = players
    .filter(p => p.status === 'Active')
    .map(player => ({
      ...player,
      wins: calculatePlayerWins(player.id),
      totalGames: calculatePlayerTotalGames(player.id)
    }))
    .sort((a, b) => b.wins - a.wins) // Sort by wins descending
    .slice(0, 5);


  // Updated stats cards with real data
  const statsCards = [
    { label: 'Total Players', value: totalPlayers.toString(), icon: Users, color: 'blue', change: 'Real data' },
    { label: 'Active Players', value: activePlayers.toString(), icon: UserCheck, color: 'blue', change: totalPlayers > 0 ? `${Math.round((activePlayers / totalPlayers) * 100)}% of total` : '0%' },
    { label: 'Eliminated Players', value: eliminatedPlayers.toString(), icon: UserX, color: 'magenta', change: totalPlayers > 0 ? `${Math.round((eliminatedPlayers / totalPlayers) * 100)}% of total` : '0%' },
    { label: 'Active Beacons', value: activeBeacons.toString(), icon: Radio, color: 'blue', change: beacons.length > 0 ? `${Math.round((activeBeacons / beacons.length) * 100)}% of total` : '0%' },
    { label: 'Active Games', value: totalActiveGames.toString(), icon: Gamepad2, color: 'magenta', change: 'Currently running' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-white mb-2">Overview</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#00d9ff]" />
            <span className="text-gray-400">Loading overview data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-white mb-2">Overview</h1>
        </div>
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90 px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-white mb-2">Overview</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-gray-900 border-gray-800 hover:border-[--neon-blue]/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <stat.icon
                  className={`h-5 w-5 text-[--neon-${stat.color}]`}
                  style={{
                    color: stat.color === 'blue' ? '#00d9ff' : '#ff00ff',
                    filter: `drop-shadow(0 0 6px ${stat.color === 'blue' ? 'rgba(0, 217, 255, 0.6)' : 'rgba(255, 0, 255, 0.6)'})`,
                  }}
                />
              </div>
              <p className="text-white text-3xl">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Summary Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Players */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#00d9ff]" />
                <h3 className="text-white">
                  Top {Math.min(topActivePlayers.length, 5)} Active Players
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('players')}
                className="text-[#00d9ff] hover:text-[#00d9ff]/80 hover:bg-[#00d9ff]/10 text-xs"
              >
                See All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Player</TableHead>
                  <TableHead className="text-gray-400">Wins</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topActivePlayers.map((player, index) => (
                  <TableRow key={index} className="border-gray-800">
                    <TableCell className="text-white">{player.username}</TableCell>
                    <TableCell className="text-[#00d9ff]">{player.wins}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          player.status === 'Active'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-red-500/20 text-red-400 border-red-500/50'
                        }
                      >
                        {player.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Active Beacons */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-[#ff00ff]" />
                <h3 className="text-white">Active Beacons</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate?.('beacons')}
                className="text-[#00d9ff] hover:text-[#00d9ff]/80 hover:bg-[#00d9ff]/10 text-xs"
              >
                See All
              </Button>
            </div>
            <div className="space-y-3">
              {beacons
                .filter(beacon => beacon.active)
                .slice(0, 3)
                .map((beacon) => (
                  <div key={beacon.id} className="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#00d9ff]" style={{ boxShadow: '0 0 10px rgba(0, 217, 255, 0.8)' }} />
                      <div>
                        <p className="text-white text-sm font-medium">{beacon.name}</p>
                        <p className="text-gray-400 text-xs">{beacon.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">{beacon.address || 'No address'}</p>
                    </div>
                  </div>
                ))}
              {beacons.filter(beacon => beacon.active).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">📡</div>
                  <p className="text-gray-400 text-sm">No active beacons</p>
                  <p className="text-gray-500 text-xs mt-1">Activate beacons to see them here</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}