import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (processed) return; // Prevent multiple executions
    
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting...');
        
        // Check if this is actually an auth callback by looking for auth tokens in URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlHash = window.location.hash;
        const hasAuthTokens = urlHash.includes('access_token') || urlParams.has('code') || urlParams.has('access_token');
        
        if (!hasAuthTokens) {
          console.log('No auth tokens found, redirecting to dashboard');
          setLocation('/dashboard');
          return;
        }
        
        setProcessed(true); // Mark as processed immediately
        
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

        console.log('✅ AuthCallback: OAuth session found, processing login...');
        
        // Fetch the user's actual profile from the database to get their custom display name
        try {
          const profileResponse = await fetch("/api/user/profile", {
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
            },
          });

          if (profileResponse.ok) {
            const userData = await profileResponse.json();
            // Use the saved display name from database, not OAuth metadata
            login(userData, session);
          } else {
            // Fallback to OAuth metadata only if profile fetch fails
            login({
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              isPremium: false,
            }, session);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Fallback to OAuth metadata if API call fails
          login({
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            isPremium: false,
          }, session);
        }

        // Clean up the URL hash after successful login
        console.log('🧹 AuthCallback: Cleaning OAuth tokens from URL after login');
        window.history.replaceState({}, document.title, '/dashboard');

        toast({
          title: "Welcome!",
          description: "Successfully signed in!",
        });

        // Clean the URL and redirect to dashboard
        window.history.replaceState({}, document.title, '/dashboard');
        setLocation('/dashboard');

      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [processed, setLocation, login, toast]); // Add proper dependencies

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