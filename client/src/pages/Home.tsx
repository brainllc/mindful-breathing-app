import { useState } from "react";
import { MoodSelector } from "@/components/MoodSelector";
import { ExerciseCard } from "@/components/ExerciseCard";
import { exercises, getExercisesByMood } from "@/lib/exercises";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const recommendedExercises = selectedMood 
    ? getExercisesByMood(selectedMood)
    : [];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl mx-auto text-center mb-20"
          >
            <h1 className="text-6xl font-bold tracking-tight mb-8 bg-gradient-to-b from-primary to-primary/70 bg-clip-text text-transparent">
              Mindful Breathing
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Find balance and inner peace through guided breathing exercises tailored to your current state of mind
            </p>
          </motion.div>

          <Tabs defaultValue="mood" className="max-w-5xl mx-auto">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-16">
              <TabsTrigger 
                value="mood" 
                className="text-lg py-4 data-[state=active]:bg-primary/10"
              >
                Find by Mood
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="text-lg py-4 data-[state=active]:bg-primary/10"
              >
                All Exercises
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mood" className="focus-visible:outline-none">
              <div className="space-y-16">
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-medium text-center mb-12">
                    How are you feeling today?
                  </h2>
                  <MoodSelector onSelect={handleMoodSelect} />
                </motion.div>

                {selectedMood && (
                  <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-2xl font-medium text-center mb-12">
                      Recommended for You
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {recommendedExercises.map((exercise, index) => (
                        <ExerciseCard 
                          key={exercise.id} 
                          exercise={exercise}
                          index={index} 
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="focus-visible:outline-none">
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
      </div>
    </div>
  );
}