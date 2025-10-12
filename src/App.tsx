import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Radio,
  FileCode,
  Gamepad2,
  Film,
  MessageCircle,
  ChevronRight,
  LogOut,
  LogIn,
  User,
  Link,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from './components/ui/sidebar';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { OverviewPage } from './components/OverviewPage';
import { PlayersPage } from './components/PlayersPage';
import { ArenasPage } from './components/ArenasPage';
import { GameTemplatesPage } from './components/GameTemplatesPage';
import { ArenaGamesPage } from './components/ArenaGamesPage';
import { ClipsMediaPage } from './components/ClipsMediaPage';
import { ChatPage } from './components/ChatPage';
import { YouPage } from './components/YouPage';
import { SignUp } from './components/SignUp';
import { Login } from './components/Login';
import { UserPlayerConnectionManager } from './components/UserPlayerConnectionManager';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserAuthProvider, useUserAuth } from './contexts/UserAuthContext';
import { AdminLogin } from './components/AdminLogin';
import { ResetPassword } from './components/ResetPassword';
import BackgroundForfeitService from './services/background-forfeit';
import { UserPlayerConnectionService } from './services/user-player-connection';
import { supabase } from './lib/supabase';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
  { icon: Users, label: 'Players', id: 'players' },
  { icon: Radio, label: 'Arenas', id: 'arenas' },
  { icon: FileCode, label: 'Game Templates', id: 'templates' },
  { icon: Gamepad2, label: 'Arena Games', id: 'games' },
  { icon: Film, label: 'Clips & Media', id: 'media' },
  { icon: MessageCircle, label: 'Chat', id: 'chat' },
  { icon: User, label: 'You', id: 'you' },
];

