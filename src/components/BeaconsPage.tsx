import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Search, Eye, Radio, MapPin, Gamepad2, FileCode, AlertTriangle, Trophy, Users as UsersIcon, User, XCircle, Loader2, Play, UserPlus, UserMinus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { BeaconsService } from '../services/beacons';
import { BeaconGamesService, BeaconGamePlayersService } from '../services/beacon-games';
import { GameTemplatesService } from '../services/game-templates';
import { PlayersService } from '../services/players';
import { supabase } from '../lib/supabase';
import { Beacon, BeaconGameWithDetails, GameTemplate, Player, BeaconGamePlayerWithDetails } from '../types';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../contexts/AuthContext';

type GameType = 'solo' | 'versus' | 'group';

// Helper function to get relative time
const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};


// Extended beacon type for the UI
interface BeaconWithLocation extends Beacon {
  coordinates?: string; // Now stores the address
  gameTemplate?: string | null;
  templateType?: GameType | null;
  activeGames?: any[];
}


const getTemplateTypeColor = (type: GameType | null) => {
  switch (type?.toLowerCase()) {
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
  switch (type?.toLowerCase()) {
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
  const { isAuthenticated } = useAuth();
  const [beacons, setBeacons] = useState<BeaconWithLocation[]>([]);
  const [selectedBeacon, setSelectedBeacon] = useState<BeaconWithLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameOutcomes, setGameOutcomes] = useState<Record<string, 'win' | 'eliminated' | null>>({});
  const [gameOutcomesConfirmed, setGameOutcomesConfirmed] = useState<Record<string, boolean>>({});
  const [versusPlayerOutcomes, setVersusPlayerOutcomes] = useState<Record<string, Record<string, 'win' | 'eliminated' | null>>>({});
  const [updatingBeacon, setUpdatingBeacon] = useState<string | null>(null);
  const [gameTemplates, setGameTemplates] = useState<GameTemplate[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [assigningTemplate, setAssigningTemplate] = useState(false);
  const [isStartGameDialogOpen, setIsStartGameDialogOpen] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [isManageParticipantsDialogOpen, setIsManageParticipantsDialogOpen] = useState(false);
  const [selectedGameForParticipants, setSelectedGameForParticipants] = useState<any>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [managingParticipants, setManagingParticipants] = useState(false);
  const [cancelingGame, setCancelingGame] = useState<string | null>(null);
  const [isCreateBeaconDialogOpen, setIsCreateBeaconDialogOpen] = useState(false);
  const [creatingBeacon, setCreatingBeacon] = useState(false);
  const [endingGame, setEndingGame] = useState<string | null>(null);
  const [newBeacon, setNewBeacon] = useState({
    name: '',
    address: '',
    active: false
  });

  // Fetch beacons data function
  const fetchBeacons = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching beacons and active games...');
      
      // Fetch beacons, active games, and game templates in parallel
      const [beaconsData, activeGamesData, gameTemplatesData] = await Promise.all([
        BeaconsService.getAll(),
        BeaconGamesService.getActive(),
        GameTemplatesService.getAll()
      ]);

      // Debug: Let's also test a direct query to see what we get
      console.log('Testing direct query for active games with players...');
      const { data: directTest, error: directError } = await supabase
        .from('beacon_games')
        .select(`
          id,
          beacon_id,
          status,
          beacon_game_players(
            id,
            player_id,
            player_outcome,
            players!inner(username, avatar)
          )
        `)
        .eq('status', 'Active')
        .limit(1);
      
      if (directError) {
        console.error('Direct query error:', directError);
      } else {
        console.log('Direct query result:', directTest);
        if (directTest && directTest[0]?.beacon_game_players) {
          console.log('Direct query players:', directTest[0].beacon_game_players);
        }
      }
      
        console.log('Fetched beacons:', beaconsData);
        console.log('Fetched active games:', activeGamesData);
        console.log('Fetched game templates:', gameTemplatesData);
        
        // Debug: Check if we have any active games
        if (activeGamesData.length === 0) {
          console.log('No active games found in database');
        } else {
          console.log('Active games found:', activeGamesData.length);
          console.log('Sample active game:', activeGamesData[0]);
          if (activeGamesData[0]?.players) {
            console.log('Sample game players:', activeGamesData[0].players);
            console.log('Sample player structure:', activeGamesData[0].players[0]);
            const firstPlayer = activeGamesData[0].players[0] as BeaconGamePlayerWithDetails;
            console.log('Player username:', firstPlayer?.player_username);
            console.log('Player avatar:', firstPlayer?.player_avatar);
            console.log('Full player object keys:', Object.keys(activeGamesData[0].players[0] || {}));
          }
        }
      
      // Set game templates
      // Sort game templates by type (Solo, Versus, Group)
      const sortedTemplates = gameTemplatesData.sort((a, b) => {
        const typeOrder = { 'Solo': 1, 'Versus': 2, 'Group': 3 };
        const aOrder = typeOrder[a.type as keyof typeof typeOrder] || 4;
        const bOrder = typeOrder[b.type as keyof typeof typeOrder] || 4;
        return aOrder - bOrder;
      });
      setGameTemplates(sortedTemplates);
      
      // Process beacons with their active status and game template info
      const beaconsWithStatus = beaconsData.map((beacon) => {
        // Find active games for this beacon and transform them to match UI expectations
        const activeGamesForBeacon = activeGamesData
          .filter(game => game.beacon_id === beacon.id)
          .map(game => {
            console.log('Processing game:', game.id, 'with players:', game.players);
            if (game.players && game.players.length > 0) {
              console.log('First player in game:', game.players[0]);
              const firstPlayer = game.players[0] as BeaconGamePlayerWithDetails;
              console.log('Player username field:', firstPlayer?.player_username);
              console.log('Player avatar field:', firstPlayer?.player_avatar);
            }
            return {
              id: game.id,
              startTime: game.start_time ? getRelativeTime(game.start_time) : 'Unknown',
              playerCount: game.players?.length || 0,
              players: game.players || [], // This should already have player_username and player_avatar
              game_template_name: game.game_template_name,
              game_template_type: game.game_template_type,
              status: game.status
            };
          });
        
        // Get game template info from the beacon's assigned template or from active games
        let gameTemplate: string | null = null;
        let templateType: GameType | null = null;
        
        if (beacon.game_template_id) {
          // Use the beacon's assigned template
          const assignedTemplate = gameTemplatesData.find(t => t.id === beacon.game_template_id);
          gameTemplate = assignedTemplate?.name || null;
          templateType = (assignedTemplate?.type?.toLowerCase() as GameType) || null;
        } else if (activeGamesForBeacon.length > 0) {
          // Fallback to active game template if no assigned template
          const firstActiveGame = activeGamesForBeacon[0];
          gameTemplate = firstActiveGame?.game_template_name || null;
          templateType = (firstActiveGame?.game_template_type?.toLowerCase() as GameType) || null;
        }
        
        return {
          ...beacon,
          coordinates: beacon.address || 'No address',
          // Use the active field from the database instead of calculating it
          active: beacon.active,
          gameTemplate: gameTemplate,
          templateType: templateType,
          activeGames: activeGamesForBeacon,
        };
      });
      
      console.log('Processed beacons with status:', beaconsWithStatus);
      setBeacons(beaconsWithStatus);
      
    } catch (err) {
      console.error('Error fetching beacons:', err);
      setError('Failed to load beacons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch beacons data on component mount
  useEffect(() => {
    fetchBeacons();
  }, []);

  const filteredBeacons = beacons.filter((beacon) =>
    beacon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    beacon.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActiveGames = beacons.reduce((sum, b) => sum + (b.activeGames?.length || 0), 0);

  // Handle activating a beacon
  const handleActivateBeacon = async (beaconId: string) => {
    try {
      setUpdatingBeacon(beaconId);
      setError(null);
      
      console.log('Activating beacon:', beaconId);
      const updatedBeacon = await BeaconsService.activate(beaconId);
      console.log('Beacon activated successfully:', updatedBeacon);
      
      // Update the local state
      setBeacons(prevBeacons => 
        prevBeacons.map(beacon => 
          beacon.id === beaconId 
            ? { ...beacon, active: true }
            : beacon
        )
      );
      
      // Update the selected beacon if it's the one being activated
      if (selectedBeacon && selectedBeacon.id === beaconId) {
        setSelectedBeacon(prev => prev ? { ...prev, active: true } : null);
      }
      
      // Show success toast
      toast.success('Beacon activated successfully', {
        description: `Beacon ${beaconId} is now active`,
      });
      
      // Refresh the data to get the latest beacon information
      await fetchBeacons();
      
    } catch (err: any) {
      console.error('Error activating beacon:', err);
      const errorMessage = err?.message || 'Failed to activate beacon. Please try again.';
      setError(errorMessage);
      
      // Show error toast
      toast.error('Failed to activate beacon', {
        description: errorMessage,
      });
    } finally {
      setUpdatingBeacon(null);
    }
  };

  // Handle deactivating a beacon
  const handleDeactivateBeacon = async (beaconId: string) => {
    try {
      setUpdatingBeacon(beaconId);
      setError(null);
      
      // Check if beacon has active games
      const beacon = beacons.find(b => b.id === beaconId);
      if (beacon && beacon.activeGames && beacon.activeGames.length > 0) {
        const errorMessage = `Cannot deactivate beacon ${beaconId}. It has ${beacon.activeGames.length} active game(s). Please end all active games first.`;
        setError(errorMessage);
        
        // Show error toast
        toast.error('Cannot deactivate beacon', {
          description: errorMessage,
        });
        
        setUpdatingBeacon(null);
        return;
      }
      
      console.log('Deactivating beacon:', beaconId);
      const updatedBeacon = await BeaconsService.deactivate(beaconId);
      console.log('Beacon deactivated successfully:', updatedBeacon);
      
      // Update the local state
      setBeacons(prevBeacons => 
        prevBeacons.map(beacon => 
          beacon.id === beaconId 
            ? { ...beacon, active: false }
            : beacon
        )
      );
      
      // Update the selected beacon if it's the one being deactivated
      if (selectedBeacon && selectedBeacon.id === beaconId) {
        setSelectedBeacon(prev => prev ? { ...prev, active: false } : null);
      }
      
      // Show success toast
      toast.success('Beacon deactivated successfully', {
        description: `Beacon ${beaconId} is now inactive`,
      });
      
      // Refresh the data to get the latest beacon information
      await fetchBeacons();
      
    } catch (err: any) {
      console.error('Error deactivating beacon:', err);
      const errorMessage = err?.message || 'Failed to deactivate beacon. Please try again.';
      setError(errorMessage);
      
      // Show error toast
      toast.error('Failed to deactivate beacon', {
        description: errorMessage,
      });
    } finally {
      setUpdatingBeacon(null);
    }
  };

  // Handle assigning a game template to a beacon
  const handleAssignTemplate = async (beaconId: string, templateId: number) => {
    try {
      setAssigningTemplate(true);
      setError(null);
      
      // Check if beacon has active games
      const beacon = beacons.find(b => b.id === beaconId);
      if (beacon && beacon.activeGames && beacon.activeGames.length > 0) {
        const errorMessage = `Cannot change template: Beacon ${beaconId} has ${beacon.activeGames.length} active game(s). Please end all active games first.`;
        setError(errorMessage);
        
        // Show error toast
        toast.error('Cannot change template', {
          description: errorMessage,
        });
        
        setAssigningTemplate(false);
        return;
      }
      
      console.log('Assigning template to beacon:', beaconId, 'template:', templateId);
      
      // Assign the template to the beacon
      const updatedBeacon = await BeaconsService.assignTemplate(beaconId, templateId);
      
      // Get the assigned template details
      const assignedTemplate = gameTemplates.find(t => t.id === templateId);
      
      // Update the selected beacon immediately with the new template info
      if (selectedBeacon && selectedBeacon.id === beaconId) {
        setSelectedBeacon(prev => prev ? {
          ...prev,
          game_template_id: templateId,
          gameTemplate: assignedTemplate?.name || null,
          templateType: (assignedTemplate?.type?.toLowerCase() as GameType) || null
        } : null);
      }
      
      // Update the beacons list immediately
      setBeacons(prevBeacons => 
        prevBeacons.map(beacon => 
          beacon.id === beaconId 
            ? {
                ...beacon,
                game_template_id: templateId,
                gameTemplate: assignedTemplate?.name || null,
                templateType: (assignedTemplate?.type?.toLowerCase() as GameType) || null
              }
            : beacon
        )
      );
      
      // Close the dialog and reset form
      setIsTemplateDialogOpen(false);
      setSelectedTemplateId('');
      
      // Show success toast
      toast.success('Game template assigned successfully', {
        description: `Template "${assignedTemplate?.name}" assigned to beacon ${beaconId}`,
      });
      
      // Refresh the data to get the latest beacon information (for consistency)
      await fetchBeacons();
      
    } catch (err: any) {
      console.error('Error assigning template:', err);
      const errorMessage = err?.message || 'Failed to assign template. Please try again.';
      setError(errorMessage);
      
      // Show error toast
      toast.error('Failed to assign template', {
        description: errorMessage,
      });
    } finally {
      setAssigningTemplate(false);
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

  const isVersusOutcomeComplete = (gameId: string, players: any[]) => {
    const playerOutcomes = versusPlayerOutcomes[gameId] || {};
    const playerNames = players.map((p: any) => p.player_username || 'Unknown Player');
    
    // Check if all players have outcomes
    if (playerNames.length === 0) return false;
    
    return playerNames.every(playerName => {
      const outcome = playerOutcomes[playerName];
      return outcome === 'win' || outcome === 'eliminated';
    });
  };


  const handleOpenManageParticipants = async (game: any) => {
    setSelectedGameForParticipants(game);
    setIsManageParticipantsDialogOpen(true);
    
    // Fetch only active players
    try {
      const players = await PlayersService.getActivePlayers();
      setAllPlayers(players);
    } catch (err) {
      console.error('Error fetching active players:', err);
      toast.error('Failed to load active players');
    }
  };

  const handleAddParticipant = async (playerId: number) => {
    if (!selectedGameForParticipants) return;

    // Check if it's a solo game and already has a participant
    const isSoloGame = selectedGameForParticipants.game_template_type?.toLowerCase() === 'solo';
    const currentParticipantCount = selectedGameForParticipants.players?.length || 0;
    
    if (isSoloGame && currentParticipantCount >= 1) {
      toast.error('Solo games can only have 1 participant', {
        description: 'Remove the current participant before adding a new one'
      });
      return;
    }

    try {
      setManagingParticipants(true);
      
      // Use the BeaconGamePlayersService methods from beacon-games.ts
      const { data: newParticipant, error } = await supabase
        .from('beacon_game_players')
        .insert([{
          beacon_game_id: selectedGameForParticipants.id,
          player_id: playerId
        }])
        .select(`
          id,
          beacon_game_id,
          player_id,
          player_outcome,
          joined_at,
          players!inner(username, avatar)
        `)
        .single();

      if (error) throw error;

      toast.success('Participant added successfully');
      
      // Clear game outcomes when participant is added to ensure clean slate
      const gameId = selectedGameForParticipants.id;
      const gameType = selectedGameForParticipants.game_template_type?.toLowerCase();
      
      // Clear solo/group game outcomes
      setGameOutcomes(prev => {
        const newOutcomes = { ...prev };
        delete newOutcomes[gameId];
        return newOutcomes;
      });
      
      // Clear versus game player outcomes
      if (gameType === 'versus') {
        setVersusPlayerOutcomes(prev => {
          const newOutcomes = { ...prev };
          delete newOutcomes[gameId];
          return newOutcomes;
        });
      }
      
      // Clear confirmed outcomes
      setGameOutcomesConfirmed(prev => {
        const newConfirmed = { ...prev };
        delete newConfirmed[gameId];
        return newConfirmed;
      });
      
      // Update the selected game for participants immediately
      const addedPlayer = {
        id: newParticipant.id,
        beacon_game_id: newParticipant.beacon_game_id,
        player_id: newParticipant.player_id,
        player_outcome: newParticipant.player_outcome,
        joined_at: newParticipant.joined_at,
        player_username: newParticipant.players.username,
        player_avatar: newParticipant.players.avatar
      };

      setSelectedGameForParticipants(prev => ({
      ...prev,
        players: [...(prev?.players || []), addedPlayer]
      }));

      // Update the main beacons state to reflect the change
      setBeacons(prev => prev.map(beacon => {
        if (beacon.id === selectedBeacon?.id) {
          return {
            ...beacon,
            activeGames: beacon.activeGames?.map(game => {
              if (game.id === selectedGameForParticipants.id) {
                return {
                  ...game,
                  players: [...(game.players || []), addedPlayer]
                };
              }
              return game;
            })
          };
        }
        return beacon;
      }));

      // Update selectedBeacon state as well
      if (selectedBeacon) {
        setSelectedBeacon(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            activeGames: prev.activeGames?.map(game => {
              if (game.id === selectedGameForParticipants.id) {
                return {
                  ...game,
                  players: [...(game.players || []), addedPlayer]
                };
              }
              return game;
            })
          };
        });
      }
      
    } catch (err: any) {
      console.error('Error adding participant:', err);
      toast.error('Failed to add participant', {
        description: err?.message || 'Please try again'
      });
    } finally {
      setManagingParticipants(false);
    }
  };

  const handleRemoveParticipant = async (playerRecordId: number) => {
    if (!selectedGameForParticipants) return;

    try {
      setManagingParticipants(true);
      
      // Use direct Supabase call to remove participant
      const { error } = await supabase
        .from('beacon_game_players')
        .delete()
        .eq('id', playerRecordId);

      if (error) throw error;

      toast.success('Participant removed successfully');
      
      // Clear game outcomes when participant is removed to prevent stale state
      const gameId = selectedGameForParticipants.id;
      const gameType = selectedGameForParticipants.game_template_type?.toLowerCase();
      
      // Clear solo/group game outcomes
      setGameOutcomes(prev => {
        const newOutcomes = { ...prev };
        delete newOutcomes[gameId];
        return newOutcomes;
      });
      
      // Clear versus game player outcomes
      if (gameType === 'versus') {
        setVersusPlayerOutcomes(prev => {
          const newOutcomes = { ...prev };
          delete newOutcomes[gameId];
          return newOutcomes;
        });
      }
      
      // Clear confirmed outcomes
      setGameOutcomesConfirmed(prev => {
        const newConfirmed = { ...prev };
        delete newConfirmed[gameId];
        return newConfirmed;
      });
      
      // Update the selected game for participants immediately
      setSelectedGameForParticipants(prev => ({
        ...prev,
        players: prev?.players?.filter(player => player.id !== playerRecordId) || []
      }));

      // Update the main beacons state to reflect the change
      setBeacons(prev => prev.map(beacon => {
        if (beacon.id === selectedBeacon?.id) {
          return {
            ...beacon,
            activeGames: beacon.activeGames?.map(game => {
              if (game.id === selectedGameForParticipants.id) {
                return {
                  ...game,
                  players: game.players?.filter(player => player.id !== playerRecordId) || []
                };
              }
              return game;
            })
          };
        }
        return beacon;
      }));

      // Update selectedBeacon state as well
      if (selectedBeacon) {
        setSelectedBeacon(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            activeGames: prev.activeGames?.map(game => {
              if (game.id === selectedGameForParticipants.id) {
                return {
                  ...game,
                  players: game.players?.filter(player => player.id !== playerRecordId) || []
                };
              }
              return game;
            })
          };
        });
      }
      
    } catch (err: any) {
      console.error('Error removing participant:', err);
      toast.error('Failed to remove participant', {
        description: err?.message || 'Please try again'
      });
    } finally {
      setManagingParticipants(false);
    }
  };

  const handleStartGame = async () => {
    if (!selectedBeacon || (!selectedBeacon.game_template_id && !selectedBeacon.gameTemplate)) {
      toast.error('No game template selected for this beacon');
      return;
    }
    
    // Use game_template_id if available, otherwise we need to find it from the gameTemplate name
    let templateId = selectedBeacon.game_template_id;
    if (!templateId && selectedBeacon.gameTemplate) {
      // Find the template ID from the gameTemplate name
      const template = gameTemplates.find(t => t.name === selectedBeacon.gameTemplate);
      if (template) {
        templateId = template.id;
      } else {
        toast.error('Could not find template ID for the selected template');
        return;
      }
    }

    try {
      setStartingGame(true);
      
      // Create a new beacon game with the current template
      const newGame = await BeaconGamesService.create({
        beacon_id: selectedBeacon.id,
        game_template_id: templateId,
        status: 'Active'
      });

      toast.success('New game started successfully!');
      setIsStartGameDialogOpen(false);
      
      // Refresh the beacons data to show the new game
      await fetchBeacons();
      
      // Update selectedBeacon state to show the new game immediately
      if (selectedBeacon) {
        setSelectedBeacon(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            activeGames: [
              ...(prev.activeGames || []),
              {
                id: newGame.id,
                startTime: newGame.start_time ? getRelativeTime(newGame.start_time) : 'Just now',
                playerCount: 0,
                players: [],
                game_template_name: selectedBeacon.gameTemplate,
                game_template_type: selectedBeacon.templateType,
                status: 'Active'
              }
            ]
          };
        });
      }
      
    } catch (err: any) {
      console.error('Error starting game:', err);
      const errorMessage = err?.message || 'Failed to start game. Please try again.';
      toast.error('Failed to start game', { description: errorMessage });
    } finally {
      setStartingGame(false);
    }
  };

  const handleCancelGame = async (gameId: string) => {
    try {
      setCancelingGame(gameId);
      
      // Update the game status to 'Cancelled'
      await BeaconGamesService.update(gameId, {
        status: 'Cancelled',
        end_time: new Date().toISOString()
      });

      toast.success('Game cancelled successfully');
      
      // Refresh the beacons data to show the updated game status
      await fetchBeacons();
      
      // Update selectedBeacon state to remove the cancelled game from active games
      if (selectedBeacon) {
        setSelectedBeacon(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            activeGames: prev.activeGames?.filter(game => game.id !== gameId) || []
          };
        });
      }
      
    } catch (err: any) {
      console.error('Error cancelling game:', err);
      const errorMessage = err?.message || 'Failed to cancel game. Please try again.';
      toast.error('Failed to cancel game', { description: errorMessage });
    } finally {
      setCancelingGame(null);
    }
  };

  const handleCreateBeacon = async () => {
    // Validate required fields
    if (!newBeacon.name.trim() || !newBeacon.address.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreatingBeacon(true);
      
      // Create the beacon (ID will be auto-generated)
      await BeaconsService.create({
        name: newBeacon.name.trim(),
        address: newBeacon.address.trim(),
        active: newBeacon.active
      });

      toast.success('Beacon created successfully!');
      setIsCreateBeaconDialogOpen(false);
      
      // Reset form
      setNewBeacon({
        name: '',
        address: '',
        active: false
      });
      
      // Refresh the beacons data to show the new beacon
      await fetchBeacons();
      
    } catch (err: any) {
      console.error('Error creating beacon:', err);
      const errorMessage = err?.message || 'Failed to create beacon. Please try again.';
      toast.error('Failed to create beacon', { description: errorMessage });
    } finally {
      setCreatingBeacon(false);
    }
  };

  const handleConfirmOutcome = async (gameId: string, templateType: GameType | null) => {
    try {
      setEndingGame(gameId);
      
      // Get the current game outcome
      const gameOutcome = gameOutcomes[gameId];
      const versusOutcomes = versusPlayerOutcomes[gameId];
      
      console.log('Confirming outcome for game:', gameId);
      console.log('Template type:', templateType);
      console.log('Game outcome:', gameOutcome);
      console.log('Versus outcomes:', versusOutcomes);
      console.log('All game outcomes state:', gameOutcomes);
      console.log('All versus outcomes state:', versusPlayerOutcomes);
      
      if (!gameOutcome && !versusOutcomes) {
        toast.error('No outcome selected');
        return;
      }

      // Prepare outcome data for beacon_games table
      let outcomeData: any = {};
      
      if (templateType?.toLowerCase() === 'versus' && versusOutcomes) {
        // For versus games, create winners and eliminated arrays
        const winners: string[] = [];
        const eliminated: string[] = [];
        
        for (const [playerName, outcome] of Object.entries(versusOutcomes)) {
          if (outcome === 'win') {
            winners.push(playerName);
          } else {
            eliminated.push(playerName);
          }
        }
        
        outcomeData = {
          winners,
          eliminated
        };
      } else if (gameOutcome) {
        // For solo and group games, set the outcome
        outcomeData = {
          result: gameOutcome === 'win' ? 'won' : 'eliminated'
        };
      }

      // Update the game status to 'Completed', set end time, and update outcome
      console.log('Updating beacon game with outcome data:', outcomeData);
      await BeaconGamesService.update(gameId, {
        status: 'Completed',
        end_time: new Date().toISOString(),
        outcome: outcomeData
      });

      // Update player outcomes in beacon_game_players table
      // First, let's check what players are actually in this game
      // Fetch players with their usernames for proper identification
      console.log('🎯 CONFIRM OUTCOME DEBUG - Starting player outcome update');
      console.log('🎯 Game ID:', gameId);
      console.log('🎯 Template Type:', templateType);
      console.log('🎯 Game Outcome:', gameOutcome);
      
      const { data: gamePlayers, error: playersFetchError } = await supabase
        .from('beacon_game_players')
        .select(`
          id,
          player_id,
          player_outcome
        `)
        .eq('beacon_game_id', gameId);

      if (playersFetchError) {
        console.error('❌ Error fetching game players:', playersFetchError);
        toast.error('Failed to fetch game players');
        return;
      }

      console.log('🎯 Fetched game players:', gamePlayers);
      console.log('🎯 Number of players found:', gamePlayers?.length || 0);
      
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('Auth error:', authError);
      
      // Test if we can even read the data
      if (!gamePlayers || gamePlayers.length === 0) {
        console.error('No players found for this game! This might be a permissions issue.');
        toast.error('No players found for this game');
        return;
      }

      if (templateType?.toLowerCase() === 'versus' && versusOutcomes) {
        // For versus games, we need to get player usernames to match them
        // Let's fetch the player data separately for versus games
        const { data: versusGamePlayers, error: versusError } = await supabase
          .from('beacon_game_players')
          .select(`
            id,
            player_id,
            player_outcome,
            players!inner(username)
          `)
          .eq('beacon_game_id', gameId);
        
        if (versusError) {
          console.error('Error fetching versus game players:', versusError);
          toast.error('Failed to fetch versus game players');
          return;
        }
        
        console.log('Versus game players with usernames:', versusGamePlayers);
        
        // For versus games, update individual player outcomes
        console.log('Processing versus game outcomes:', versusOutcomes);
        for (const [playerName, outcome] of Object.entries(versusOutcomes)) {
          // Find the player record for this game
          const player = versusGamePlayers?.find((p: any) => p.players.username === playerName);
          
          if (player) {
            console.log(`Updating player ${playerName} (ID: ${player.id}) with outcome: ${outcome}`);
            
            // Try the update with explicit values
            const updateData = { 
              player_outcome: outcome === 'win' ? 'win' : 'eliminated'
            };
            
            console.log('Update data:', updateData);
            console.log('Player ID to update:', player.id);
            
            // Try SQL function first, fallback to direct update
            const { data: sqlData, error: sqlError } = await supabase.rpc('update_player_outcome_direct', {
              p_beacon_game_player_id: player.id,
              p_outcome: outcome === 'win' ? 'win' : 'eliminated'
            });
            
            if (sqlError) {
              console.error(`SQL function failed for ${playerName}, trying direct update:`, sqlError);
              
              // Fallback to direct update
              const { data, error } = await supabase
                .from('beacon_game_players')
                .update(updateData)
                .eq('id', player.id)
                .select();
              
              if (error) {
                console.error(`Error updating player ${playerName}:`, error);
                console.error('Error details:', error.message, error.details, error.hint);
              } else {
                console.log(`Successfully updated player ${playerName} via direct update:`, data);
                
                // Manually update player status if eliminated
                if (outcome === 'eliminated') {
                  console.log(`🚨 Manually updating ${playerName} status to Eliminated...`);
                  const { error: statusError } = await supabase
                    .from('players')
                    .update({ status: 'Eliminated' })
                    .eq('id', player.player_id);
                  
                  if (statusError) {
                    console.error('❌ Error updating player status:', statusError);
                  } else {
                    console.log('✅ Player status updated to Eliminated');
                  }
                }
              }
            } else {
              console.log(`Successfully updated player ${playerName} via SQL function:`, sqlData);
            }
          } else {
            console.error(`Player ${playerName} not found in game ${gameId}`);
            console.log('Available players:', versusGamePlayers);
          }
        }
      } else if (gameOutcome) {
        // For solo and group games, update all players with the same outcome
        console.log('🎯 PROCESSING SOLO/GROUP GAME OUTCOME');
        console.log('🎯 Game outcome:', gameOutcome);
        console.log('🎯 Players to update:', gamePlayers);
        
        if (!gamePlayers || gamePlayers.length === 0) {
          console.error('❌ No players found to update!');
          toast.error('No players found in this game');
          return;
        }
        
        for (const player of gamePlayers) {
          console.log(`🎯 UPDATING PLAYER: ID ${player.id} (Player ID: ${player.player_id})`);
          console.log('🎯 Current player data:', player);
          
          // Try the update with explicit values
          const updateData = { 
            player_outcome: gameOutcome === 'win' ? 'win' : 'eliminated'
          };
          
          console.log('🎯 Update data being sent:', updateData);
          console.log('🎯 Player ID to update:', player.id);
          console.log('🎯 Beacon game ID:', gameId);
          
          // Try the SQL function first, fallback to direct update if it fails
          console.log('🎯 Attempting update via SQL function...');
          const { data: sqlData, error: sqlError } = await supabase.rpc('update_player_outcome_direct', {
            p_beacon_game_player_id: player.id,
            p_outcome: gameOutcome === 'win' ? 'win' : 'eliminated'
          });
          
          if (sqlError) {
            console.error(`❌ SQL function failed, trying direct update for player ID ${player.id}:`, sqlError);
            
            // Fallback to direct update
            const { data: directData, error: directError } = await supabase
              .from('beacon_game_players')
              .update(updateData)
              .eq('id', player.id)
              .select();
            
            if (directError) {
              console.error(`❌ ERROR updating player ID ${player.id} (Player ID: ${player.player_id}):`, directError);
              console.error('❌ Error details:', directError.message, directError.details, directError.hint);
              console.error('❌ Error code:', directError.code);
            } else {
              console.log(`✅ SUCCESSFULLY updated player ID ${player.id} via direct update:`, directData);
              
              // Manually update player status if eliminated (since trigger might not work)
              if (gameOutcome === 'eliminated') {
                console.log('🚨 Manually updating player status to Eliminated...');
                const { error: statusError } = await supabase
                  .from('players')
                  .update({ status: 'Eliminated' })
                  .eq('id', player.player_id);
                
                if (statusError) {
                  console.error('❌ Error updating player status:', statusError);
                } else {
                  console.log('✅ Player status updated to Eliminated');
                }
              }
            }
          } else {
            console.log(`✅ SUCCESSFULLY updated player ID ${player.id} via SQL function:`, sqlData);
            console.log('✅ Updated player data:', sqlData?.[0]);
            
            // Log if player was eliminated (status will be automatically updated by trigger)
            if (gameOutcome === 'eliminated') {
              console.log('🚨 Player has been eliminated - status will be automatically updated to "Eliminated"');
            }
          }
        }
      }

      // Verify the updates worked by fetching the data again
      console.log('🎯 VERIFYING UPDATES - Fetching updated player data...');
      const { data: verifyPlayers, error: verifyError } = await supabase
        .from('beacon_game_players')
        .select(`
          id,
          player_id,
          player_outcome
        `)
        .eq('beacon_game_id', gameId);

      if (verifyError) {
        console.error('❌ Error verifying player updates:', verifyError);
      } else {
        console.log('🎯 VERIFICATION RESULT - Updated players:', verifyPlayers);
        verifyPlayers?.forEach((player, index) => {
          console.log(`🎯 Player ${index + 1}:`, {
            id: player.id,
            player_id: player.player_id,
            outcome: player.player_outcome
          });
        });
      }

      toast.success('Game completed successfully!');
      
      // Clear the outcome states for this game
      setGameOutcomes(prev => {
        const newOutcomes = { ...prev };
        delete newOutcomes[gameId];
        return newOutcomes;
      });
      setVersusPlayerOutcomes(prev => {
        const newOutcomes = { ...prev };
        delete newOutcomes[gameId];
        return newOutcomes;
      });
      setGameOutcomesConfirmed(prev => {
        const newConfirmed = { ...prev };
        delete newConfirmed[gameId];
        return newConfirmed;
      });
      
      // Refresh the beacons data to show the updated game status
      await fetchBeacons();
      
      // Update selectedBeacon state to remove the completed game from active games
      if (selectedBeacon) {
        setSelectedBeacon(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            activeGames: prev.activeGames?.filter(game => game.id !== gameId) || []
          };
        });
      }

      // Update last_game_at for all players in this game
      console.log('🎯 Updating last_game_at for all players in game:', gameId);
      const { data: gamePlayersForUpdate, error: playersUpdateError } = await supabase
        .from('beacon_game_players')
        .select('player_id')
        .eq('beacon_game_id', gameId);

      if (playersUpdateError) {
        console.error('❌ Error fetching players for last_game_at update:', playersUpdateError);
      } else if (gamePlayersForUpdate && gamePlayersForUpdate.length > 0) {
        const playerIds = gamePlayersForUpdate.map(p => p.player_id);
        console.log('🎯 Updating last_game_at for player IDs:', playerIds);
        
        const { error: updateLastGameError } = await supabase
          .from('players')
          .update({ last_game_at: new Date().toISOString() })
          .in('id', playerIds);

        if (updateLastGameError) {
          console.error('❌ Error updating last_game_at:', updateLastGameError);
        } else {
          console.log('✅ Successfully updated last_game_at for all players');
        }
      }
      
    } catch (err: any) {
      console.error('Error completing game:', err);
      const errorMessage = err?.message || 'Failed to complete game. Please try again.';
      toast.error('Failed to complete game', { description: errorMessage });
    } finally {
      setEndingGame(null);
    }
  };

  const renderWinnerSection = (game: any, templateType: GameType | null) => {
    if (!templateType) {
      // Show a fallback UI when template type is missing
      return (
        <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-yellow-500/30">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            Game Outcome (Template Type Unknown)
          </h4>
          <div className="space-y-2 mb-4">
            <div className="p-3 rounded-lg border-2 border-gray-800">
              <span className="text-gray-300">Cannot determine game type - template type is missing</span>
            </div>
          </div>
        </div>
      );
    }

    if (templateType?.toLowerCase() === 'solo') {
      const currentOutcome = gameOutcomes[game.id];
      const hasOutcome = currentOutcome != null;
      const hasParticipants = game.players && game.players.length > 0;
      const playerName = game.players && game.players.length > 0 ? game.players[0].player_username || 'Unknown Player' : 'Unknown Player';
      
      return (
        <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-[#00d9ff]/30">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#00d9ff]" />
            Game Outcome
          </h4>
          {!hasParticipants ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No participants in this game</p>
              <p className="text-gray-400 text-sm">Add participants to select game outcome</p>
            </div>
          ) : (
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
          )}
          <Tooltip>
            {isAuthenticated && (
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed" 
                    size="sm"
                    onClick={() => handleConfirmOutcome(game.id, templateType)}
                    disabled={!hasOutcome || !hasParticipants || endingGame === game.id}
                  >
                    {endingGame === game.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Ending...
                      </>
                    ) : (
                      'Confirm & End Game'
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
            )}
            {!hasParticipants ? (
              <TooltipContent>
                <p>Add participants to end the game</p>
              </TooltipContent>
            ) : !hasOutcome && (
              <TooltipContent>
                <p>Select a game outcome first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      );
    }

    if (templateType?.toLowerCase() === 'group') {
      const currentOutcome = gameOutcomes[game.id];
      const hasOutcome = currentOutcome != null;
      const hasParticipants = game.players && game.players.length > 0;
      
      return (
        <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-green-500/30">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-400" />
            Team Outcome
          </h4>
          {!hasParticipants ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No participants in this game</p>
              <p className="text-gray-400 text-sm">Add participants to select team outcome</p>
            </div>
          ) : (
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
          )}
          <Tooltip>
            {isAuthenticated && (
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed" 
                    size="sm"
                    onClick={() => handleConfirmOutcome(game.id, templateType)}
                    disabled={!hasOutcome || !hasParticipants || endingGame === game.id}
                  >
                    {endingGame === game.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Ending...
                      </>
                    ) : (
                      'Confirm & End Game'
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
            )}
            {!hasParticipants ? (
              <TooltipContent>
                <p>Add participants to end the game</p>
              </TooltipContent>
            ) : !hasOutcome && (
              <TooltipContent>
                <p>Select a team outcome first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      );
    }

    if (templateType?.toLowerCase() === 'versus') {
      const isComplete = isVersusOutcomeComplete(game.id, game.players);
      const hasParticipants = game.players && game.players.length > 0;
      
      return (
        <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-[#ff00ff]/30">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#ff00ff]" />
            Player Outcomes
          </h4>
          {!hasParticipants ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No participants in this game</p>
              <p className="text-gray-400 text-sm">Add participants to select player outcomes</p>
            </div>
          ) : (
          <div className="space-y-2 mb-4">
            <p className="text-gray-400 text-sm">Mark players as winners or eliminated:</p>
              {game.players.map((player: any, index: number) => {
                const playerName = player.player_username || 'Unknown Player';
                const outcome = versusPlayerOutcomes[game.id]?.[playerName];
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <span className="text-white">{playerName}</span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className={outcome === 'win' 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_12px_rgba(74,222,128,0.5)]' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
                      }
                        onClick={() => handleVersusPlayerOutcome(game.id, playerName, 'win')}
                    >
                      Won
                    </Button>
                    <Button 
                      size="sm" 
                      className={outcome === 'eliminated'
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
                      }
                        onClick={() => handleVersusPlayerOutcome(game.id, playerName, 'eliminated')}
                    >
                      Eliminated
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
          <Tooltip>
            {isAuthenticated && (
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
                    size="sm"
                    onClick={() => handleConfirmOutcome(game.id, templateType)}
                    disabled={!isComplete || !hasParticipants}
                  >
                    Confirm & End Game
                  </Button>
                </div>
              </TooltipTrigger>
            )}
            {!hasParticipants ? (
              <TooltipContent>
                <p>Add participants to end the game</p>
              </TooltipContent>
            ) : !isComplete && (
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
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search beacons by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>
            {isAuthenticated && (
              <Button
                onClick={() => setIsCreateBeaconDialogOpen(true)}
                className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
              >
                <Radio className="h-4 w-4" />
              </Button>
            )}
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
              <span className="text-green-400 text-3xl">
                {beacons.filter(b => b.active).length}
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-gray-400">Loading beacons...</span>
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
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Beacon ID</TableHead>
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
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
                      {beacon.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      {beacon.active ? (
                        <span className="text-[#ff00ff]">
                          {beacon.activeGames?.length || 0}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBeacon(beacon)}
                        className="text-[#00d9ff] border-[#00d9ff]/30 hover:bg-[#00d9ff]/10 hover:text-[#00d9ff] hover:border-[#00d9ff]/50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Beacon
                      </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {isAuthenticated && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => beacon.active ? handleDeactivateBeacon(beacon.id) : handleActivateBeacon(beacon.id)}
                                  disabled={updatingBeacon === beacon.id || (beacon.active && beacon.activeGames && beacon.activeGames.length > 0)}
                                  className={
                                    beacon.active 
                                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-400" 
                                      : "text-green-400 hover:bg-green-500/10 hover:text-green-400"
                                  }
                                >
                                  {updatingBeacon === beacon.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : beacon.active ? (
                                    <XCircle className="h-4 w-4" />
                                  ) : (
                                    <Radio className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </TooltipTrigger>
                            {beacon.active && beacon.activeGames && beacon.activeGames.length > 0 ? (
                              <TooltipContent>
                                <p>Cannot deactivate: {beacon.activeGames.length} active game(s)</p>
                              </TooltipContent>
                            ) : (
                              <TooltipContent>
                                <p>{beacon.active ? 'Deactivate beacon' : 'Activate beacon'}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
          )}
        </Card>

        {/* Beacon Detail Side Panel */}
        <Sheet open={selectedBeacon !== null} onOpenChange={() => setSelectedBeacon(null)}>
          <SheetContent className="bg-gray-900 border-l border-gray-800 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto p-0">
            {selectedBeacon && (
              <>
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-white">Beacon Details</SheetTitle>
                    <button
                      onClick={() => setSelectedBeacon(null)}
                      className="text-gray-400 hover:text-white text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>
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
                      {selectedBeacon.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Location */}
                  <Card className="p-4 bg-gray-950 border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-[#ff00ff]" />
                      <h3 className="text-white">Location</h3>
                    </div>
                    <p className="text-gray-400">{selectedBeacon.coordinates || 'No address available'}</p>
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
                            {selectedBeacon.activeGames?.length || 0} {(selectedBeacon.activeGames?.length || 0) === 1 ? 'game' : 'games'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Type:</span>
                          <Badge className={getTemplateTypeColor(selectedBeacon.templateType)}>
                            <div className="flex items-center">
                              {getTemplateTypeIcon(selectedBeacon.templateType)}
                              {selectedBeacon.templateType === 'solo' ? 'Solo' : selectedBeacon.templateType === 'versus' ? 'Versus' : selectedBeacon.templateType === 'group' ? 'Group' : 'Unknown'}
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
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Gamepad2 className="h-5 w-5 text-[#ff00ff]" />
                      <h3 className="text-white">Active Beacon Games ({selectedBeacon.activeGames?.length || 0})</h3>
                      </div>
                    {selectedBeacon.activeGames && selectedBeacon.activeGames.length > 0 ? (
                      <div className="space-y-4">
                        {selectedBeacon.activeGames.map((game, index) => (
                          <Card key={index} className="p-4 bg-gray-950 border-gray-800">
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
                                <span className="text-[#ff00ff]">{game.players?.length || 0}</span>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-gray-400 text-sm">Participants</p>
                                  {isAuthenticated && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenManageParticipants(game)}
                                      className="text-[#00d9ff] hover:bg-[#00d9ff]/10 hover:text-[#00d9ff] h-6 px-2"
                                    >
                                      <UsersIcon className="h-3 w-3 mr-1" />
                                      Manage
                                    </Button>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {game.players?.map((player, playerIndex) => {
                                    const playerWithDetails = player as BeaconGamePlayerWithDetails;
                                    const username = playerWithDetails.player_username || `Player ${playerIndex + 1}`;
                                    
                                    return (
                                      <Badge
                                        key={playerIndex}
                                        className="bg-gray-800 text-gray-300 border-gray-700 text-xs"
                                      >
                                        {username}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Winner Selection Section */}
                            {renderWinnerSection(game, game.game_template_type)}

                              {isAuthenticated && (
                                <Button 
                                  className="w-full bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                                  size="sm"
                                  onClick={() => handleCancelGame(game.id)}
                                  disabled={cancelingGame === game.id}
                                >
                                  {cancelingGame === game.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Cancelling...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancel Game
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-4 bg-gray-950 border-gray-800 text-center">
                        <p className="text-gray-500">No active games</p>
                      </Card>
                    )}
                  </div>

                  {/* Warning Message */}
                  {selectedBeacon.activeGames && selectedBeacon.activeGames.length > 0 && (
                    <div className="bg-gray-900 border border-gray-700 text-gray-400 px-4 py-3 rounded-md flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-4 w-4 text-gray-400" />
                      <span>End all active beacon games before changing template or deactivating.</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-800 space-y-3">
                    {selectedBeacon.active ? (
                      <>
                        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                          {isAuthenticated && (
                            <DialogTrigger asChild>
                                <Button 
                                className="w-full bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black disabled:bg-gray-600 disabled:cursor-not-allowed"
                                disabled={selectedBeacon.activeGames && selectedBeacon.activeGames.length > 0}
                                >
                                  <FileCode className="h-4 w-4 mr-2" />
                                {selectedBeacon.activeGames && selectedBeacon.activeGames.length > 0 
                                  ? `Cannot Change Template (${selectedBeacon.activeGames.length} Active Games)`
                                  : 'Change Game Template'
                                }
                                </Button>
                            </DialogTrigger>
                          )}
                          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white text-2xl">Select Game Template</DialogTitle>
                              <DialogDescription className="text-gray-400 text-sm">
                                Choose a game template for beacon {selectedBeacon.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 mt-6">
                              <div className="space-y-3">
                                <label className="text-gray-400 text-sm block">Game Template</label>
                                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                  <SelectTrigger className="bg-gray-950 border-gray-800 text-white h-12">
                                    <SelectValue placeholder="Select a game template" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-950 border-gray-800 max-h-60">
                                    {gameTemplates.map((template) => (
                                      <SelectItem key={template.id} value={template.id.toString()} className="text-white hover:bg-gray-800 py-3 px-4">
                                        <div className="flex items-center gap-3 w-full">
                                          <Badge className={getTemplateTypeColor(template.type.toLowerCase() as GameType)}>
                                            {getTemplateTypeIcon(template.type.toLowerCase() as GameType)}
                                            {template.type}
                                          </Badge>
                                          <span className="flex-1 truncate">{template.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleAssignTemplate(selectedBeacon.id, parseInt(selectedTemplateId))}
                                  disabled={!selectedTemplateId || assigningTemplate}
                                  className="flex-1 bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
                                >
                                  {assigningTemplate ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Assigning...
                                    </>
                                  ) : (
                                    'Assign Template'
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsTemplateDialogOpen(false)}
                                  className="border-gray-700 text-gray-400 hover:bg-gray-800"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          className="w-full bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-white"
                          onClick={() => setIsStartGameDialogOpen(true)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start New Game
                        </Button>
                        <p className="text-gray-500 text-xs text-center">
                          Creates a new game session on this beacon
                        </p>
                              <Button 
                          className="w-full bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                          onClick={() => handleDeactivateBeacon(selectedBeacon.id)}
                          disabled={updatingBeacon === selectedBeacon.id || (selectedBeacon.activeGames && selectedBeacon.activeGames.length > 0)}
                        >
                          {updatingBeacon === selectedBeacon.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deactivating...
                            </>
                          ) : selectedBeacon.activeGames && selectedBeacon.activeGames.length > 0 ? (
                            `Cannot Deactivate (${selectedBeacon.activeGames.length} Active Games)`
                          ) : (
                            'Deactivate Beacon'
                          )}
                              </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className="w-full bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-white"
                          onClick={() => handleActivateBeacon(selectedBeacon.id)}
                          disabled={updatingBeacon === selectedBeacon.id}
                        >
                          {updatingBeacon === selectedBeacon.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Activating...
                      </>
                    ) : (
                            <>
                              <Gamepad2 className="h-4 w-4 mr-2" />
                        Activate Beacon
                            </>
                          )}
                      </Button>
                        <p className="text-gray-500 text-xs text-center">
                          Activate this beacon to enable game sessions
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Manage Participants Dialog */}
        {isAuthenticated && (
          <Dialog open={isManageParticipantsDialogOpen} onOpenChange={setIsManageParticipantsDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Manage Participants - {selectedGameForParticipants?.id}</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                Add or remove players from this game
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Current Participants */}
              <div>
                <h4 className="text-white font-medium mb-2">Current Participants ({selectedGameForParticipants?.players?.length || 0})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedGameForParticipants?.players && selectedGameForParticipants.players.length > 0 ? (
                    selectedGameForParticipants.players.map((player: any) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-gray-950 rounded border border-gray-800">
                        <span className="text-white">{player.player_username}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveParticipant(player.id)}
                          disabled={managingParticipants}
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-400 h-8"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No participants yet</p>
                  )}
                </div>
              </div>

              {/* Add Participants */}
              <div>
                <h4 className="text-white font-medium mb-2">Add Participants</h4>
                {selectedGameForParticipants?.game_template_type?.toLowerCase() === 'solo' && (
                  <p className="text-gray-400 text-sm mb-3">
                    Solo games can only have 1 participant. Remove the current participant to add a different one.
                  </p>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allPlayers
                    .filter(p => !selectedGameForParticipants?.players?.some((gp: any) => gp.player_id === p.id))
                    .map((player) => {
                      const isSoloGame = selectedGameForParticipants?.game_template_type?.toLowerCase() === 'solo';
                      const hasParticipant = (selectedGameForParticipants?.players?.length || 0) >= 1;
                      const isDisabled = managingParticipants || (isSoloGame && hasParticipant);
                      
                      return (
                        <div key={player.id} className="flex items-center justify-between p-2 bg-gray-950 rounded border border-gray-800">
                          <span className="text-white">{player.username}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddParticipant(player.id)}
                            disabled={isDisabled}
                            className={`h-8 ${
                              isDisabled 
                                ? 'text-gray-500 cursor-not-allowed' 
                                : 'text-green-400 hover:bg-green-500/10 hover:text-green-400'
                            }`}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      );
                    })}
                  {allPlayers.filter(p => !selectedGameForParticipants?.players?.some((gp: any) => gp.player_id === p.id)).length === 0 && (
                    <p className="text-gray-500 text-center py-4">All players are already participating</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setIsManageParticipantsDialogOpen(false)}
                  className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}

        {/* Start New Game Dialog */}
        {isAuthenticated && (
          <Dialog open={isStartGameDialogOpen} onOpenChange={setIsStartGameDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Start New Game</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                Start a new game with the current template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">
                  Start a new game on beacon <span className="text-[#00d9ff]">{selectedBeacon?.id}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Template: <span className="text-white">{selectedBeacon?.gameTemplate}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Type: <span className="text-white">{selectedBeacon?.templateType}</span>
                </p>
              </div>
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                <p className="text-gray-300 text-sm">
                  This will create a new game session with the current template. You can add participants after the game is created.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsStartGameDialogOpen(false)}
                  className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartGame}
                  disabled={startingGame}
                  className="bg-[#ff00ff] hover:bg-[#ff00ff]/90 text-white"
                >
                  {startingGame ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Game
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        )}

        {/* Create Beacon Dialog */}
        {isAuthenticated && (
          <Dialog open={isCreateBeaconDialogOpen} onOpenChange={setIsCreateBeaconDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Beacon</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                Create a new beacon location for games
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Beacon Name */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Beacon Name *</label>
                <Input
                  placeholder="e.g., Downtown Plaza"
                  value={newBeacon.name}
                  onChange={(e) => setNewBeacon(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                />
                <p className="text-gray-500 text-xs mt-1">Display name for the beacon</p>
              </div>

              {/* Address */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Address *</label>
                <Input
                  placeholder="e.g., 123 Main St, City, State"
                  value={newBeacon.address}
                  onChange={(e) => setNewBeacon(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-gray-950 border-gray-800 text-white placeholder:text-gray-500"
                />
                <p className="text-gray-500 text-xs mt-1">Physical location of the beacon</p>
              </div>

              {/* Active Status */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Initial Status</label>
                <div className="p-4 bg-gray-950/50 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      id="active"
                      checked={newBeacon.active}
                      onChange={(e) => setNewBeacon(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-5 h-5 text-[#00d9ff] bg-gray-800 border-2 border-gray-600 rounded focus:ring-[#00d9ff] focus:ring-2 focus:ring-offset-0"
                    />
                    <div className="flex flex-col">
                      <label htmlFor="active" className="text-white text-sm cursor-pointer font-medium">
                        Active Beacon
                      </label>
                      <span className="text-xs text-gray-400 mt-0.5">
                        {newBeacon.active ? 'Ready for games' : 'Inactive - will need activation'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateBeaconDialogOpen(false)}
                  className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBeacon}
                  disabled={creatingBeacon}
                  className="bg-[#00d9ff] hover:bg-[#00d9ff]/90 text-black"
                >
                  {creatingBeacon ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Radio className="h-4 w-4 mr-2" />
                      Create Beacon
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}