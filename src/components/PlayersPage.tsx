import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Eye, X, Trophy, Target, Calendar, Clock, UserCheck, Loader2, UserPlus, Edit } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { PlayersService } from '../services/players';
import { Player } from '../types';
import { supabase } from '../lib/supabase';

// Helper function to format time ago
const formatTimeAgo = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day ago`;
  return `${Math.floor(diffInSeconds / 604800)} week ago`;
};

// Helper function to calculate countdown from last game (3 days)
const getCountdownFromLastGame = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  const lastGameDate = new Date(dateString);
  const threeDaysFromLastGame = new Date(lastGameDate.getTime() + (3 * 24 * 60 * 60 * 1000));
  const now = new Date();
  
  const diffInSeconds = Math.floor((threeDaysFromLastGame.getTime() - now.getTime()) / 1000);
  
  if (diffInSeconds <= 0) return 'EXPIRED';
  
  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor((diffInSeconds % 86400) / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;
  
  return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


export function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reinstating, setReinstating] = useState(false);
  const [beaconGamePlayers, setBeaconGamePlayers] = useState<any[]>([]);
  const [isCreatePlayerDialogOpen, setIsCreatePlayerDialogOpen] = useState(false);
  const [creatingPlayer, setCreatingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    username: '',
    avatar: '',
    bio: ''
  });
  const [isEditPlayerDialogOpen, setIsEditPlayerDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    avatar: '',
    bio: ''
  });
  const [countdownTime, setCountdownTime] = useState(new Date());
  const [updatingPlayer, setUpdatingPlayer] = useState(false);
  const [playerLastGame, setPlayerLastGame] = useState<{
    gameId: string;
    endTime: string;
    status: string;
    beaconId: string;
    gameTemplateName: string;
  } | null>(null);
  const [loadingLastGame, setLoadingLastGame] = useState(false);
  const [gameHistory, setGameHistory] = useState<Array<{
    gameId: string;
    endTime: string | null;
    startTime: string;
    status: string;
    beaconId: string;
    gameTemplateName: string;
    playerOutcome: string | null;
  }>>([]);
  const [loadingGameHistory, setLoadingGameHistory] = useState(false);
  const [gameHistoryPage, setGameHistoryPage] = useState(0);
  const [hasMoreGames, setHasMoreGames] = useState(true);

  // Fetch player's last game information
  const fetchPlayerLastGame = async (playerId: number) => {
    try {
      setLoadingLastGame(true);
      const lastGame = await PlayersService.getPlayerLastGame(playerId);
      setPlayerLastGame(lastGame);
    } catch (err) {
      console.error('Error fetching player last game:', err);
      setPlayerLastGame(null);
    } finally {
      setLoadingLastGame(false);
    }
  };

  // Fetch player's game history
  const fetchPlayerGameHistory = async (playerId: number, page: number = 0, append: boolean = false) => {
    try {
      setLoadingGameHistory(true);
      const result = await PlayersService.getPlayerGameHistory(playerId, page, 10);
      
      if (append) {
        setGameHistory(prev => [...prev, ...result.games]);
      } else {
        setGameHistory(result.games);
      }
      
      setHasMoreGames(result.hasMore);
      setGameHistoryPage(page);
    } catch (err) {
      console.error('Error fetching player game history:', err);
    } finally {
      setLoadingGameHistory(false);
    }
  };

  // Load more games for infinite scroll
  const loadMoreGames = () => {
    if (!loadingGameHistory && hasMoreGames && selectedPlayer) {
      fetchPlayerGameHistory(selectedPlayer.id, gameHistoryPage + 1, true);
    }
  };

  // Handle player selection
  const handlePlayerSelect = async (player: Player) => {
    setSelectedPlayer(player);
    setGameHistory([]);
    setGameHistoryPage(0);
    setHasMoreGames(true);
    await Promise.all([
      fetchPlayerLastGame(player.id),
      fetchPlayerGameHistory(player.id, 0, false)
    ]);
  };

  // Handle create player
  const handleCreatePlayer = () => {
    setIsCreatePlayerDialogOpen(true);
  };

  // Handle save new player
  const handleSaveNewPlayer = async () => {
    if (!newPlayer.username.trim()) {
      toast.error('Username is required');
      return;
    }

    try {
      setCreatingPlayer(true);
      const createdPlayer = await PlayersService.create({
        username: newPlayer.username.trim(),
        avatar: newPlayer.avatar.trim() || undefined,
        bio: newPlayer.bio.trim() || undefined
      });

      // Add the new player to the local state
      setPlayers(prevPlayers => [createdPlayer, ...prevPlayers]);
      
      // Reset form and close dialog
      setNewPlayer({ username: '', avatar: '', bio: '' });
      setIsCreatePlayerDialogOpen(false);
      
      toast.success(`Player "${createdPlayer.username}" created successfully!`);
    } catch (err: any) {
      console.error('Error creating player:', err);
      toast.error(err?.message || 'Failed to create player. Please try again.');
    } finally {
      setCreatingPlayer(false);
    }
  };

  // Handle cancel create player
  const handleCancelCreatePlayer = () => {
    setNewPlayer({ username: '', avatar: '', bio: '' });
    setIsCreatePlayerDialogOpen(false);
  };

  // Handle edit player
  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditForm({
      username: player.username,
      avatar: player.avatar || '',
      bio: player.bio || ''
    });
    setIsEditPlayerDialogOpen(true);
  };

  // Handle save edited player
  const handleSaveEditedPlayer = async () => {
    if (!editingPlayer || !editForm.username.trim()) {
      toast.error('Username is required');
      return;
    }

    try {
      setUpdatingPlayer(true);
      const updatedPlayer = await PlayersService.update(editingPlayer.id, {
        username: editForm.username.trim(),
        avatar: editForm.avatar.trim() || undefined,
        bio: editForm.bio.trim() || undefined
      });

      // Update the local state
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === editingPlayer.id ? updatedPlayer : player
        )
      );
      
      // Update selected player if it's the one being edited
      if (selectedPlayer && selectedPlayer.id === editingPlayer.id) {
        setSelectedPlayer(updatedPlayer);
      }
      
      // Reset form and close dialog
      setEditForm({ username: '', avatar: '', bio: '' });
      setIsEditPlayerDialogOpen(false);
      setEditingPlayer(null);
      
      toast.success(`Player "${updatedPlayer.username}" updated successfully!`);
    } catch (err: any) {
      console.error('Error updating player:', err);
      toast.error(err?.message || 'Failed to update player. Please try again.');
    } finally {
      setUpdatingPlayer(false);
    }
  };

  // Handle cancel edit player
  const handleCancelEditPlayer = () => {
    setEditForm({ username: '', avatar: '', bio: '' });
    setIsEditPlayerDialogOpen(false);
    setEditingPlayer(null);
  };

  // Fetch players data and beacon game players data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch beacon game players data
        const { data: beaconGamePlayersData, error: beaconGamePlayersError } = await supabase
          .from('beacon_game_players')
          .select('player_id, player_outcome');
        
        if (beaconGamePlayersError) {
          console.error('Error fetching beacon game players:', beaconGamePlayersError);
          throw beaconGamePlayersError;
        }
        
        const data = await PlayersService.getAll();
        setPlayers(data);
        setBeaconGamePlayers(beaconGamePlayersData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const filteredPlayers = players.filter((player) => {
    const matchesStatus = filterStatus === 'all' || player.status === filterStatus;
    const matchesSearch = player.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  // Handle player reinstatement
  const handleReinstatePlayer = async (playerId: number) => {
    try {
      setReinstating(true);
      setError(null); // Clear any previous errors
      
      console.log('Attempting to reinstate player:', playerId);
      const updatedPlayer = await PlayersService.updateStatus(playerId, 'Active');
      console.log('Player reinstated successfully:', updatedPlayer);
      
      // Update the local state
      setPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === playerId 
            ? { ...player, status: 'Active' as const }
            : player
        )
      );
      
      // Update the selected player if it's the one being reinstated
      if (selectedPlayer && selectedPlayer.id === playerId) {
        setSelectedPlayer(prev => prev ? { ...prev, status: 'Active' as const } : null);
      }
      
    } catch (err: any) {
      console.error('Error reinstating player:', err);
      const errorMessage = err?.message || 'Failed to reinstate player. Please try again.';
      setError(errorMessage);
    } finally {
      setReinstating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white mb-2">Players</h1>
        <p className="text-gray-400">View all registered players</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              onClick={handleCreatePlayer}
              className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className={`whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'Active' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Active')}
              className={`whitespace-nowrap ${
                filterStatus === 'Active'
                  ? 'bg-green-500 text-black hover:bg-green-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'Eliminated' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Eliminated')}
              className={`whitespace-nowrap ${
                filterStatus === 'Eliminated'
                  ? 'bg-red-500 text-black hover:bg-red-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Eliminated
            </Button>
            <Button
              variant={filterStatus === 'Forfeit' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Forfeit')}
              className={`whitespace-nowrap ${
                filterStatus === 'Forfeit'
                  ? 'bg-orange-500 text-black hover:bg-orange-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Forfeit
            </Button>
          </div>
        </div>
      </Card>

      {/* Players Table */}
      <Card className="bg-gray-900 border-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00d9ff]" />
            <span className="ml-2 text-gray-400">Loading players...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Table View */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Username</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Wins</TableHead>
                    <TableHead className="text-gray-400">Countdown</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="text-white">{player.username}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            player.status === 'Active'
                              ? 'bg-green-500/20 text-green-400 border-green-500/50'
                              : player.status === 'Eliminated'
                              ? 'bg-red-500/20 text-red-400 border-red-500/50'
                              : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                          }
                        >
                          {player.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#ff00ff]">{calculatePlayerWins(player.id)}</TableCell>
                      <TableCell className="text-gray-400">
                        <span className={`font-mono text-sm font-bold ${getCountdownFromLastGame(player.last_game_at) === 'EXPIRED' ? 'text-red-500' : getCountdownFromLastGame(player.last_game_at) === '-' ? 'text-gray-400' : 'text-orange-400'}`}>
                          {getCountdownFromLastGame(player.last_game_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayerSelect(player)}
                          className="text-[#00d9ff] hover:bg-[#00d9ff]/10 hover:text-[#00d9ff]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

          </>
        )}
      </Card>

      {/* Player Detail Side Panel */}
      <Sheet open={selectedPlayer !== null} onOpenChange={() => {
        setSelectedPlayer(null);
        setPlayerLastGame(null);
        setGameHistory([]);
        setGameHistoryPage(0);
        setHasMoreGames(true);
      }}>
        <SheetContent className="bg-gray-900 border-l border-gray-800 w-full sm:max-w-lg overflow-y-auto p-0">
          {selectedPlayer && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
                <div className="flex items-start justify-between">
                  <SheetTitle className="text-white">Player Details</SheetTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlayer(null)}
                    className="text-gray-400 hover:text-white -mr-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="px-6 py-6 space-y-8">
                {/* Player Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-[#00d9ff] shadow-[0_0_20px_rgba(0,217,255,0.5)]">
                    <AvatarFallback className="bg-gradient-to-br from-[#00d9ff] to-[#0099cc] text-black text-xl">
                      {selectedPlayer.avatar || selectedPlayer.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-white text-xl">{selectedPlayer.username}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPlayer(selectedPlayer)}
                        className="text-gray-400 hover:text-[#00d9ff] hover:bg-[#00d9ff]/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge
                      className={
                        selectedPlayer.status === 'Active'
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : selectedPlayer.status === 'Eliminated'
                          ? 'bg-red-500/20 text-red-400 border-red-500/50'
                          : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                      }
                    >
                      {selectedPlayer.status}
                    </Badge>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-white mb-3">Bio</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {selectedPlayer.bio || 'Borderland player.'}
                  </p>
                </div>

                <Separator className="bg-gray-800" />

                {/* Stats Grid */}
                <div>
                  <h3 className="text-white mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-[#ff00ff]" />
                        <p className="text-gray-400 text-sm">Total Wins</p>
                      </div>
                      <p className="text-white text-2xl">{calculatePlayerWins(selectedPlayer.id)}</p>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-[#00d9ff]" />
                        <p className="text-gray-400 text-sm">Total Games</p>
                      </div>
                      <p className="text-white text-2xl">{calculatePlayerTotalGames(selectedPlayer.id)}</p>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-[#ff00ff]" />
                        <p className="text-gray-400 text-sm">Join Date</p>
                      </div>
                      <p className="text-white text-sm">{selectedPlayer.join_date}</p>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-[#00d9ff]/10 rounded-lg">
                          <Clock className="h-4 w-4 text-[#00d9ff]" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Last Game</p>
                      </div>
                      {loadingLastGame ? (
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-4 h-4 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-400 text-sm">Loading game history...</p>
                        </div>
                      ) : playerLastGame ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#00d9ff] rounded-full animate-pulse"></div>
                            <p className="text-white text-sm font-medium">
                              {playerLastGame.status === 'Active' ? 'Started ' : ''}{formatTimeAgo(playerLastGame.endTime)}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-white text-sm font-medium">{playerLastGame.gameTemplateName}</p>
                            <p className="text-gray-400 text-xs font-mono">{playerLastGame.gameId}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="h-6 w-6 text-gray-500" />
                          </div>
                          <p className="text-gray-500 text-sm">No games played yet</p>
                          <p className="text-gray-600 text-xs mt-1">This player hasn't joined any games</p>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>


                {/* Game History */}
                <div>
                  <h3 className="text-white mb-4">Game History</h3>
                  <div className="space-y-3">
                    {loadingGameHistory && gameHistory.length === 0 ? (
                      <Card className="p-4 bg-gray-950 border-gray-800">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-400 text-sm">Loading game history...</p>
                        </div>
                      </Card>
                    ) : gameHistory.length > 0 ? (
                      <>
                        {gameHistory.map((game, index) => (
                          <Card key={`${game.gameId}-${index}`} className="p-4 bg-gray-950 border-gray-800">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-[#00d9ff] rounded-full"></div>
                                  <p className="text-white text-sm font-medium">{game.gameTemplateName}</p>
                                </div>
                                {game.status === 'Active' ? (
                                  <Badge className="bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50 text-xs px-2 py-1">
                                    Active
                                  </Badge>
                                ) : game.status === 'Cancelled' ? (
                                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 text-xs px-2 py-1">
                                    Cancelled
                                  </Badge>
                                ) : game.status === 'Completed' && game.playerOutcome ? (
                                  <Badge className={`text-xs px-2 py-1 ${
                                    game.playerOutcome === 'win'
                                      ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                      : 'bg-red-500/20 text-red-400 border-red-500/50'
                                  }`}>
                                    {game.playerOutcome === 'win' ? 'Won' : 'Eliminated'}
                                  </Badge>
                                ) : null}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-gray-400 text-xs font-mono">{game.gameId}</p>
                                <p className="text-gray-500 text-xs">
                                  {formatTimeAgo(game.endTime || game.startTime)}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                        
                        {/* Load More Button */}
                        {hasMoreGames && (
                          <Card className="p-4 bg-gray-950 border-gray-800">
                            <Button
                              onClick={loadMoreGames}
                              disabled={loadingGameHistory}
                              className="w-full bg-[#00d9ff]/10 hover:bg-[#00d9ff]/20 text-[#00d9ff] border border-[#00d9ff]/30"
                              variant="ghost"
                            >
                              {loadingGameHistory ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin"></div>
                                  Loading more...
                                </div>
                              ) : (
                                'Load More Games'
                              )}
                            </Button>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card className="p-4 bg-gray-950 border-gray-800">
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="h-6 w-6 text-gray-500" />
                          </div>
                          <p className="text-gray-500 text-sm">No games played yet</p>
                          <p className="text-gray-600 text-xs mt-1">This player hasn't joined any games</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {(selectedPlayer.status === 'Eliminated' || selectedPlayer.status === 'Forfeit') && (
                  <>
                    <Separator className="bg-gray-800" />
                    <Button 
                      className="w-full bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black disabled:opacity-50"
                      onClick={() => handleReinstatePlayer(selectedPlayer.id)}
                      disabled={reinstating}
                    >
                      {reinstating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Reinstating...
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Reinstate Player
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Player Dialog */}
      <Dialog open={isCreatePlayerDialogOpen} onOpenChange={setIsCreatePlayerDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-[#00d9ff]" />
              Create New Player
            </DialogTitle>
            <p className="text-gray-400 text-sm mt-2">Add a new player to the Borderland competition system</p>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username *</Label>
              <Input
                id="username"
                value={newPlayer.username}
                onChange={(e) => setNewPlayer(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="Enter username..."
              />
              <p className="text-gray-500 text-xs">Unique identifier for the player</p>
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-white">Avatar</Label>
              <Input
                id="avatar"
                value={newPlayer.avatar}
                onChange={(e) => setNewPlayer(prev => ({ ...prev, avatar: e.target.value }))}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="e.g., SR, PX, GH (2-3 characters)"
                maxLength={3}
              />
              <p className="text-gray-500 text-xs">Optional 2-3 character avatar initials</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white">Bio</Label>
              <Textarea
                id="bio"
                value={newPlayer.bio}
                onChange={(e) => setNewPlayer(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 min-h-[100px]"
                placeholder="Enter player bio..."
              />
              <p className="text-gray-500 text-xs">Optional description of the player</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-800 mt-6">
            <Button 
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white" 
              onClick={handleCancelCreatePlayer}
              disabled={creatingPlayer}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black disabled:opacity-50" 
              onClick={handleSaveNewPlayer}
              disabled={creatingPlayer || !newPlayer.username.trim()}
            >
              {creatingPlayer ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Player
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Player Dialog */}
      <Dialog open={isEditPlayerDialogOpen} onOpenChange={setIsEditPlayerDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Edit className="h-6 w-6 text-[#00d9ff]" />
              Edit Player
            </DialogTitle>
            <p className="text-gray-400 text-sm mt-2">Update player information</p>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-white">Username *</Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="Enter username..."
              />
              <p className="text-gray-500 text-xs">Unique identifier for the player</p>
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <Label htmlFor="edit-avatar" className="text-white">Avatar</Label>
              <Input
                id="edit-avatar"
                value={editForm.avatar}
                onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="e.g., SR, PX, GH (2-3 characters)"
                maxLength={3}
              />
              <p className="text-gray-500 text-xs">Optional 2-3 character avatar initials</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="edit-bio" className="text-white">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 min-h-[100px]"
                placeholder="Enter player bio..."
              />
              <p className="text-gray-500 text-xs">Optional description of the player</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-800 mt-6">
            <Button 
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white" 
              onClick={handleCancelEditPlayer}
              disabled={updatingPlayer}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black disabled:opacity-50" 
              onClick={handleSaveEditedPlayer}
              disabled={updatingPlayer || !editForm.username.trim()}
            >
              {updatingPlayer ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Player
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}