function AppSidebar({ activeItem, setActiveItem }: { activeItem: string; setActiveItem: (item: string) => void }) {
  const { isAuthenticated, logout } = useAuth();
  const { user, signOut } = useUserAuth();

  // Filter menu items based on authentication
  const visibleMenuItems = menuItems.filter(item => {
    // Only show "You" page if user is logged in (regardless of admin status)
    if (item.id === 'you') {
      return !!user;
    }
    return true;
  });

  // Admin-only menu items
  const adminMenuItems = [
    { icon: Link, label: 'User Connections', id: 'user-connections' },
  ];

  return (
    <Sidebar className="border-r border-gray-800">
      <SidebarContent className="bg-[#0f0f0f]">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-[#e63946] tracking-wider" style={{ textShadow: '0 0 10px rgba(230, 57, 70, 0.5)' }}>
            ♠ BORDERLAND ♥
          </h2>
          <p className="text-gray-500 text-sm mt-1">Survival Game</p>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => setActiveItem(item.id)}
                    className={`group relative transition-all duration-200 ${
                      activeItem === item.id
                        ? 'bg-[#e63946]/10 border-l-2 border-[#e63946]'
                        : 'hover:bg-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-colors ${
                        activeItem === item.id
                          ? 'text-[#e63946]'
                          : 'text-gray-400 group-hover:text-gray-200'
                      }`}
                      style={
                        activeItem === item.id
                          ? {
                              filter: 'drop-shadow(0 0 6px rgba(230, 57, 70, 0.6))',
                            }
                          : {}
                      }
                    />
                    <span
                      className={`${
                        activeItem === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                      }`}
                    >
                      {item.label}
                    </span>
                    {activeItem === item.id && (
                      <ChevronRight className="ml-auto h-4 w-4 text-[#e63946]" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Admin-only menu items */}
              {isAuthenticated && (
                <>
                  <div className="my-4 border-t border-gray-800"></div>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Admin</p>
                  </div>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        onClick={() => setActiveItem(item.id)}
                        className={`group relative transition-all duration-200 ${
                          activeItem === item.id
                            ? 'bg-[#e63946]/10 border-l-2 border-[#e63946]'
                            : 'hover:bg-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 transition-colors ${
                            activeItem === item.id
                              ? 'text-[#e63946]'
                              : 'text-gray-400 group-hover:text-gray-200'
                          }`}
                          style={
                            activeItem === item.id
                              ? {
                                  filter: 'drop-shadow(0 0 6px rgba(230, 57, 70, 0.6))',
                                }
                              : {}
                          }
                        />
                        <span
                          className={`${
                            activeItem === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                          }`}
                        >
                          {item.label}
                        </span>
                        {activeItem === item.id && (
                          <ChevronRight className="ml-auto h-4 w-4 text-[#e63946]" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Logout Buttons */}
        {(user || isAuthenticated) && (
          <div className="p-4 border-t border-gray-800 space-y-2">
            {/* User Logout - Show if user is logged in */}
            {user && (
              <Button
                onClick={signOut}
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
            
            {/* Admin Logout - Show if admin is logged in */}
            {isAuthenticated && (
              <Button
                onClick={logout}
                variant="ghost"
                className="w-full justify-start text-[#e63946] hover:text-white hover:bg-[#e63946]/10"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Logout
              </Button>
            )}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function AppContent() {
  const { isAuthenticated, showLogin, setShowLogin } = useAuth();
  const { user } = useUserAuth();
  const [activeItem, setActiveItem] = useState('overview');
  const [showUserSignUp, setShowUserSignUp] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [player, setPlayer] = useState(null);

  // Start background forfeit service when app loads
  useEffect(() => {
    BackgroundForfeitService.start();
    
    // Cleanup when app unmounts
    return () => {
      BackgroundForfeitService.stop();
    };
  }, []);

  // Load player data when user changes
  useEffect(() => {
    const loadPlayerData = async () => {
      if (user) {
        const playerData = await UserPlayerConnectionService.getPlayerByUserId(user.id);
        setPlayer(playerData);
      } else {
        setPlayer(null);
      }
    };
    loadPlayerData();
  }, [user]);


  const renderPage = () => {
    switch (activeItem) {
      case 'overview':
        return <OverviewPage onNavigate={setActiveItem} />;
      case 'players':
        return <PlayersPage />;
      case 'arenas':
        return <ArenasPage />;
      case 'templates':
        return <GameTemplatesPage />;
      case 'games':
        return <ArenaGamesPage />;
      case 'media':
        return <ClipsMediaPage />;
      case 'chat':
        return <ChatPage />;
      case 'you':
        // Only show You page if user is logged in
        if (!user) {
          return <OverviewPage onNavigate={setActiveItem} />;
        }
        return <YouPage />;
      case 'user-connections':
        // Only show User Connections page if admin is authenticated
        if (!isAuthenticated) {
          return <OverviewPage onNavigate={setActiveItem} />;
        }
        return <UserPlayerConnectionManager />;
      default:
        return <OverviewPage onNavigate={setActiveItem} />;
    }
  };

  // Check if we're on the reset password page
  const hash = window.location.hash;
  const search = window.location.search;
  
  // Debug logging
  console.log('Current URL:', window.location.href);
  console.log('Hash:', hash);
  console.log('Search:', search);
  
  if (hash.includes('type=recovery') || 
      hash.includes('access_token') || 
      search.includes('type=recovery') ||
      search.includes('access_token')) {
    console.log('Detected password reset - showing ResetPassword component');
    return <ResetPassword />;
  }

  return (
    <div className="dark size-full">
      <SidebarProvider>
        <AppSidebar activeItem={activeItem} setActiveItem={setActiveItem} />
        <SidebarInset className="bg-[#0a0a0a]">
          <header className="flex h-16 items-center gap-4 border-b border-gray-800 px-6 bg-[#0f0f0f]/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {/* User Authentication Buttons */}
              {!user && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserLogin(true)}
                    className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-600"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserSignUp(true)}
                    className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-600"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </>
              )}

              {/* Admin Login Icon - Show when no user is logged in */}
              {!user && !isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                  className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-600 p-2"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}

              {/* User Profile - Show for all logged in users */}
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-white">{player?.username || user.email}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {isAuthenticated && (
                      <p className="text-xs text-[#e63946]">Admin</p>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveItem('you')}
                    className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-500 transition-colors cursor-pointer"
                  >
                    {player?.avatar ? (
                      <span className="text-white font-semibold text-sm">
                        {player.avatar}
                      </span>
                    ) : player?.username ? (
                      <span className="text-white font-semibold text-sm">
                        {player.username.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </button>
                  {/* Admin Login Icon - Show next to user profile if not admin logged in */}
                  {!isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLogin(true)}
                      className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-600 p-2"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {renderPage()}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
      
      {/* Global Admin Login Dialog */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <AdminLogin />
        </div>
      )}

      {/* User Sign Up Modal */}
      {showUserSignUp && (
        <SignUp
          onSwitchToLogin={() => {
            setShowUserSignUp(false);
            setShowUserLogin(true);
          }}
          onClose={() => setShowUserSignUp(false)}
        />
      )}

      {/* User Login Modal */}
      {showUserLogin && (
        <Login
          onSwitchToSignUp={() => {
            setShowUserLogin(false);
            setShowUserSignUp(true);
          }}
          onClose={() => setShowUserLogin(false)}
        />
      )}
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <AppContent />
      </UserAuthProvider>
    </AuthProvider>
  );
};

export default App;