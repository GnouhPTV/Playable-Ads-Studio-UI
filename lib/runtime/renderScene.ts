import type { EditorObject, PlayableProject, PlayableScene } from "@/types/project";

export function getInitialScene(project: PlayableProject) {
  return project.scenes[0] ?? null;
}

export function getSceneById(project: PlayableProject, sceneId: string) {
  return project.scenes.find((scene) => scene.id === sceneId) ?? null;
}

export function getSceneByType(project: PlayableProject, type: PlayableScene["type"]) {
  return project.scenes.find((scene) => scene.type === type) ?? null;
}

export function getSceneIndex(project: PlayableProject, sceneId: string) {
  return project.scenes.findIndex((scene) => scene.id === sceneId);
}

export function getSceneObjects(project: PlayableProject, sceneId: string): EditorObject[] {
  return project.objects
    .filter((object) => object.sceneId === sceneId && !object.hidden)
    .sort((a, b) => a.zIndex - b.zIndex);
}
