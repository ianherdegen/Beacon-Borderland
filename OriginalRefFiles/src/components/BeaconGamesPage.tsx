import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Eye, Play, Video, Trophy, Radio, FileCode } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Separator } from './ui/separator';

type GameType = 'Solo' | 'Versus' | 'Group';

const beaconGames = [
  {
    id: 'BG-1847',
    beaconId: 'B-001',
    beaconName: 'Downtown Alpha',
    gameTemplate: 'Urban Assault',
    templateType: 'Solo' as GameType,
    status: 'Active',
    playersCount: 1,
    players: ['ShadowRunner'],
    actualClip: null,
    startTime: '2024-10-09 14:30',
    endTime: null,
    outcome: null,
    duration: '45 min elapsed',
  },
  {
    id: 'BG-1848',
    beaconId: 'B-007',
    beaconName: 'Harbor Beta',
    gameTemplate: 'Territory Control',
    templateType: 'Versus' as GameType,
    status: 'Active',
    playersCount: 6,
    players: ['Phoenix', 'Vortex', 'Cipher', 'Raven', 'NightHawk', 'Titan'],
    actualClip: null,
    startTime: '2024-10-09 14:00',
    endTime: null,
    outcome: null,
    duration: '1 hr 15 min elapsed',
  },
  {
    id: 'BG-1849',
    beaconId: 'B-015',
    beaconName: 'Industrial Gamma',
    gameTemplate: 'Shadow Protocol',
    templateType: 'Group' as GameType,
    status: 'Active',
    playersCount: 4,
    players: ['Ghost', 'Cipher', 'Raven', 'NightHawk'],
    actualClip: null,
    startTime: '2024-10-09 14:52',
    endTime: null,
    outcome: null,
    duration: '23 min elapsed',
  },
  {
    id: 'BG-1846',
    beaconId: 'B-031',
    beaconName: 'Bridge Epsilon',
    gameTemplate: 'Night Raid',
    templateType: 'Versus' as GameType,
    status: 'Completed',
    playersCount: 10,
    players: ['ShadowRunner', 'Ghost', 'Phoenix', 'Vortex', 'Cipher', 'Raven', 'NightHawk', 'Titan', 'Spectre', 'Wraith'],
    actualClip: 'https://vimeo.com/987654321',
    startTime: '2024-10-09 12:00',
    endTime: '2024-10-09 12:43',
    outcome: {
      winners: ['Phoenix', 'Vortex', 'Cipher'],
      eliminated: ['ShadowRunner', 'Ghost', 'Raven', 'NightHawk', 'Titan', 'Spectre', 'Wraith'],
    },
    duration: '43 min',
  },
  {
    id: 'BG-1845',
    beaconId: 'B-047',
    beaconName: 'Tower Zeta',
    gameTemplate: 'Urban Assault',
    templateType: 'Solo' as GameType,
    status: 'Completed',
    playersCount: 1,
    players: ['Ghost'],
    actualClip: 'https://youtube.com/watch?v=completed123',
    startTime: '2024-10-09 11:15',
    endTime: '2024-10-09 12:03',
    outcome: {
      result: 'won',
    },
    duration: '48 min',
  },
  {
    id: 'BG-1844',
    beaconId: 'B-001',
    beaconName: 'Downtown Alpha',
    gameTemplate: 'Extraction',
    templateType: 'Versus' as GameType,
    status: 'Completed',
    playersCount: 8,
    players: ['ShadowRunner', 'Phoenix', 'Vortex', 'Cipher', 'Raven', 'Spectre', 'Wraith', 'Blade'],
    actualClip: 'https://vimeo.com/876543210',
    startTime: '2024-10-09 10:00',
    endTime: '2024-10-09 10:35',
    outcome: {
      winners: ['ShadowRunner', 'Phoenix'],
      eliminated: ['Vortex', 'Cipher', 'Raven', 'Spectre', 'Wraith', 'Blade'],
    },
    duration: '35 min',
  },
  {
    id: 'BG-1843',
    beaconId: 'B-023',
    beaconName: 'Park Delta',
    gameTemplate: 'King of the Hill',
    templateType: 'Group' as GameType,
    status: 'Cancelled',
    playersCount: 6,
    players: ['Ghost', 'Phoenix', 'Cipher', 'Raven', 'NightHawk', 'Titan'],
    actualClip: null,
    startTime: '2024-10-09 09:00',
    endTime: '2024-10-09 09:15',
    outcome: null,
    duration: '15 min',
  },
];

