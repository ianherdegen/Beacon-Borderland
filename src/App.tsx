import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Radio,
  FileCode,
  Gamepad2,
  Film,
  ChevronRight,
  LogOut,
  LogIn,
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
import { OverviewPage } from './components/OverviewPage';
import { PlayersPage } from './components/PlayersPage';
import { BeaconsPage } from './components/BeaconsPage';
import { GameTemplatesPage } from './components/GameTemplatesPage';
import { BeaconGamesPage } from './components/BeaconGamesPage';
import { ClipsMediaPage } from './components/ClipsMediaPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminLogin } from './components/AdminLogin';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
  { icon: Users, label: 'Players', id: 'players' },
  { icon: Radio, label: 'Beacons', id: 'beacons' },
  { icon: FileCode, label: 'Game Templates', id: 'templates' },
  { icon: Gamepad2, label: 'Beacon Games', id: 'games' },
  { icon: Film, label: 'Clips & Media', id: 'media' },
];

function AppSidebar({ activeItem, setActiveItem }: { activeItem: string; setActiveItem: (item: string) => void }) {
  const { isAuthenticated, logout } = useAuth();

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
              {menuItems.map((item) => (
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAuthenticated && (
          <div className="p-4 border-t border-gray-800">
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function AppContent() {
  const { isAuthenticated, showLogin, setShowLogin } = useAuth();
  const [activeItem, setActiveItem] = useState('overview');

  const renderPage = () => {
    switch (activeItem) {
      case 'overview':
        return <OverviewPage onNavigate={setActiveItem} />;
      case 'players':
        return <PlayersPage />;
      case 'beacons':
        return <BeaconsPage />;
      case 'templates':
        return <GameTemplatesPage />;
      case 'games':
        return <BeaconGamesPage />;
      case 'media':
        return <ClipsMediaPage />;
      default:
        return <OverviewPage onNavigate={setActiveItem} />;
    }
  };

  return (
    <div className="dark size-full">
      <SidebarProvider>
        <AppSidebar activeItem={activeItem} setActiveItem={setActiveItem} />
        <SidebarInset className="bg-[#0a0a0a]">
          <header className="flex h-16 items-center gap-4 border-b border-gray-800 px-6 bg-[#0f0f0f]/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                  className="text-gray-400 hover:text-white border-gray-700 hover:border-gray-600"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              )}
              <div className="text-right">
                <p className="text-sm text-white">Game Master</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#e63946] flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(230, 57, 70, 0.5)' }}>
                <span className="text-white">♠</span>
              </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center"
            >
              ×
            </button>
            <AdminLogin />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}