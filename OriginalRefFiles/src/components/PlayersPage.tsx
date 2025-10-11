import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Search, Eye, X, Trophy, Target, Calendar, Clock, UserCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';

const players = [
  {
    id: 1,
    username: 'ShadowRunner',
    status: 'Active',
    wins: 47,
    totalGames: 132,
    lastGame: '2 min ago',
    joinDate: '2024-01-15',
    avatar: 'SR',
    bio: 'Veteran player specializing in urban combat tactics. Known for stealth approaches.',
    favorPoints: 2847,
    eliminationRate: 0.65,
    winRate: 0.36,
  },
  {
    id: 2,
    username: 'Phoenix',
    status: 'Active',
    wins: 43,
    totalGames: 128,
    lastGame: '18 min ago',
    joinDate: '2024-01-20',
    avatar: 'PX',
    bio: 'Strategic mastermind with exceptional team coordination skills.',
    favorPoints: 2654,
    eliminationRate: 0.58,
    winRate: 0.34,
  },
  {
    id: 3,
    username: 'Ghost',
    status: 'Active',
    wins: 41,
    totalGames: 145,
    lastGame: '5 min ago',
    joinDate: '2024-01-12',
    avatar: 'GH',
    bio: 'Silent and deadly. Prefers long-range engagements.',
    favorPoints: 2512,
    eliminationRate: 0.71,
    winRate: 0.28,
  },
  {
    id: 4,
    username: 'NightHawk',
    status: 'Eliminated',
    wins: 38,
    totalGames: 119,
    lastGame: '5 min ago',
    joinDate: '2024-02-01',
    avatar: 'NH',
    bio: 'Aggressive playstyle focused on rapid eliminations.',
    favorPoints: 2398,
    eliminationRate: 0.62,
    winRate: 0.32,
  },
  {
    id: 5,
    username: 'Vortex',
    status: 'Active',
    wins: 36,
    totalGames: 104,
    lastGame: '32 min ago',
    joinDate: '2024-02-10',
    avatar: 'VX',
    bio: 'Unpredictable tactics and creative strategies.',
    favorPoints: 2156,
    eliminationRate: 0.55,
    winRate: 0.35,
  },
  {
    id: 6,
    username: 'Titan',
    status: 'Forfeit',
    wins: 28,
    totalGames: 89,
    lastGame: '4 days ago',
    joinDate: '2024-01-25',
    avatar: 'TN',
    bio: 'Defensive specialist with strong territorial control.',
    favorPoints: 1847,
    eliminationRate: 0.48,
    winRate: 0.31,
  },
  {
    id: 7,
    username: 'Cipher',
    status: 'Active',
    wins: 32,
    totalGames: 97,
    lastGame: '1 hour ago',
    joinDate: '2024-02-05',
    avatar: 'CP',
    bio: 'Cryptic movements and calculated risks.',
    favorPoints: 2034,
    eliminationRate: 0.59,
    winRate: 0.33,
  },
  {
    id: 8,
    username: 'Raven',
    status: 'Active',
    wins: 29,
    totalGames: 86,
    lastGame: '45 min ago',
    joinDate: '2024-02-15',
    avatar: 'RV',
    bio: 'Swift and agile, excels in close-quarters combat.',
    favorPoints: 1923,
    eliminationRate: 0.61,
    winRate: 0.34,
  },
];

const gameHistory = [
  { game: 'Urban Assault', result: 'Won', beacon: 'B-001', date: '2 min ago', favorEarned: 245 },
  { game: 'Shadow Protocol', result: 'Eliminated', beacon: 'B-015', date: '2 hours ago', favorEarned: 85 },
  { game: 'Territory Control', result: 'Won', beacon: 'B-007', date: '5 hours ago', favorEarned: 312 },
  { game: 'Night Raid', result: 'Won', beacon: 'B-023', date: '1 day ago', favorEarned: 278 },
  { game: 'Urban Assault', result: 'Eliminated', beacon: 'B-031', date: '2 days ago', favorEarned: 92 },
];

