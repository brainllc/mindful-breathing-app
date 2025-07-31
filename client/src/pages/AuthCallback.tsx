import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasRun.current) return;
    hasRun.current = true;
    
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        if (!session) {
          setError('No authentication session found. Please try again.');
          setLoading(false);
          return;
        }

        console.log('Auth session found:', { 
          provider: session.user.app_metadata?.provider,
          userId: session.user.id 
        });

        // Check if this is OAuth (has provider_token) or email confirmation
        const isOAuth = session.provider_token && session.user.app_metadata?.provider !== 'email';
        
        if (isOAuth) {
          console.log('Processing OAuth callback...');
          
          // Handle OAuth (Google) signup/signin
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              provider: session.user.app_metadata?.provider || 'google',
              user: session.user,
            }),
          });

          const data = await response.json();
          console.log('OAuth callback response:', { ok: response.ok, data });

          if (!response.ok) {
            console.error('OAuth callback failed:', data);
            setError(data.message || data.error || 'Authentication failed. Please try again.');
            setLoading(false);
            return;
          }

          // Login the user
          if (data.user) {
            login({
              id: data.user.id,
              email: data.user.email,
              displayName: data.user.displayName,
              isPremium: false,
            }, session);

            setSuccess(true);
            
            toast({
              title: "Welcome!",
              description: `Successfully signed in with Google. Welcome ${data.user.displayName}!`,
            });

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              setLocation('/dashboard');
            }, 2000);
          } else {
            setError('Failed to create user account. Please try again.');
          }
        } else {
          console.log('Processing email confirmation...');
          
          // Handle email confirmation - just log them in with Supabase data
          login({
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            isPremium: false,
          }, session);

          setSuccess(true);
          
          toast({
            title: "Email Confirmed!",
            description: `Welcome to Breathwork.fyi! Your account has been activated.`,
          });

          setTimeout(() => {
            setLocation('/dashboard');
          }, 2000);
        }

      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [login, toast, setLocation]);

  const handleRetry = () => {
    setLocation('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Processing Authentication</h2>
            <p className="text-slate-300 text-center">Please wait while we complete your sign-in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <CardTitle className="text-white">Authentication Failed</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription className="text-slate-300">
              {error}
            </CardDescription>
            <Button 
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <CheckCircle className="h-8 w-8 text-green-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Success!</h2>
            <p className="text-slate-300 text-center">Redirecting you to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
} 