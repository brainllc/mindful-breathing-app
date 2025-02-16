import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/lib/exercises";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle } from "lucide-react";

interface Props {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {exercise.name}
          </CardTitle>
          <CardDescription className="text-base">
            {exercise.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-primary">Benefits:</h4>
              <ul className="space-y-2">
                {exercise.benefits.map((benefit, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle className="w-4 h-4 mt-0.5 text-primary/60" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <Button 
              asChild 
              className="w-full group"
              size="lg"
            >
              <Link href={`/exercise/${exercise.id}`}>
                <span>Start Exercise</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}