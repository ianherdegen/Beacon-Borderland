import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { User, Mail, LogOut, Gamepad2 } from 'lucide-react';
import { useUserAuth } from '../contexts/UserAuthContext';
import { UserPlayerConnectionService } from '../services/user-player-connection';
import { Player } from '../types';

export function YouPage() {
  const { user, signOut } = useUserAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerProfile();
  }, [user]);

  const loadPlayerProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const playerProfile = await UserPlayerConnectionService.getCurrentUserPlayer();
    setPlayer(playerProfile);
    setLoading(false);
  };


  const handleSignOut = async () => {
    await signOut();
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
              <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <Gamepad2 className="h-5 w-5 text-[#e63946]" />
                <div>
                  <p className="text-sm text-gray-400">Player Profile</p>
                  <p className="text-white font-medium">{player.username}</p>
                  <p className="text-xs text-gray-500">Status: {player.status}</p>
                </div>
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

          <div className="mt-6 pt-6 border-t border-gray-800">
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
