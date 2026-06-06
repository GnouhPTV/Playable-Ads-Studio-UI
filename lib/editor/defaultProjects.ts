import type { PlayableProject } from "@/types/project";
import { createProjectFromTemplate } from "@/lib/editor/projectFactory";

export function createDefaultProjects(): PlayableProject[] {
  return [
    createProjectFromTemplate("merge-cannon"),
    createProjectFromTemplate("runner-gate"),
    createProjectFromTemplate("tap-monster"),
    createProjectFromTemplate("gem-collector")
  ];
}
