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

        console.log('Session found, attempting profile fetch...');
        
        try {
          console.log('🔍 AuthCallback attempting to fetch user profile from:', window.location.origin + '/api/user/profile');
          console.log('🔐 AuthCallback using token:', session.access_token?.substring(0, 20) + '...');
          
          // Try to fetch user profile from our database
          const profileResponse = await fetch("/api/user/profile", {
            headers: {
              "Authorization": `Bearer ${session.access_token}`,
            },
          });

          console.log('📡 AuthCallback profile fetch response status:', profileResponse.status);

          if (profileResponse.ok) {
            const userData = await profileResponse.json();
            console.log('✅ AuthCallback user profile fetched, logging in user...');
            
            login({
              id: userData.id,
              email: userData.email,
              displayName: userData.displayName,
              isPremium: userData.isPremium || false,
            }, session);
          } else {
            console.log('⚠️ AuthCallback profile fetch failed with status:', profileResponse.status);
            const errorText = await profileResponse.text();
            console.log('⚠️ AuthCallback error details:', errorText);
            
            // Use session data as fallback
            login({
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              isPremium: false,
            }, session);
          }
        } catch (fetchError) {
          console.error('🚨 AuthCallback profile fetch error:', fetchError);
          console.log('⚠️ AuthCallback using session data due to fetch error');
          
          // Always fallback to session data on any error
          login({
            id: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            isPremium: false,
          }, session);
        }

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