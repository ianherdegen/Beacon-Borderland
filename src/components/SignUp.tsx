import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useUserAuth } from '../contexts/UserAuthContext';

interface SignUpProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export function SignUp({ onSwitchToLogin, onClose }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    checking: boolean;
    exists: boolean | null;
    message: string;
  }>({ checking: false, exists: null, message: '' });
  const { signUp, checkUserExists } = useUserAuth();
  
  // Use useRef to store the timeout ID for proper cleanup
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced email validation
  const validateEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailValidation({ checking: false, exists: null, message: '' });
      return;
    }

    setEmailValidation({ checking: true, exists: null, message: '' });
    
    const result = await checkUserExists(email);
    
    if (result.error) {
      setEmailValidation({ checking: false, exists: null, message: 'Error checking email' });
      return;
    }

    if (result.exists) {
      setEmailValidation({ checking: false, exists: true, message: 'This email is already registered' });
    } else {
      setEmailValidation({ checking: false, exists: false, message: 'Email is available' });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Clear previous validation
    setEmailValidation({ checking: false, exists: null, message: '' });
    
    // Clear any existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    // Set new timeout for validation
    validationTimeoutRef.current = setTimeout(() => {
      validateEmail(newEmail);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Check if email already exists
    if (emailValidation.exists === true) {
      toast.error('This email is already registered. Please use a different email or sign in.');
      return;
    }

    // If we haven't validated the email yet, do it now
    if (emailValidation.exists === null) {
      setEmailValidation({ checking: true, exists: null, message: 'Checking email...' });
      const result = await checkUserExists(email);
      
      if (result.error) {
        toast.error('Error checking email. Please try again.');
        setEmailValidation({ checking: false, exists: null, message: '' });
        return;
      }

      if (result.exists) {
        setEmailValidation({ checking: false, exists: true, message: 'This email is already registered' });
        toast.error('This email is already registered. Please use a different email or sign in.');
        return;
      }
    }

    setLoading(true);
    
    const result = await signUp(email, password);
    
    if (result.success) {
      toast.success('Check your email for verification link!');
      onClose();
    } else {
      toast.error(result.error || 'Failed to sign up');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-xs sm:max-w-sm bg-[#0f0f0f] border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#e63946]/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-[#e63946]" style={{ filter: 'drop-shadow(0 0 6px rgba(230, 57, 70, 0.6))' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sign Up</h2>
                <p className="text-sm text-gray-400">Join Borderland</p>
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
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className={`pl-10 bg-gray-900 border-gray-700 text-white ${
                    emailValidation.exists === true ? 'border-red-500' : 
                    emailValidation.exists === false ? 'border-green-500' : ''
                  }`}
                  required
                />
                {emailValidation.checking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#e63946]"></div>
                  </div>
                )}
              </div>
              {emailValidation.message && (
                <p className={`text-xs ${
                  emailValidation.exists === true ? 'text-red-400' : 
                  emailValidation.exists === false ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {emailValidation.message}
                </p>
              )}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || emailValidation.checking || emailValidation.exists === true}
              className="w-full bg-[#e63946] hover:bg-[#e63946]/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 
               emailValidation.checking ? 'Checking Email...' : 
               emailValidation.exists === true ? 'Email Already Exists' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#e63946] hover:text-[#e63946]/80 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
