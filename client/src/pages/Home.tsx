import { useState } from "react";
import { MoodSelector } from "@/components/MoodSelector";
import { ExerciseCard } from "@/components/ExerciseCard";
import { exercises, getExercisesByMood } from "@/lib/exercises";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const recommendedExercises = selectedMood 
    ? getExercisesByMood(selectedMood)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Welcome to Mindful Breathing
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover peace and balance through guided breathing exercises
          </p>
        </div>

        <Tabs defaultValue="mood" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mood">Find by Mood</TabsTrigger>
            <TabsTrigger value="all">All Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="mood">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-center">How are you feeling today?</h2>
                <MoodSelector onSelect={handleMoodSelect} />
              </div>

              {selectedMood && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-center">
                    Recommended Exercises
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendedExercises.map((exercise) => (
                      <ExerciseCard key={exercise.id} exercise={exercise} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
