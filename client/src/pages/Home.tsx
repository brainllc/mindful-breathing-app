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
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Mindful Breathing
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Find peace and balance through guided breathing exercises tailored to your needs
          </p>
        </motion.div>

        <Tabs defaultValue="mood" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="mood" className="text-lg py-3">Find by Mood</TabsTrigger>
            <TabsTrigger value="all" className="text-lg py-3">All Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="focus-visible:outline-none">
            <div className="space-y-12">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-medium text-center mb-8">How are you feeling today?</h2>
                <MoodSelector onSelect={handleMoodSelect} />
              </motion.div>

              {selectedMood && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-2xl font-medium text-center mb-8">
                    Recommended Exercises
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {recommendedExercises.map((exercise) => (
                      <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {exercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}