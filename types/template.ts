import type { Difficulty, InteractionMechanic, PlayableDuration, TemplateId } from "@/types/project";

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  difficulty: Difficulty;
  category: "Merge" | "Runner" | "Tap" | "Puzzle" | "Shooter" | "Casual";
  popularity: number;
  addedAt: string;
  mainMechanic: string;
  tags: string[];
  mechanics: InteractionMechanic[];
  recommendedDuration: PlayableDuration;
  description: string;
  accentColor: string;
  thumbnailClass: string;
}
