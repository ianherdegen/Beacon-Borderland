import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Eye, Radio, MapPin, Gamepad2, FileCode, AlertTriangle, Trophy, Users as UsersIcon, User, XCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type GameType = 'solo' | 'versus' | 'group';

const beacons = [
  {
    id: 'B-001',
    name: 'Downtown Alpha',
    active: true,
    coordinates: '40.7128° N, 74.0060° W',
    gameTemplate: 'Urban Assault',
    templateType: 'solo' as GameType,
    activeGames: [
      { id: 'BG-1234', startTime: '2 min ago', playerCount: 1, players: ['ShadowRunner'] },
      { id: 'BG-1235', startTime: '5 min ago', playerCount: 1, players: ['Ghost'] },
      { id: 'BG-1236', startTime: '12 min ago', playerCount: 1, players: ['Phoenix'] },
    ],
  },
  {
    id: 'B-007',
    name: 'Harbor Beta',
    active: true,
    coordinates: '40.7589° N, 73.9851° W',
    gameTemplate: 'Territory Control',
    templateType: 'versus' as GameType,
    activeGames: [
      { id: 'BG-1237', startTime: '1 hour ago', playerCount: 6, players: ['Phoenix', 'Vortex', 'Cipher', 'Raven', 'NightHawk', 'Titan'] },
    ],
  },
  {
    id: 'B-015',
    name: 'Industrial Gamma',
    active: true,
    coordinates: '40.7489° N, 73.9680° W',
    gameTemplate: 'Shadow Protocol',
    templateType: 'group' as GameType,
    activeGames: [
      { id: 'BG-1238', startTime: '23 min ago', playerCount: 4, players: ['Ghost', 'Cipher', 'Raven', 'NightHawk'] },
      { id: 'BG-1239', startTime: '45 min ago', playerCount: 5, players: ['Specter', 'Shade', 'Wraith', 'Phantom', 'Gloom'] },
    ],
  },
  {
    id: 'B-023',
    name: 'Park Delta',
    active: false,
    coordinates: '40.7829° N, 73.9654° W',
    gameTemplate: null,
    templateType: null,
    activeGames: [],
  },
  {
    id: 'B-031',
    name: 'Bridge Epsilon',
    active: true,
    coordinates: '40.7061° N, 74.0087° W',
    gameTemplate: 'Night Raid',
    templateType: 'versus' as GameType,
    activeGames: [
      { id: 'BG-1240', startTime: '45 min ago', playerCount: 5, players: ['ShadowRunner', 'Ghost', 'Phoenix', 'Vortex', 'Cipher'] },
      { id: 'BG-1241', startTime: '52 min ago', playerCount: 7, players: ['Stealth', 'Silent', 'Shadow', 'Dark', 'Noir', 'Dusk', 'Midnight'] },
    ],
  },
  {
    id: 'B-047',
    name: 'Tower Zeta',
    active: true,
    coordinates: '40.7580° N, 73.9855° W',
    gameTemplate: 'Urban Assault',
    templateType: 'solo' as GameType,
    activeGames: [
      { id: 'BG-1242', startTime: '12 min ago', playerCount: 1, players: ['Raven'] },
    ],
  },
  {
    id: 'B-052',
    name: 'Mall Theta',
    active: false,
    coordinates: '40.7614° N, 73.9776° W',
    gameTemplate: null,
    templateType: null,
    activeGames: [],
  },
  {
    id: 'B-068',
    name: 'Station Omega',
    active: true,
    coordinates: '40.7527° N, 73.9772° W',
    gameTemplate: 'Territory Control',
    templateType: 'versus' as GameType,
    activeGames: [
      { id: 'BG-1243', startTime: '35 min ago', playerCount: 4, players: ['Phoenix', 'ShadowRunner', 'Ghost', 'Cipher'] },
      { id: 'BG-1244', startTime: '38 min ago', playerCount: 8, players: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'] },
      { id: 'BG-1245', startTime: '42 min ago', playerCount: 3, players: ['Omega', 'Sigma', 'Kappa'] },
    ],
  },
];

const getTemplateTypeColor = (type: GameType | null) => {
  switch (type) {
    case 'solo':
      return 'bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50';
    case 'versus':
      return 'bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/50';
    case 'group':
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
};

const getTemplateTypeIcon = (type: GameType | null) => {
  switch (type) {
    case 'solo':
      return <User className="h-3 w-3 mr-1" />;
    case 'versus':
      return <Trophy className="h-3 w-3 mr-1" />;
    case 'group':
      return <UsersIcon className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

export function BeaconsPage() {
  const [selectedBeacon, setSelectedBeacon] = useState<typeof beacons[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameOutcomes, setGameOutcomes] = useState<Record<string, 'win' | 'eliminated' | null>>({});
  const [gameOutcomesConfirmed, setGameOutcomesConfirmed] = useState<Record<string, boolean>>({});
  const [versusPlayerOutcomes, setVersusPlayerOutcomes] = useState<Record<string, Record<string, 'win' | 'eliminated' | null>>>({});

  const filteredBeacons = beacons.filter((beacon) =>
    beacon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    beacon.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActiveGames = beacons.reduce((sum, b) => sum + b.activeGames.length, 0);

  const handleConfirmOutcome = (gameId: string, templateType: GameType | null) => {
    if (templateType === 'versus') {
      // For versus games, check if all players have outcomes
      const playerOutcomes = versusPlayerOutcomes[gameId] || {};
      const allPlayersSet = Object.keys(playerOutcomes).length > 0 && 
        Object.values(playerOutcomes).every(outcome => outcome !== null);
      
      if (allPlayersSet) {
        setGameOutcomesConfirmed(prev => ({ ...prev, [gameId]: true }));
      }
    } else {
      // For solo and group games, just mark as confirmed
      setGameOutcomesConfirmed(prev => ({ ...prev, [gameId]: true }));
    }
  };

  const handleVersusPlayerOutcome = (gameId: string, player: string, outcome: 'win' | 'eliminated') => {
    setVersusPlayerOutcomes(prev => ({
      ...prev,
      [gameId]: {
        ...(prev[gameId] || {}),
        [player]: outcome
      }
    }));
  };

  const isVersusOutcomeComplete = (gameId: string, players: string[]) => {
    const playerOutcomes = versusPlayerOutcomes[gameId] || {};
    return players.every(player => playerOutcomes[player] != null);
  };

  const renderWinnerSection = (game: any, templateType: GameType | null) => {
    if (!templateType) return null;

    if (templateType === 'solo') {
      const currentOutcome = gameOutcomes[game.id];
      const hasOutcome = currentOutcome != null;
      
      return (
        <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-[#00d9ff]/30">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#00d9ff]" />
            Game Outcome
          </h4>
          <div className="space-y-2 mb-4">
            <div 
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                currentOutcome === 'win'
                  ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setGameOutcomes(prev => ({ ...prev, [game.id]: 'win' }))}
            >
              <span className={currentOutcome === 'win' ? 'text-green-400' : 'text-gray-300'}>
                Player Won
              </span>
            </div>
            <div 
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                currentOutcome === 'eliminated'
                  ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setGameOutcomes(prev => ({ ...prev, [game.id]: 'eliminated' }))}
            >
              <span className={currentOutcome === 'eliminated' ? 'text-red-400' : 'text-gray-300'}>
                Player Eliminated
              </span>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                  size="sm"
                  onClick={() => handleConfirmOutcome(game.id, templateType)}
                  disabled={!hasOutcome}
                >
                  Confirm & End Game
                </Button>
              </div>
            </TooltipTrigger>
            {!hasOutcome && (
              <TooltipContent>
                <p>Select a game outcome first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      );
    }

    if (templateType === 'group') {
      const currentOutcome = gameOutcomes[game.id];
      const hasOutcome = currentOutcome != null;
      
      return (
        <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-green-500/30">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-400" />
            Team Outcome
          </h4>
          <div className="space-y-2 mb-4">
            <div 
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                currentOutcome === 'win'
                  ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setGameOutcomes(prev => ({ ...prev, [game.id]: 'win' }))}
            >
              <span className={currentOutcome === 'win' ? 'text-green-400' : 'text-gray-300'}>
                ALL Players Won
              </span>
            </div>
            <div 
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                currentOutcome === 'eliminated'
                  ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setGameOutcomes(prev => ({ ...prev, [game.id]: 'eliminated' }))}
            >
              <span className={currentOutcome === 'eliminated' ? 'text-red-400' : 'text-gray-300'}>
                ALL Players Eliminated
              </span>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                  size="sm"
                  onClick={() => handleConfirmOutcome(game.id, templateType)}
                  disabled={!hasOutcome}
                >
                  Confirm & End Game
                </Button>
              </div>
            </TooltipTrigger>
            {!hasOutcome && (
              <TooltipContent>
                <p>Select a team outcome first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      );
    }

    if (templateType === 'versus') {
      const isComplete = isVersusOutcomeComplete(game.id, game.players);
      return (
        <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-[#ff00ff]/30">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#ff00ff]" />
            Player Outcomes
          </h4>
          <div className="space-y-2 mb-4">
            <p className="text-gray-400 text-sm">Mark players as winners or eliminated:</p>
            {game.players.map((player: string, index: number) => {
              const outcome = versusPlayerOutcomes[game.id]?.[player];
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="text-white">{player}</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className={outcome === 'win' 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_12px_rgba(74,222,128,0.5)]' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
                      }
                      onClick={() => handleVersusPlayerOutcome(game.id, player, 'win')}
                    >
                      Won
                    </Button>
                    <Button 
                      size="sm" 
                      className={outcome === 'eliminated'
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
                      }
                      onClick={() => handleVersusPlayerOutcome(game.id, player, 'eliminated')}
                    >
                      Eliminated
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                  size="sm"
                  onClick={() => handleConfirmOutcome(game.id, templateType)}
                  disabled={!isComplete}
                >
                  Confirm & End Game
                </Button>
              </div>
            </TooltipTrigger>
            {!isComplete && (
              <TooltipContent>
                <p>Set outcome for all players first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      );
    }

    return null;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-white mb-2">Beacons</h1>
          <p className="text-gray-400">Monitor all beacon locations</p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search beacons by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Beacons</span>
              <span className="text-white text-3xl">{beacons.length}</span>
            </div>
          </Card>
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Beacons</span>
              <span className="text-[#00d9ff] text-3xl">
                {beacons.filter((b) => b.active).length}
              </span>
            </div>
          </Card>
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Games</span>
              <span className="text-[#ff00ff] text-3xl">{totalActiveGames}</span>
            </div>
          </Card>
        </div>

        {/* Beacons Table */}
        <Card className="bg-gray-900 border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Beacon ID</TableHead>
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Game Template</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Active Games</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBeacons.map((beacon) => (
                <TableRow key={beacon.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="text-[#00d9ff]">{beacon.id}</TableCell>
                  <TableCell className="text-white">{beacon.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        beacon.active
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                      }
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${beacon.active ? 'bg-green-400' : 'bg-gray-400'}`}
                        style={
                          beacon.active
                            ? { boxShadow: '0 0 10px rgba(74, 222, 128, 0.8)' }
                            : {}
                        }
                      />
                      {beacon.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {beacon.gameTemplate ? (
                      <span className="text-[#00d9ff]">{beacon.gameTemplate}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {beacon.templateType ? (
                      <Badge className={getTemplateTypeColor(beacon.templateType)}>
                        <div className="flex items-center">
                          {getTemplateTypeIcon(beacon.templateType)}
                          {beacon.templateType === 'solo' ? 'Solo' : beacon.templateType === 'versus' ? 'Versus' : 'Group'}
                        </div>
                      </Badge>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {beacon.activeGames.length > 0 ? (
                      <span className="text-[#ff00ff]">{beacon.activeGames.length}</span>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBeacon(beacon)}
                        className="text-[#00d9ff] hover:bg-[#00d9ff]/10 hover:text-[#00d9ff]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Beacon Detail Side Panel */}
        <Sheet open={selectedBeacon !== null} onOpenChange={() => setSelectedBeacon(null)}>
          <SheetContent className="bg-gray-900 border-l border-gray-800 w-full sm:max-w-lg overflow-y-auto p-0">
            {selectedBeacon && (
              <>
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
                  <SheetTitle className="text-white">Beacon Details</SheetTitle>
                </SheetHeader>

                <div className="px-6 py-6 space-y-8">
                  {/* Beacon Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Radio
                        className="h-8 w-8 text-[#00d9ff]"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.6))' }}
                      />
                      <div>
                        <h2 className="text-white text-xl">{selectedBeacon.name}</h2>
                        <p className="text-gray-400 text-sm">{selectedBeacon.id}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        selectedBeacon.active
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                      }
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          selectedBeacon.active ? 'bg-green-400' : 'bg-gray-400'
                        }`}
                        style={
                          selectedBeacon.active
                            ? { boxShadow: '0 0 10px rgba(74, 222, 128, 0.8)' }
                            : {}
                        }
                      />
                      {selectedBeacon.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Location */}
                  <Card className="p-4 bg-gray-950 border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-[#ff00ff]" />
                      <h3 className="text-white">Coordinates</h3>
                    </div>
                    <p className="text-gray-400">{selectedBeacon.coordinates}</p>
                  </Card>

                  {/* Active Game Template */}
                  {selectedBeacon.active && selectedBeacon.gameTemplate ? (
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <FileCode className="h-5 w-5 text-[#00d9ff]" />
                        <h3 className="text-white">Active Game Template</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[#00d9ff] text-lg">{selectedBeacon.gameTemplate}</span>
                          <Badge className="bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50">
                            {selectedBeacon.activeGames.length} {selectedBeacon.activeGames.length === 1 ? 'game' : 'games'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Type:</span>
                          <Badge className={getTemplateTypeColor(selectedBeacon.templateType)}>
                            <div className="flex items-center">
                              {getTemplateTypeIcon(selectedBeacon.templateType)}
                              {selectedBeacon.templateType === 'solo' ? 'Solo' : selectedBeacon.templateType === 'versus' ? 'Versus' : 'Group'}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-4 bg-gray-950 border-gray-800 text-center">
                      <p className="text-gray-500">No game template assigned</p>
                    </Card>
                  )}

                  {/* Active Games List */}
                  {selectedBeacon.active && selectedBeacon.activeGames.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Gamepad2 className="h-5 w-5 text-[#ff00ff]" />
                        <h3 className="text-white">Active Beacon Games</h3>
                      </div>
                      <div className="space-y-3">
                        {selectedBeacon.activeGames.map((game) => (
                          <Card key={game.id} className="p-4 bg-gray-950 border-gray-800">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-white">{game.id}</span>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                  <div
                                    className="w-2 h-2 rounded-full mr-2 bg-green-400"
                                    style={{ boxShadow: '0 0 10px rgba(74, 222, 128, 0.8)' }}
                                  />
                                  Live
                                </Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Started</span>
                                <span className="text-gray-300">{game.startTime}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Players</span>
                                <span className="text-[#ff00ff]">{game.playerCount}</span>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm mb-2">Participants</p>
                                <div className="flex flex-wrap gap-1">
                                  {game.players.map((player, index) => (
                                    <Badge
                                      key={index}
                                      className="bg-gray-800 text-gray-300 border-gray-700 text-xs"
                                    >
                                      {player}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Winner Selection Section */}
                              {renderWinnerSection(game, selectedBeacon.templateType)}

                              <Button 
                                className="w-full bg-red-500 hover:bg-red-600 text-white"
                                size="sm"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Game
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-800 space-y-3">
                    {selectedBeacon.active && selectedBeacon.activeGames.length > 0 && (
                      <Alert className="bg-yellow-500/10 border-yellow-500/50">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="text-yellow-200 text-sm">
                          End all active beacon games before changing template or deactivating.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {selectedBeacon.active ? (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button 
                                className="w-full bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
                                disabled={selectedBeacon.activeGames.length > 0}
                              >
                                <FileCode className="h-4 w-4 mr-2" />
                                Change Game Template
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {selectedBeacon.activeGames.length > 0 && (
                            <TooltipContent>
                              <p>End all active beacon games before changing template</p>
                            </TooltipContent>
                          )}
                        </Tooltip>

                        <Button className="w-full bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-white">
                          <Gamepad2 className="h-4 w-4 mr-2" />
                          Start New Beacon Game
                        </Button>
                        <p className="text-gray-500 text-xs text-center">
                          Creates a new game session using the {selectedBeacon.gameTemplate} template
                        </p>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button 
                                className="w-full bg-red-500 hover:bg-red-600 text-white"
                                disabled={selectedBeacon.activeGames.length > 0}
                              >
                                Deactivate Beacon
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {selectedBeacon.activeGames.length > 0 && (
                            <TooltipContent>
                              <p>End all active beacon games before deactivating</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </>
                    ) : (
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        Activate Beacon
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}