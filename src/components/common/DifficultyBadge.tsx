import * as React from "react";
import { Chip, type ChipProps } from "@/components/common/Chip";

export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultyBadgeProps extends Omit<ChipProps, "tone" | "children"> {
  difficulty: Difficulty;
}

const difficultyTone: Record<Difficulty, ChipProps["tone"]> = {
  easy: "accent",
  medium: "warning",
  hard: "error",
};

export function DifficultyBadge({ difficulty, ...props }: DifficultyBadgeProps) {
  return (
    <Chip tone={difficultyTone[difficulty]} {...props}>
      {difficulty}
    </Chip>
  );
}
