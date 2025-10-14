import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Mail, LogOut, Gamepad2, Calendar, Clock, UserCircle, FileText, Trophy, Target, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useUserAuth } from '../contexts/UserAuthContext';
import { UserPlayerConnectionService } from '../services/user-player-connection';
import { Player } from '../types';
import { PlayersService } from '../services/players';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
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
const getCountdownFromLastGame = (dateString: string | null, playerStatus: string): string => {
  // Show dash for eliminated players since countdown is irrelevant
  if (playerStatus === 'Eliminated') return '-';
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

export function YouPage() {
  const { user, signOut } = useUserAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameHistory, setGameHistory] = useState<Array<{
    gameId: string;
    endTime: string | null;
    startTime: string;
    status: string;
    arenaId: string;
    gameTemplateName: string;
    playerOutcome: string | null;
  }>>([]);
  const [loadingGameHistory, setLoadingGameHistory] = useState(false);
  const [countdownTime, setCountdownTime] = useState(new Date());
  
  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    loadPlayerProfile();
  }, [user]);

  // Check if user came from password reset link
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('reset-password') && hash.includes('access_token')) {
      setShowPasswordReset(true);
      // Clear the hash to clean up the URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Check for password reset on component mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('reset-password') && hash.includes('access_token')) {
      setShowPasswordReset(true);
    }
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPlayerProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const playerProfile = await UserPlayerConnectionService.getCurrentUserPlayer();
    setPlayer(playerProfile);
    
    // Load game history if player exists
    if (playerProfile) {
      await fetchGameHistory(playerProfile.id);
    }
    
    setLoading(false);
  };

  const fetchGameHistory = async (playerId: number) => {
    try {
      setLoadingGameHistory(true);
      const result = await PlayersService.getPlayerGameHistory(playerId, 0, 10);
      setGameHistory(result.games);
    } catch (err) {
      console.error('Error fetching game history:', err);
    } finally {
      setLoadingGameHistory(false);
    }
  };


  const handleSignOut = async () => {
    await signOut();
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error('Failed to update password');
      } else {
        setPasswordSuccess(true);
        toast.success('Password updated successfully!');
        // Hide the form after success
        setTimeout(() => {
          setShowPasswordReset(false);
          setPasswordSuccess(false);
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to update password');
    }
    
    setPasswordLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#e63946]/10 flex items-center justify-center">
          <User className="h-5 w-5 text-[#e63946]" style={{ filter: 'drop-shadow(0 0 6px rgba(230, 57, 70, 0.6))' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">You</h1>
          <p className="text-gray-400">Your account information</p>
        </div>
      </div>

      {/* Password Reset Form */}
      {showPasswordReset && (
        <Card className="bg-[#0f0f0f] border-gray-800">
          <div className="p-6">
            {passwordSuccess ? (
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Password Updated!</h2>
                <p className="text-gray-400">Your password has been successfully updated.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-[#e63946]/10 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-[#e63946]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Reset Password</h2>
                    <p className="text-gray-400">Set a new password for your account</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-white">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pl-10 pr-10 bg-gray-900 border-gray-700 text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="text-white">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10 bg-gray-900 border-gray-700 text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-1 bg-[#e63946] hover:bg-[#e63946]/80"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowPasswordReset(false)}
                      variant="outline"
                      className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* User Info Card */}
      <Card className="bg-[#0f0f0f] border-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-[#e63946]/20 flex items-center justify-center">
              <User className="h-8 w-8 text-[#e63946]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Welcome.</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <Mail className="h-5 w-5 text-[#e63946]" />
              <div>
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Player Profile Section */}
            {loading ? (
              <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="h-5 w-5 bg-gray-600 rounded animate-pulse"></div>
                <div>
                  <p className="text-sm text-gray-400">Loading player profile...</p>
                </div>
              </div>
            ) : player ? (
              <div className="space-y-4">
                {/* Player Overview */}
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div className="h-12 w-12 rounded-full bg-[#e63946]/20 flex items-center justify-center">
                    {player.avatar ? (
                      <span className="text-[#e63946] font-bold text-lg">
                        {player.avatar}
                      </span>
                    ) : (
                      <Gamepad2 className="h-6 w-6 text-[#e63946]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Player Profile</p>
                    <p className="text-white font-medium text-lg">{player.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        player.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        player.status === 'Eliminated' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {player.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Player Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Join Date */}
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <Calendar className="h-5 w-5 text-[#e63946]" />
                    <div>
                      <p className="text-sm text-gray-400">Join Date</p>
                      <p className="text-white font-medium">
                        {new Date(player.join_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Last Game */}
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <Clock className="h-5 w-5 text-[#e63946]" />
                    <div>
                      <p className="text-sm text-gray-400">Last Game</p>
                      <p className="text-white font-medium">
                        {player.last_game_at ? 
                          new Date(player.last_game_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 
                          'Never played'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {player.bio && (
                  <div className="flex items-start gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <FileText className="h-5 w-5 text-[#e63946] mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Bio</p>
                      <p className="text-white font-medium">{player.bio}</p>
                    </div>
                  </div>
                )}

                {/* Timer */}
                {player.status !== 'Eliminated' && (
                  <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <Clock className="h-5 w-5 text-[#e63946]" />
                    <div>
                      <p className="text-sm text-gray-400">Next Game Deadline</p>
                      <p className={`font-mono text-sm font-bold ${
                        getCountdownFromLastGame(player.last_game_at, player.status) === 'EXPIRED' ? 'text-red-500' : 
                        getCountdownFromLastGame(player.last_game_at, player.status) === '-' ? 'text-gray-400' : 
                        'text-orange-400'
                      }`}>
                        {getCountdownFromLastGame(player.last_game_at, player.status)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5 text-[#e63946]" />
                  <div>
                    <p className="text-sm text-gray-400">No Player Profile</p>
                    <p className="text-white font-medium">Contact an administrator to assign you a player profile</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                  <p>• Player profiles are created by administrators</p>
                  <p>• Contact the Game Master to get assigned to a player</p>
                  <p>• Once assigned, you'll be able to participate in games</p>
                </div>
              </div>
            )}
          </div>

          {/* Game History Section */}
          {player && (
            <div className="mt-6">
              <h3 className="text-white mb-4 text-lg font-semibold">Game History</h3>
              <div className="space-y-3">
                {loadingGameHistory && gameHistory.length === 0 ? (
                  <Card className="p-4 bg-gray-900 border-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 text-sm">Loading game history...</p>
                    </div>
                  </Card>
                ) : gameHistory.length > 0 ? (
                  <>
                    {gameHistory.map((game, index) => (
                      <Card key={`${game.gameId}-${index}`} className="p-4 bg-gray-900 border-gray-700">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#e63946] rounded-full"></div>
                              <p className="text-white text-sm font-medium">{game.gameTemplateName}</p>
                            </div>
                            {game.status === 'Active' ? (
                              <Badge className="bg-[#e63946]/20 text-[#e63946] border-[#e63946]/50 text-xs px-2 py-1">
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
                  </>
                ) : (
                  <Card className="p-4 bg-gray-900 border-gray-700">
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="text-gray-500 text-sm">No games played yet</p>
                      <p className="text-gray-500 text-xs mt-1">You haven't joined any games</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-800 space-y-4">
            {/* Password Change Section */}
            <div className="space-y-3">
              <h3 className="text-white font-medium">Account Security</h3>
              <Button
                onClick={() => setShowPasswordReset(true)}
                variant="outline"
                className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>

            {/* Sign Out */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
}
