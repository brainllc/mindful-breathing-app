import { useState, useEffect } from "react";
import { MoodSelector } from "@/components/MoodSelector";
import { ExerciseCard } from "@/components/ExerciseCard";
import { exercises } from "@/lib/exercises";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase';
import { useLocation } from 'wouter';

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Handle OAuth redirect if it lands on home page instead of /auth/callback
  useEffect(() => {
    const handleHomePageOAuth = async () => {
      // Only process OAuth if there are actual tokens AND this appears to be a fresh OAuth redirect
      if (window.location.hash.includes('access_token') && 
          window.location.hash.includes('token_type=bearer') &&
          !isAuthenticated) {  // Only if not already authenticated
        console.log('🔍 OAuth tokens detected on home page, processing...');
        
        try {
          // DON'T clear the hash yet - Supabase needs it to process the session!
          const hashContent = window.location.hash;
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            return;
          }

          if (session) {
            console.log('✅ Home.tsx: OAuth session found, processing login...');
            
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
            console.log('🧹 Home.tsx: Cleaning OAuth tokens from URL after login');
            window.history.replaceState({}, document.title, window.location.pathname);

            // Redirect to dashboard
            console.log('📍 Home.tsx: Redirecting to dashboard...');
            setLocation('/dashboard');
          }
        } catch (err) {
          console.error('Home page OAuth error:', err);
        }
      }
    };

    handleHomePageOAuth();
  }, [login, setLocation, isAuthenticated]);

  // Remove the automatic dashboard redirect for authenticated users
  // This was causing the navigation issue - users should be able to visit home page normally

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleBackToMoods = () => {
    setSelectedMood(null);
  };

  const selectedMoodLabel = selectedMood === "stressed" ? "stressed" :
    selectedMood === "anxious" ? "anxious" :
    selectedMood === "tired" ? "tired" :
    selectedMood === "restless" ? "restless" :
    selectedMood === "focus" ? "need focus" :
    selectedMood === "sleep" ? "need sleep" :
    selectedMood === "overwhelmed" ? "overwhelmed" :
    selectedMood === "sad" ? "sad" :
    selectedMood;

  const recommendedExercises = exercises.filter(exercise => 
    exercise.moods?.includes(selectedMood || "")
  );

  // Remove this automatic redirect - it was preventing navigation to home page
  // if (isAuthenticated) {
  //   setLocation('/dashboard');
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
      <Navbar />
      <div 
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-25 dark:opacity-20" 
        role="presentation" 
        aria-hidden="true"
      />

      <main className="relative">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto text-center mb-20 pt-4"
          >
            <h1 className="text-6xl font-bold tracking-tight mb-8 text-primary/90">
              Mindful Breathing
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Find balance and inner peace through guided breathing exercises
              tailored to your current state of mind
            </p>
          </motion.header>

          <Tabs defaultValue="mood" className="max-w-5xl mx-auto">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 gap-2 mb-16 bg-transparent">
              <TabsTrigger
                value="mood"
                className="text-lg px-8 py-4 transition-all duration-200 bg-primary/0 hover:bg-primary/5 dark:hover:bg-primary/10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/20 data-[state=active]:font-medium relative rounded-full before:absolute before:inset-0 before:rounded-full before:bg-primary/0 hover:before:bg-primary/5 before:transition-colors before:duration-200 active:scale-95 transform transition"
              >
                Find by Mood
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="text-lg px-8 py-4 transition-all duration-200 bg-primary/0 hover:bg-primary/5 dark:hover:bg-primary/10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/20 data-[state=active]:font-medium relative rounded-full before:absolute before:inset-0 before:rounded-full before:bg-primary/0 hover:before:bg-primary/5 before:transition-colors before:duration-200 active:scale-95 transform transition"
              >
                All Exercises
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mood" className="focus-visible:outline-none space-y-16 px-4">
              <AnimatePresence mode="wait">
                {!selectedMood ? (
                  <motion.section
                    key="mood-selector"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <h2 className="text-3xl font-medium text-center mb-12">
                      How are you feeling today?
                    </h2>
                    <MoodSelector onSelect={handleMoodSelect} />
                  </motion.section>
                ) : (
                  <motion.section
                    key="exercises"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="space-y-8">
                      <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80"
                        onClick={handleBackToMoods}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Moods
                      </Button>
                      <h3 className="text-2xl font-medium text-center">
                        Exercises for when you're feeling {selectedMoodLabel}
                      </h3>
                    </div>

                    {recommendedExercises.length > 0 ? (
                      <div
                        className={`grid gap-8 ${
                          recommendedExercises.length === 1
                            ? "max-w-2xl mx-auto"
                            : "grid-cols-1 lg:grid-cols-2"
                        }`}
                      >
                        {recommendedExercises.map((exercise, index) => (
                          <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">
                        No exercises found for this mood. Try another mood or
                        check all exercises.
                      </p>
                    )}
                  </motion.section>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="all" className="focus-visible:outline-none px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}