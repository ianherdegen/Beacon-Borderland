import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Search, Eye, Play, Video, Trophy, Radio, FileCode, Loader2, Edit, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { BeaconGamesService } from '../services/beacon-games';
import { BeaconGameWithDetails, BeaconGamePlayerWithDetails } from '../types';

type GameType = 'Solo' | 'Versus' | 'Group';

// UI-friendly interface for displaying beacon games
interface BeaconGameDisplay {
  id: string;
  beaconId: string;
  beaconName: string;
  gameTemplate: string;
  templateType: GameType;
  status: 'Active' | 'Completed' | 'Cancelled';
  playersCount: number;
  players: string[];
  originalPlayers: BeaconGamePlayerWithDetails[]; // Store original player data for outcome display
  actualClip: string | null;
  startTime: string;
  endTime: string | null;
  outcome: any;
  duration: string;
}

export function BeaconGamesPage() {
  const [beaconGames, setBeaconGames] = useState<BeaconGameDisplay[]>([]);
  const [selectedGame, setSelectedGame] = useState<BeaconGameDisplay | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditVideoDialogOpen, setIsEditVideoDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<BeaconGameDisplay | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [savingVideo, setSavingVideo] = useState(false);

  // Helper function to convert video URLs to embeddable format
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  // Fetch beacon games data
  useEffect(() => {
    const fetchBeaconGames = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching beacon games with details...');
        const gamesWithDetails = await BeaconGamesService.getWithDetails();
        console.log('Fetched beacon games:', gamesWithDetails);
        
        // Transform the data to match our UI structure
        const transformedGames: BeaconGameDisplay[] = gamesWithDetails.map(game => {
          // Calculate duration
          const startTime = new Date(game.start_time);
          const endTime = game.end_time ? new Date(game.end_time) : new Date();
          const durationMs = endTime.getTime() - startTime.getTime();
          const durationMinutes = Math.floor(durationMs / (1000 * 60));
          
          let duration = '';
          if (game.status === 'Active') {
            duration = `${durationMinutes} min elapsed`;
          } else if (game.end_time) {
            duration = `${durationMinutes} min`;
          } else {
            duration = 'N/A';
          }
          
          // Format start time
          const formattedStartTime = startTime.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(',', '');
          
          // Format end time
          const formattedEndTime = game.end_time ? new Date(game.end_time).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(',', '') : null;
          
          return {
            id: game.id,
            beaconId: game.beacon_id,
            beaconName: game.beacon_name,
            gameTemplate: game.game_template_name,
            templateType: game.game_template_type as GameType,
            status: game.status,
            playersCount: game.players.length,
            players: (game.players as BeaconGamePlayerWithDetails[]).map(p => p.player_username || `Player ${p.player_id}`), // Use actual username
            originalPlayers: game.players as BeaconGamePlayerWithDetails[], // Store original player data for outcome display
            actualClip: game.actual_clip,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            outcome: game.outcome,
            duration: duration
          };
        });
        
        setBeaconGames(transformedGames);
        console.log('Transformed beacon games:', transformedGames);
        
      } catch (err: any) {
        console.error('Error fetching beacon games:', err);
        setError(err?.message || 'Failed to load beacon games. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBeaconGames();
  }, []);

  const filteredGames = beaconGames.filter((game) => {
    const matchesStatus = filterStatus === 'all' || game.status === filterStatus;
    const matchesSearch =
      game.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.gameTemplate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.beaconName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.beaconId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });


  const getTypeBadgeColor = (type: GameType) => {
    if (type === 'Solo') return 'bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50';
    if (type === 'Versus') return 'bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/50';
    return 'bg-green-500/20 text-green-400 border-green-500/50';
  };

  const renderOutcome = (game: BeaconGameDisplay) => {
    if (!game.outcome) return null;

    if (game.templateType === 'Solo') {
      return (
        <Card className="p-4 bg-gray-950 border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-[#00d9ff]" />
            <h3 className="text-white">Outcome</h3>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={game.outcome.result === 'won' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}>
              {game.outcome.result === 'won' ? 'Player Won' : 'Player Eliminated'}
            </Badge>
          </div>
        </Card>
      );
    }

    if (game.templateType === 'Group') {
      return (
        <Card className="p-4 bg-gray-950 border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-green-400" />
            <h3 className="text-white">Team Outcome</h3>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={game.outcome.result === 'won' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}>
              {game.outcome.result === 'won' ? 'ALL Players Won' : 'ALL Players Eliminated'}
            </Badge>
          </div>
        </Card>
      );
    }

    if (game.templateType === 'Versus' && game.outcome.winners && game.outcome.eliminated) {
      return (
        <Card className="p-4 bg-gray-950 border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-[#ff00ff]" />
            <h3 className="text-white">Match Results</h3>
          </div>
          
          {/* Winners */}
          {game.outcome.winners.length > 0 && (
            <div className="mb-3">
              <h4 className="text-green-400 text-sm mb-2">Winners ({game.outcome.winners.length})</h4>
              <div className="flex flex-wrap gap-2">
                {game.outcome.winners.map((winner: string, index: number) => (
                  <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/50">
                    {winner}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Eliminated */}
          {game.outcome.eliminated.length > 0 && (
            <div>
              <h4 className="text-red-400 text-sm mb-2">Eliminated ({game.outcome.eliminated.length})</h4>
              <div className="flex flex-wrap gap-2">
                {game.outcome.eliminated.map((eliminated: string, index: number) => (
                  <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500/50">
                    {eliminated}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Show message if no outcomes are set yet */}
          {game.outcome.winners.length === 0 && game.outcome.eliminated.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">Game outcomes not yet determined</p>
            </div>
          )}
        </Card>
      );
    }

    // Fallback for other outcome types
    return (
      <Card className="p-4 bg-gray-950 border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-gray-400" />
          <h3 className="text-white">Outcome</h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
            Game Completed
          </Badge>
        </div>
      </Card>
    );
  };

  // Handle edit video click
  const handleEditVideo = (game: BeaconGameDisplay) => {
    setEditingGame(game);
    setVideoUrl(game.actualClip || '');
    setIsEditVideoDialogOpen(true);
  };

  // Handle save video
  const handleSaveVideo = async () => {
    if (!editingGame || !videoUrl.trim()) {
      toast.error('Please provide a valid video URL');
      return;
    }

    try {
      setSavingVideo(true);
      
      await BeaconGamesService.update(editingGame.id, {
        actual_clip: videoUrl.trim()
      });

      // Update local state
      setBeaconGames(prev => 
        prev.map(game => 
          game.id === editingGame.id 
            ? { ...game, actualClip: videoUrl.trim() }
            : game
        )
      );

      // Update selected game if it's the one being edited
      if (selectedGame && selectedGame.id === editingGame.id) {
        setSelectedGame(prev => prev ? { ...prev, actualClip: videoUrl.trim() } : null);
      }

      toast.success('Match video updated successfully');
      setIsEditVideoDialogOpen(false);
      setEditingGame(null);
      setVideoUrl('');
    } catch (err: any) {
      console.error('Error updating match video:', err);
      toast.error(err?.message || 'Failed to update match video. Please try again.');
    } finally {
      setSavingVideo(false);
    }
  };

  // Handle cancel edit video
  const handleCancelEditVideo = () => {
    setIsEditVideoDialogOpen(false);
    setEditingGame(null);
    setVideoUrl('');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-white mb-2">Beacon Games</h1>
          <p className="text-gray-400">Monitor all beacon game sessions</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#00d9ff]" />
            <span className="text-gray-400">Loading beacon games...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-white mb-2">Beacon Games</h1>
          <p className="text-gray-400">Monitor all beacon game sessions</p>
        </div>
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white mb-2">Beacon Games</h1>
        <p className="text-gray-400">Monitor all beacon game sessions</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search games by ID, template, or beacon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
            />
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
              variant={filterStatus === 'Completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Completed')}
              className={`whitespace-nowrap ${
                filterStatus === 'Completed'
                  ? 'bg-blue-500 text-black hover:bg-blue-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === 'Cancelled' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Cancelled')}
              className={`whitespace-nowrap ${
                filterStatus === 'Cancelled'
                  ? 'bg-red-500 text-black hover:bg-red-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Cancelled
            </Button>
          </div>
        </div>
      </Card>

      {/* Games Table */}
      <Card className="bg-gray-900 border-gray-800">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Game ID</TableHead>
              <TableHead className="text-gray-400">Beacon</TableHead>
              <TableHead className="text-gray-400">Game Template</TableHead>
              <TableHead className="text-gray-400">Players</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGames.map((game) => (
              <TableRow key={game.id} className="border-gray-800 hover:bg-gray-800/50">
                <TableCell className="text-[#00d9ff]">{game.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Radio className="h-3 w-3 text-gray-500" />
                    <div>
                      <div className="text-white">{game.beaconName}</div>
                      <div className="text-gray-500 text-xs">{game.beaconId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileCode className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-400">{game.gameTemplate}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#ff00ff]">{game.playersCount}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      game.status === 'Active'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : game.status === 'Completed'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                    }
                  >
                    {game.status === 'Active' && (
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                    )}
                    {game.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGame(game)}
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
      </Card>

      {/* Game Detail Side Panel */}
      <Sheet open={selectedGame !== null} onOpenChange={() => setSelectedGame(null)}>
        <SheetContent className="bg-gray-950 border-l border-gray-800 w-full sm:max-w-lg overflow-y-auto p-0">
          {selectedGame && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-white">Game Details</SheetTitle>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="text-gray-400 hover:text-white text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </SheetHeader>

              <div className="px-6 py-6 space-y-8">
                {/* Game Header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-white text-xl">{selectedGame.id}</h2>
                    <Badge
                      className={
                        selectedGame.status === 'Active'
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : selectedGame.status === 'Completed'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          : 'bg-red-500/20 text-red-400 border-red-500/50'
                      }
                    >
                      {selectedGame.status === 'Active' && (
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                      )}
                      {selectedGame.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{selectedGame.gameTemplate}</p>
                </div>

                <Separator className="bg-gray-800" />

                {/* Game Info */}
                <div>
                  <h3 className="text-white mb-4">Game Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <p className="text-gray-400 text-sm mb-1">Beacon</p>
                      <p className="text-white text-sm">{selectedGame.beaconName}</p>
                      <p className="text-gray-500 text-xs">{selectedGame.beaconId}</p>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <p className="text-gray-400 text-sm mb-1">Type</p>
                      <Badge className={getTypeBadgeColor(selectedGame.templateType)}>
                        {selectedGame.templateType}
                      </Badge>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <p className="text-gray-400 text-sm mb-1">Start Time</p>
                      <p className="text-white text-sm">{selectedGame.startTime}</p>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <p className="text-gray-400 text-sm mb-1">Duration</p>
                      <p className="text-[#00d9ff]">{selectedGame.duration}</p>
                    </Card>
                    {selectedGame.endTime && (
                      <Card className="p-4 bg-gray-950 border-gray-800 col-span-2">
                        <p className="text-gray-400 text-sm mb-1">End Time</p>
                        <p className="text-white text-sm">{selectedGame.endTime}</p>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Outcome */}
                {renderOutcome(selectedGame)}

                {/* Participating Players */}
                <div>
                  <h3 className="text-white mb-4">
                    Participating Players ({selectedGame.playersCount})
                  </h3>
                  <div className="space-y-2">
                    {selectedGame.originalPlayers
                      ?.sort((a, b) => {
                        // Sort winners to the top
                        const aIsWinner = a.player_outcome === 'win';
                        const bIsWinner = b.player_outcome === 'win';
                        
                        if (aIsWinner && !bIsWinner) return -1;
                        if (!aIsWinner && bIsWinner) return 1;
                        
                        // If both have same outcome, maintain original order
                        return 0;
                      })
                      ?.map((playerData, index) => {
                      // Determine player status based on game outcome and player data
                      let playerStatus: 'winner' | 'eliminated' | null = null;
                      let playerOutcome = null;
                      
                      if (selectedGame.status === 'Completed' && playerData) {
                        playerOutcome = playerData.player_outcome;
                        if (playerOutcome === 'win') {
                          playerStatus = 'winner';
                        } else if (playerOutcome === 'eliminated') {
                          playerStatus = 'eliminated';
                        }
                      }
                      
                      const username = playerData.player_username || `Player ${playerData.player_id}`;
                      const avatar = playerData.player_avatar || username.substring(0, 2).toUpperCase();
                      
                      return (
                        <Card key={index} className="p-3 bg-gray-950 border-gray-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-[#00d9ff] to-[#ff00ff] text-white text-xs">
                                  {avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white">{username}</span>
                            </div>
                            {playerStatus === 'winner' && (
                              <Trophy className="h-5 w-5 text-[#00d9ff]" style={{ filter: 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.6))' }} />
                            )}
                            {playerStatus === 'eliminated' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                                Eliminated
                              </Badge>
                            )}
                            {!playerStatus && selectedGame.status === 'Active' && (
                              <Badge className="bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50 text-xs">
                                Playing
                              </Badge>
                            )}
                            {!playerStatus && selectedGame.status === 'Cancelled' && (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 text-xs">
                                Cancelled
                              </Badge>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Match Footage - Only for completed games */}
                {selectedGame.status === 'Completed' && (
                  <Card className="p-4 bg-gray-950 border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-5 w-5 text-[#ff00ff]" />
                      <h3 className="text-white">Match Footage</h3>
                    </div>
                    {selectedGame.actualClip ? (
                      <div className="space-y-3">
                        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                          <iframe
                            src={getEmbedUrl(selectedGame.actualClip)}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={`${selectedGame.id} Match Footage`}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVideo(selectedGame)}
                            className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Video
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Video className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 mb-4">No match footage available</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditVideo(selectedGame)}
                          className="border-gray-700 text-gray-400 hover:bg-gray-800"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Add Match Video
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Video Dialog */}
      <Dialog open={isEditVideoDialogOpen} onOpenChange={setIsEditVideoDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Video className="h-6 w-6 text-[#ff00ff]" />
              {editingGame?.actualClip ? 'Edit Match Video' : 'Add Match Video'}
            </DialogTitle>
            <p className="text-gray-400 text-sm mt-2">
              {editingGame?.actualClip 
                ? 'Update the match video URL for this beacon game'
                : 'Add a match video URL for this beacon game'
              }
            </p>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {/* Game Info */}
            {editingGame && (
              <div className="p-4 bg-gray-950 border border-gray-800 rounded-lg">
                <h4 className="text-white mb-2">Game Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Game ID:</span>
                    <span className="text-white ml-2">{editingGame.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Template:</span>
                    <span className="text-white ml-2">{editingGame.gameTemplate}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Beacon:</span>
                    <span className="text-white ml-2">{editingGame.beaconName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="text-white ml-2">{editingGame.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="video-url" className="text-white">Video URL *</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                placeholder="Enter video URL (YouTube, Vimeo, etc.)..."
              />
              <p className="text-gray-500 text-xs">Supported platforms: YouTube, Vimeo, and other video hosting services</p>
            </div>
          </div>

          {/* Actions */}
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={handleCancelEditVideo}
              disabled={savingVideo}
              className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVideo}
              disabled={savingVideo || !videoUrl.trim()}
              className="bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-black disabled:opacity-50"
            >
              {savingVideo ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  {editingGame?.actualClip ? 'Update Video' : 'Add Video'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}