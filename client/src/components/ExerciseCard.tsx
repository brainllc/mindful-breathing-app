import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/lib/exercises";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface Props {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{exercise.name}</CardTitle>
          <CardDescription>{exercise.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Benefits:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
            <Button asChild className="w-full">
              <Link href={`/exercise/${exercise.id}`}>
                Start Exercise
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
