import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Repeat, 
  Home, 
  BookOpen, 
  User, 
  TrendingUp,
  Star,
  Sparkles,
  Heart
} from "lucide-react";
import { Exercise } from "@/lib/exercises";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

interface ExerciseCompletionProps {
  exercise: Exercise;
  roundsCompleted: number;
  durationSeconds: number;
  onStartAgain: () => void;
}

export function ExerciseCompletion({ 
  exercise, 
  roundsCompleted, 
  durationSeconds,
  onStartAgain 
}: ExerciseCompletionProps) {
  const { user } = useAuth();

  // Format duration for display
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} second${seconds === 1 ? '' : 's'}`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  };

  // Floating particles animation - even more bubbles for celebration
  const particles = Array.from({ length: 24 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-primary/25 rounded-full"
      initial={{ 
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
        scale: 0,
        opacity: 0 
      }}
      animate={{ 
        x: [
          Math.random() * (window.innerWidth - 100),
          Math.random() * (window.innerWidth - 100),
          Math.random() * (window.innerWidth - 100)
        ],
        y: [
          Math.random() * (window.innerHeight - 100),
          Math.random() * (window.innerHeight - 100),
          Math.random() * (window.innerHeight - 100)
        ],
        scale: [0, 1, 0.8, 0],
        opacity: [0, 0.3, 0.2, 0]
      }}
      transition={{
        duration: 15,
        delay: i * 1.2,
        repeat: Infinity,
        repeatDelay: 4,
        ease: "easeInOut"
      }}
      style={{
        position: 'fixed',
        left: 50,
        top: 50,
        pointerEvents: 'none',
        borderRadius: '50%'
      }}
    />
  ));

  // Celebratory sparkle particles
  const sparkles = Array.from({ length: 15 }, (_, i) => (
    <motion.div
      key={`sparkle-${i}`}
      className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
      initial={{ 
        x: Math.random() * (window.innerWidth - 200),
        y: Math.random() * (window.innerHeight - 200),
        scale: 0,
        opacity: 0 
      }}
      animate={{ 
        x: [
          Math.random() * (window.innerWidth - 200),
          Math.random() * (window.innerWidth - 200)
        ],
        y: [
          Math.random() * (window.innerHeight - 200),
          Math.random() * (window.innerHeight - 200)
        ],
        scale: [0, 1.2, 0],
        opacity: [0, 0.4, 0]
      }}
      transition={{
        duration: 10,
        delay: i * 2 + 4,
        repeat: Infinity,
        repeatDelay: 6
      }}
      style={{
        position: 'fixed',
        left: 100,
        top: 100,
        pointerEvents: 'none',
        borderRadius: '50%'
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background overflow-hidden">
      {/* Background particles and sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles}
        {sparkles}
      </div>
      
      {/* Static background grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />
      
      <div className="container relative mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          
          {/* Success Icon with Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              delay: 0.2 
            }}
            className="text-center mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-green-200/40 dark:bg-green-400/20 rounded-full blur-md"
              />
              <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
            </div>
          </motion.div>

          {/* Congratulations Message */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center space-y-4 mb-8"
          >
            <h1 className="text-4xl font-bold text-primary/90">
              Congratulations! 🌟
            </h1>
            <p className="text-xl text-muted-foreground">
              You've completed your {exercise.name} session
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {roundsCompleted} rounds
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {formatDuration(durationSeconds)}
              </Badge>
            </div>
          </motion.div>

          {/* Benefits Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      What you've accomplished:
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {exercise.completionBenefits || 
                        `${exercise.description} This practice helps ${exercise.benefits.join(', ').toLowerCase()}.`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

                     {/* Action Buttons */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8, duration: 0.6 }}
             className="space-y-3 mb-8"
           >
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <Button 
                 onClick={onStartAgain}
                 className="flex items-center gap-2 justify-center"
                 size="lg"
               >
                 <Repeat className="w-4 h-4" />
                 Practice Again
               </Button>
               
               <Link href="/">
                 <Button 
                   variant="outline" 
                   className="w-full flex items-center gap-2 justify-center"
                   size="lg"
                 >
                   <Home className="w-4 h-4" />
                   Try Another Exercise
                 </Button>
               </Link>
             </div>
             
             {/* Subtle divider */}
             <div className="flex items-center py-2">
               <div className="flex-1 border-t border-primary/20"></div>
               <div className="px-3">
                 <BookOpen className="w-3 h-3 text-primary/40" />
               </div>
               <div className="flex-1 border-t border-primary/20"></div>
             </div>
             
             <Link href="/library">
               <Button 
                 variant="outline" 
                 className="w-full flex items-center gap-2 justify-center"
                 size="lg"
               >
                 <BookOpen className="w-4 h-4" />
                 Explore Our Library
               </Button>
             </Link>
           </motion.div>

          {/* Auth Encouragement for Non-Logged-In Users */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <Card className="border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                        Track Your Progress
                      </h3>
                      <p className="text-amber-600/80 dark:text-amber-300/80 text-sm leading-relaxed mb-4">
                        Create an account to track your breathing sessions, view your progress over time, 
                        see detailed stats, and unlock personalized insights about your mindfulness journey.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link href="/register">
                          <Button 
                            size="sm" 
                            className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
                          >
                            <User className="w-3 h-3 mr-2" />
                            Create Account
                          </Button>
                        </Link>
                        <Link href="/login">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 w-full sm:w-auto"
                          >
                            <TrendingUp className="w-3 h-3 mr-2" />
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Additional Celebration Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-8"
          >
            <motion.p
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-sm text-muted-foreground/70"
            >
              Take a moment to appreciate what you've accomplished ✨
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 