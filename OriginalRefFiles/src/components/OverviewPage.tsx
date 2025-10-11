import { Card } from './ui/card';
import { Users, Radio, Gamepad2, UserCheck, UserX } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const statsCards = [
  { label: 'Total Players', value: '1,842', icon: Users, color: 'blue', change: '+124 this month' },
  { label: 'Active Players', value: '1,247', icon: UserCheck, color: 'blue', change: '+12% from last week' },
  { label: 'Eliminated Players', value: '482', icon: UserX, color: 'magenta', change: '26% of total' },
  { label: 'Active Beacons', value: '48', icon: Radio, color: 'blue', change: '3 offline' },
  { label: 'Active Games', value: '12', icon: Gamepad2, color: 'magenta', change: '4 scheduled' },
];

const beaconStatuses = [
  { id: 'B-001', name: 'Downtown Alpha', status: 'active', x: 20, y: 30, coordinates: '40.7128° N, 74.0060° W' },
  { id: 'B-007', name: 'Harbor Beta', status: 'active', x: 45, y: 70, coordinates: '40.7589° N, 73.9851° W' },
  { id: 'B-015', name: 'Industrial Gamma', status: 'active', x: 70, y: 45, coordinates: '40.7489° N, 73.9680° W' },
  { id: 'B-023', name: 'Park Delta', status: 'inactive', x: 30, y: 60, coordinates: '40.7829° N, 73.9654° W' },
  { id: 'B-031', name: 'Bridge Epsilon', status: 'active', x: 55, y: 25, coordinates: '40.7061° N, 74.0087° W' },
  { id: 'B-047', name: 'Tower Zeta', status: 'active', x: 80, y: 80, coordinates: '40.7580° N, 73.9855° W' },
  { id: 'B-052', name: 'Mall Theta', status: 'inactive', x: 15, y: 85, coordinates: '40.7614° N, 73.9776° W' },
  { id: 'B-068', name: 'Station Omega', status: 'active', x: 65, y: 55, coordinates: '40.7527° N, 73.9772° W' },
];

const topPlayers = [
  { username: 'ShadowRunner', status: 'Active', wins: 47, games: 132, lastGame: '2 min ago' },
  { username: 'Phoenix', status: 'Active', wins: 43, games: 128, lastGame: '18 min ago' },
  { username: 'Ghost', status: 'Active', wins: 41, games: 145, lastGame: '5 min ago' },
  { username: 'NightHawk', status: 'Eliminated', wins: 38, games: 119, lastGame: '5 min ago' },
  { username: 'Vortex', status: 'Active', wins: 36, games: 104, lastGame: '32 min ago' },
  { username: 'Cipher', status: 'Active', wins: 34, games: 98, lastGame: '1 hour ago' },
];

const activeBeacons = [
  { name: 'Downtown Alpha', game: 'Urban Assault', players: 8, startTime: '45 min ago' },
  { name: 'Harbor Beta', game: 'Territory Control', players: 6, startTime: '1 hour ago' },
  { name: 'Industrial Gamma', game: 'Shadow Protocol', players: 4, startTime: '23 min ago' },
];

type GameType = 'Solo' | 'Versus' | 'Group';

const activeGames = [
  { id: 'BG-1847', template: 'Urban Assault', type: 'Solo' as GameType, beaconId: 'B-001', beaconName: 'Downtown Alpha', players: 8, startTime: '45 min ago' },
  { id: 'BG-1848', template: 'Territory Control', type: 'Versus' as GameType, beaconId: 'B-007', beaconName: 'Harbor Beta', players: 6, startTime: '1 hour ago' },
  { id: 'BG-1849', template: 'Shadow Protocol', type: 'Group' as GameType, beaconId: 'B-015', beaconName: 'Industrial Gamma', players: 4, startTime: '23 min ago' },
];

const getTypeBadgeColor = (type: GameType) => {
  if (type === 'Solo') return 'bg-[#00d9ff]/20 text-[#00d9ff] border-[#00d9ff]/50';
  if (type === 'Versus') return 'bg-[#ff00ff]/20 text-[#ff00ff] border-[#ff00ff]/50';
  return 'bg-green-500/20 text-green-400 border-green-500/50';
};

export function OverviewPage() {
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

        {/* Mini Map with Beacon Statuses */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="h-5 w-5 text-[#ff00ff]" />
            <h3 className="text-white">Beacon Map</h3>
          </div>
          <div className="relative w-full aspect-square bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full w-px bg-[#00d9ff]" style={{ left: `${i * 10}%` }} />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full h-px bg-[#00d9ff]" style={{ top: `${i * 10}%` }} />
              ))}
            </div>
            {/* Beacons */}
            {beaconStatuses.map((beacon) => (
              <Tooltip key={beacon.id}>
                <TooltipTrigger asChild>
                  <div
                    className="absolute group cursor-pointer"
                    style={{ left: `${beacon.x}%`, top: `${beacon.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${
                        beacon.status === 'active' ? 'bg-[#00d9ff]' : 'bg-gray-600'
                      }`}
                      style={
                        beacon.status === 'active'
                          ? {
                              boxShadow: '0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4)',
                            }
                          : {}
                      }
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-700">
                  <div className="text-white">{beacon.name}</div>
                  <div className="text-[#00d9ff] text-xs">{beacon.id}</div>
                  <div className="text-gray-400 text-xs mt-1">{beacon.coordinates}</div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00d9ff]" style={{ boxShadow: '0 0 10px rgba(0, 217, 255, 0.8)' }} />
              <span className="text-gray-400">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-600" />
              <span className="text-gray-400">Inactive</span>
            </div>
          </div>
        </Card>

        {/* Summary Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Players */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h3 className="text-white mb-4">Top Active Players</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Player</TableHead>
                  <TableHead className="text-gray-400">Wins</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPlayers.filter(player => player.status === 'Active').slice(0, 5).map((player, index) => (
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

          {/* Active Games */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h3 className="text-white mb-4">Active Games</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">ID</TableHead>
                  <TableHead className="text-gray-400">Game Name</TableHead>
                  <TableHead className="text-gray-400">Beacon</TableHead>
                  <TableHead className="text-gray-400">Players</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeGames.map((game, index) => (
                  <TableRow key={index} className="border-gray-800">
                    <TableCell className="text-white">{game.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400">{game.template}</span>
                        <Badge className={getTypeBadgeColor(game.type)}>
                          {game.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#00d9ff]">{game.beaconName}</TableCell>
                    <TableCell className="text-[#ff00ff]">{game.players}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}