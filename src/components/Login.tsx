import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useUserAuth } from '../contexts/UserAuthContext';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onSwitchToSignUp: () => void;
  onClose: () => void;
}

export function Login({ onSwitchToSignUp, onClose }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const { signIn } = useUserAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    const result = await signIn(email, password);
    
    if (result.success) {
      toast.success('Welcome back!');
      onClose();
    } else {
      toast.error(result.error || 'Failed to sign in');
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    
    try {
      console.log('Sending password reset email to:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });

      if (error) {
        console.error('Password reset error:', error);
        if (error.message.includes('7 seconds')) {
          toast.error('Please wait 7 seconds before requesting another reset email.');
        } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
          toast.error('No account found with this email address.');
        } else {
          toast.error(`Failed to send reset email: ${error.message}`);
        }
      } else {
        console.log('Password reset email sent successfully');
        toast.success('Password reset email sent! Check your inbox and spam folder.');
      }
    } catch (error) {
      console.error('Password reset catch error:', error);
      toast.error('Failed to send reset email. Please try again.');
    }
    
    setForgotPasswordLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-xs sm:max-w-sm bg-[#0f0f0f] border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#e63946]/10 flex items-center justify-center">
                <LogIn className="h-5 w-5 text-[#e63946]" style={{ filter: 'drop-shadow(0 0 6px rgba(230, 57, 70, 0.6))' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sign In</h2>
                <p className="text-sm text-gray-400">Welcome back to Borderland</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotPasswordLoading}
                className="text-sm text-[#e63946] hover:text-[#e63946]/80 font-medium disabled:opacity-50"
              >
                {forgotPasswordLoading ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e63946] hover:bg-[#e63946]/80"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignUp}
                className="text-[#e63946] hover:text-[#e63946]/80 font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