export function PlayersPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<typeof players[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = players.filter((player) => {
    const matchesStatus = filterStatus === 'all' || player.status === filterStatus;
    const matchesSearch = player.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white mb-2">Players</h1>
        <p className="text-gray-400">View all registered players</p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-gray-900 border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search players..."
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
              variant={filterStatus === 'Eliminated' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Eliminated')}
              className={
                filterStatus === 'Eliminated'
                  ? 'bg-red-500 text-black hover:bg-red-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              Eliminated
            </Button>
            <Button
              variant={filterStatus === 'Forfeit' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('Forfeit')}
              className={
                filterStatus === 'Forfeit'
                  ? 'bg-orange-500 text-black hover:bg-orange-500/90'
                  : 'border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            >
              Forfeit
            </Button>
          </div>
        </div>
      </Card>

      {/* Players Table */}
      <Card className="bg-gray-900 border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400">Username</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Wins</TableHead>
              <TableHead className="text-gray-400">Total Games</TableHead>
              <TableHead className="text-gray-400">Last Game</TableHead>
              <TableHead className="text-gray-400">Join Date</TableHead>
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
                <TableCell className="text-[#ff00ff]">{player.wins}</TableCell>
                <TableCell className="text-gray-400">{player.totalGames}</TableCell>
                <TableCell className="text-gray-400">{player.lastGame}</TableCell>
                <TableCell className="text-gray-400">{player.joinDate}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPlayer(player)}
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

      {/* Player Detail Side Panel */}
      <Sheet open={selectedPlayer !== null} onOpenChange={() => setSelectedPlayer(null)}>
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
                      {selectedPlayer.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-white text-xl mb-2">{selectedPlayer.username}</h2>
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
                  <p className="text-gray-400 text-sm leading-relaxed">{selectedPlayer.bio}</p>
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
                      <p className="text-white text-2xl">{selectedPlayer.wins}</p>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-[#00d9ff]" />
                        <p className="text-gray-400 text-sm">Total Games</p>
                      </div>
                      <p className="text-white text-2xl">{selectedPlayer.totalGames}</p>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-[#ff00ff]" />
                        <p className="text-gray-400 text-sm">Join Date</p>
                      </div>
                      <p className="text-white text-sm">{selectedPlayer.joinDate}</p>
                    </Card>
                    <Card className="p-4 bg-gray-950 border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-[#00d9ff]" />
                        <p className="text-gray-400 text-sm">Last Game</p>
                      </div>
                      <p className="text-white text-sm">{selectedPlayer.lastGame}</p>
                    </Card>
                  </div>
                </div>

                {/* Favor Points */}
                <Card className="p-6 bg-gray-950 border-gray-800">
                  <h3 className="text-white mb-4">Favor Points</h3>
                  <p className="text-5xl bg-gradient-to-r from-[#00d9ff] to-[#ff00ff] bg-clip-text text-transparent">
                    {selectedPlayer.favorPoints}
                  </p>
                </Card>

                {/* Game History */}
                <div>
                  <h3 className="text-white mb-4">Recent Game History</h3>
                  <div className="space-y-3">
                    {gameHistory.map((game, index) => (
                      <Card key={index} className="p-4 bg-gray-950 border-gray-800 hover:border-gray-700 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-white text-sm mb-1">{game.game}</p>
                            <p className="text-gray-500 text-xs">{game.beacon}</p>
                          </div>
                          <Badge
                            className={
                              game.result === 'Won'
                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                : 'bg-red-500/20 text-red-400 border-red-500/50'
                            }
                          >
                            {game.result}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{game.date}</span>
                          <span className="text-[#ff00ff]">+{game.favorEarned} favor points</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {(selectedPlayer.status === 'Eliminated' || selectedPlayer.status === 'Forfeit') && (
                  <>
                    <Separator className="bg-gray-800" />
                    <Button className="w-full bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Reinstate Player
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}