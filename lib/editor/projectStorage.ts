import type { PlayableProject } from "@/types/project";
import { cloneProject, normalizeProject, touchProject } from "@/lib/editor/projectFactory";

const STORAGE_KEY = "playable-ads-studio:projects";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRawProjects(): PlayableProject[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlayableProject[]).map(normalizeProject) : [];
  } catch {
    return [];
  }
}

function writeRawProjects(projects: PlayableProject[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getProjects(): PlayableProject[] {
  return readRawProjects().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getProject(projectId: string): PlayableProject | null {
  return readRawProjects().find((project) => project.id === projectId) ?? null;
}

export function saveProject(project: PlayableProject): PlayableProject {
  const updated = touchProject(normalizeProject(project));
  const projects = readRawProjects();
  const index = projects.findIndex((item) => item.id === updated.id);

  if (index >= 0) {
    projects[index] = updated;
  } else {
    projects.unshift(updated);
  }

  writeRawProjects(projects);
  return updated;
}

export function duplicateProject(projectId: string): PlayableProject | null {
  const source = getProject(projectId);

  if (!source) {
    return null;
  }

  const copy = cloneProject(source);
  saveProject(copy);
  return copy;
}

export function deleteProject(projectId: string) {
  writeRawProjects(readRawProjects().filter((project) => project.id !== projectId));
}

export function renameProject(projectId: string, name: string): PlayableProject | null {
  const project = getProject(projectId);

  if (!project) {
    return null;
  }

  return saveProject({
    ...project,
    name,
    settings: {
      ...project.settings,
      title: name
    }
  });
}

export function estimateProjectBytes(project: PlayableProject) {
  return new Blob([JSON.stringify(project)]).size;
}
