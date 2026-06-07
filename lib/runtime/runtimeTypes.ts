import type { EditorAction, PlayableProject, PlayableScene } from "@/types/project";

export interface RuntimeContext {
  project: PlayableProject;
  scene: PlayableScene;
  sceneIndex: number;
  score: number;
  started: boolean;
  goToScene: (sceneId: string) => void;
  goToSceneIndex: (index: number) => void;
  goToSceneType: (type: PlayableScene["type"]) => void;
  reset: () => void;
  setScore: (score: number) => void;
  openUrl: (url?: string) => void;
}

export interface RuntimeObjectAction {
  action?: EditorAction;
}

export interface RuntimeEvent {
  type: "sceneChange" | "action" | "score" | "cta";
  message: string;
}
