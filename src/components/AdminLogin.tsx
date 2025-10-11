import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, setShowLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(password);
      if (success) {
        setShowLogin(false);
        setPassword('');
      } else {
        setError('Invalid password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 bg-gray-900/95 border-gray-700 shadow-2xl backdrop-blur-sm">
        <CardHeader className="text-center pb-6 pt-8 px-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e63946] to-[#d62828] shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">Admin Access</CardTitle>
          <CardDescription className="text-gray-300 text-base leading-relaxed">
            Enter the admin password to access management features
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-white font-medium text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-12 h-12 bg-gray-950/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#e63946] focus:ring-[#e63946]/20 transition-all duration-200"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-10 w-10 hover:bg-gray-800/50 rounded-md"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-200" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-200" />
                  )}
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#e63946] to-[#d62828] hover:from-[#d62828] hover:to-[#b91c1c] text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
  );
};