export function BeaconGamesPage() {
  const [selectedGame, setSelectedGame] = useState<typeof beaconGames[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const renderOutcome = (game: typeof beaconGames[0]) => {
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
            <h3 className="text-white">Game Outcomes</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm mb-2">Winners ({game.outcome.winners.length})</p>
              <div className="flex flex-wrap gap-1">
                {game.outcome.winners.map((player, index) => (
                  <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/50">
                    {player}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Eliminated ({game.outcome.eliminated.length})</p>
              <div className="flex flex-wrap gap-1">
                {game.outcome.eliminated.map((player, index) => (
                  <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500/50">
                    {player}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white mb-2">Beacon Games</h1>
        <p className="text-gray-400">Monitor all beacon game sessions</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search games by ID, template, or beacon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className={
                filterStatus === 'all'
                  ? 'bg-[#00d9ff] text-black hover:bg-[#00d9ff]/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'Active' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Active')}
              className={
                filterStatus === 'Active'
                  ? 'bg-green-500 text-black hover:bg-green-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'Completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Completed')}
              className={
                filterStatus === 'Completed'
                  ? 'bg-blue-500 text-black hover:bg-blue-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === 'Cancelled' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Cancelled')}
              className={
                filterStatus === 'Cancelled'
                  ? 'bg-red-500 text-black hover:bg-red-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              Cancelled
            </Button>
          </div>
        </div>
      </Card>

      {/* Games Table */}
      <Card className="bg-gray-900 border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Game ID</TableHead>
              <TableHead className="text-gray-400">Beacon</TableHead>
              <TableHead className="text-gray-400">Template</TableHead>
              <TableHead className="text-gray-400">Type</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Players</TableHead>
              <TableHead className="text-gray-400">Duration</TableHead>
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
                <TableCell>
                  <Badge className={getTypeBadgeColor(game.templateType)}>
                    {game.templateType}
                  </Badge>
                </TableCell>
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
                <TableCell className="text-[#ff00ff]">{game.playersCount}</TableCell>
                <TableCell className="text-gray-400">{game.duration}</TableCell>
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
      </Card>

      {/* Game Detail Side Panel */}
      <Sheet open={selectedGame !== null} onOpenChange={() => setSelectedGame(null)}>
        <SheetContent className="bg-gray-950 border-l border-gray-800 w-full sm:max-w-lg overflow-y-auto p-0">
          {selectedGame && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
                <SheetTitle className="text-white">Game Details</SheetTitle>
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
                    {selectedGame.players.map((player, index) => {
                      let playerStatus = null;
                      if (selectedGame.outcome && selectedGame.templateType === 'Versus') {
                        if (selectedGame.outcome.winners?.includes(player)) {
                          playerStatus = 'winner';
                        } else if (selectedGame.outcome.eliminated?.includes(player)) {
                          playerStatus = 'eliminated';
                        }
                      }

                      return (
                        <Card key={index} className="p-3 bg-gray-950 border-gray-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#ff00ff] flex items-center justify-center">
                                <span className="text-white text-xs">
                                  {player.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-white">{player}</span>
                            </div>
                            {playerStatus === 'winner' && (
                              <Trophy className="h-5 w-5 text-[#00d9ff]" style={{ filter: 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.6))' }} />
                            )}
                            {playerStatus === 'eliminated' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                                Eliminated
                              </Badge>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Match Footage */}
                {selectedGame.actualClip && (
                  <Card className="p-4 bg-gray-950 border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-5 w-5 text-[#ff00ff]" />
                      <h3 className="text-white">Match Footage</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#00d9ff] flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-black ml-1" />
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{selectedGame.actualClip}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Play
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800"
                        >
                          Replace
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}