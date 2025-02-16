import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { moods } from "@/lib/exercises";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

interface Props {
  onSelect: (mood: string) => void;
}

export function MoodSelector({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {moods.map((mood, index) => {
        const Icon = Icons[mood.icon as keyof typeof Icons];
        
        return (
          <motion.div
            key={mood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => onSelect(mood.id)}
            >
              <Icon className="w-6 h-6" />
              <span>{mood.label}</span>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
