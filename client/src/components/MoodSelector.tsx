import { Button } from "@/components/ui/button";
import { moods } from "@/lib/exercises";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

interface Props {
  onSelect: (mood: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function MoodSelector({ onSelect }: Props) {
  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {moods.map((mood) => {
        const Icon = Icons[mood.icon as keyof typeof Icons] as any;

        return (
          <motion.div
            key={mood.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-28 flex flex-col items-center justify-center gap-3 bg-card/50 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
              onClick={() => onSelect(mood.id)}
            >
              <Icon className="w-8 h-8 text-primary" />
              <span className="text-lg font-medium">{mood.label}</span>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}