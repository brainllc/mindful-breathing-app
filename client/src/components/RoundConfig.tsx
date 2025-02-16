import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  defaultRounds: number;
  onStart: (rounds: number) => void;
}

export function RoundConfig({ defaultRounds, onStart }: Props) {
  const [rounds, setRounds] = useState(defaultRounds);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Configure Rounds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rounds">Number of Rounds</Label>
            <Input
              id="rounds"
              type="number"
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              min={1}
              max={10}
            />
          </div>
          <Button 
            className="w-full"
            onClick={() => onStart(rounds)}
          >
            Start Breathing
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
