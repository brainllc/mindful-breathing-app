import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/lib/exercises";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Clock, CheckCircle } from "lucide-react";

interface Props {
  exercise: Exercise;
  index: number;
}

export function ExerciseCard({ exercise, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-500 group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent transition-opacity duration-500 opacity-0 group-hover:opacity-100" />

        <CardHeader className="relative">
          <div className="flex items-center gap-2 text-sm text-primary mb-2">
            <Clock className="w-4 h-4" />
            <span>{exercise.pattern.inhale + (exercise.pattern.hold || 0) + exercise.pattern.exhale + (exercise.pattern.holdEmpty || 0)}s per round</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {exercise.name}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {exercise.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-primary">Benefits</h4>
            <ul className="space-y-3">
              {exercise.benefits.map((benefit, index) => (
                <motion.li 
                  key={index}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle className="w-4 h-4 mt-0.5 text-primary/60 shrink-0" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <Button 
            asChild 
            className="w-full group relative overflow-hidden bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
            size="lg"
          >
            <Link href={`/exercise/${exercise.id}`}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Exercise
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}