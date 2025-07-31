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

        // Check if this is OAuth (has provider_token) or email confirmation
        const isOAuth = session.provider_token && session.user.app_metadata?.provider !== 'email';
        
        if (isOAuth) {
          // Handle OAuth (Google) signup/signin
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              provider: 'google',
              providerToken: session.provider_token,
              providerRefreshToken: session.provider_refresh_token,
              user: session.user,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            setError(data.error || 'Authentication failed. Please try again.');
            setLoading(false);
            return;
          }

          // Login the user
          if (data.user) {
            login({
              id: data.user.id,
              email: data.user.email,
              displayName: data.user.displayName,
              isPremium: false, // Default for OAuth users
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
          // Handle email confirmation - user is already confirmed, just log them in
          try {
            // Get user details from your backend
            const response = await fetch('/api/user/profile', {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            });

            if (response.ok) {
              const userData = await response.json();
              
              // Login the user
              login({
                id: userData.id,
                email: userData.email,
                displayName: userData.displayName,
                isPremium: userData.isPremium || false,
              }, session);

              setSuccess(true);
              
              toast({
                title: "Email Confirmed!",
                description: `Welcome to Breathwork.fyi! Your account has been activated.`,
              });

              // Redirect to dashboard after a short delay
              setTimeout(() => {
                setLocation('/dashboard');
              }, 2000);
            } else {
              // Fallback: just log them in with basic Supabase user data
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
            console.error('Error fetching user data:', err);
                      // Fallback: just log them in with basic Supabase user data
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
        }

      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [login, setLocation]); // Removed toast from dependencies to prevent re-runs

  const handleRetry = () => {
    setLocation('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              Completing Sign In
            </CardTitle>
            <CardDescription>
              Please wait while we process your authentication...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              This should only take a moment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              Authentication Failed
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Welcome!
            </CardTitle>
            <CardDescription>
              Successfully signed in with Google. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Taking you to your dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
} 