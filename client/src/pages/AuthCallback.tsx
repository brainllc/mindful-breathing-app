import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting...');
        
        // Get the session from the URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        if (!session) {
          console.error('No session found');
          setError('No authentication session found. Please try again.');
          setLoading(false);
          return;
        }

        console.log('Session found, logging in user...');
        
        // Simple login with session data
        login({
          id: session.user.id,
          email: session.user.email || '',
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          isPremium: false,
        }, session);

        toast({
          title: "Welcome!",
          description: "Successfully signed in!",
        });

        // Redirect to dashboard
        setTimeout(() => {
          setLocation('/dashboard');
        }, 1000);

      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [login, toast, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md p-8">
          <h2 className="text-xl mb-4">Authentication Failed</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => setLocation('/login')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-green-400 text-4xl mb-4">✓</div>
        <p>Success! Redirecting...</p>
      </div>
    </div>
  );
} 