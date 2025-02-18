import { Button } from "@/components/ui/button";
import { moods } from "@/lib/exercises";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

interface Props {
  onSelect: (mood: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {moods.map((mood) => {
        const IconComponent = LucideIcons[mood.icon as keyof typeof LucideIcons] as React.ComponentType<any>;
        return (
          <motion.div
            key={mood.id}
            variants={item}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-32 flex flex-col items-center justify-center gap-4 mood-card"
              onClick={() => onSelect(mood.id)}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 dark:bg-primary/20" />
                {IconComponent && <IconComponent className="w-10 h-10 text-primary relative z-10" />}
              </div>
              <span className="text-lg font-medium relative z-10">{mood.label}</span>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
}