import type { PlayableProject, TemplateId } from "@/types/project";

export interface PhaserPreviewProps {
  project: PlayableProject;
}

export interface PlayableSceneRuntime {
  templateId: TemplateId;
  score: number;
  timeLeft: number;
  ended: boolean;
}
