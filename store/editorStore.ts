"use client";

import { create } from "zustand";
import type {
  AssetUsage,
  EditorMode,
  EditorObject,
  EditorObjectProps,
  EditorObjectType,
  InteractionMechanic,
  PlayableAsset,
  PlayableProject,
  PlayableScene,
  PlayableSettings,
  SceneType
} from "@/types/project";
import {
  deleteProject,
  duplicateProject,
  getProject,
  saveProject as persistProject
} from "@/lib/editor/projectStorage";
import { createDefaultObjects, createProjectFromTemplate, normalizeProject } from "@/lib/editor/projectFactory";

interface EditorState {
  project: PlayableProject | null;
  currentProject: PlayableProject | null;
  selectedSceneId: string | null;
  currentSceneId: string | null;
  selectedObjectId: string | null;
  objects: EditorObject[];
  assets: PlayableAsset[];
  undoStack: PlayableProject[];
  redoStack: PlayableProject[];
  editorMode: EditorMode;
  isDirty: boolean;
  statusMessage: string;
  clipboardObject: EditorObject | null;
  loadProject: (projectId: string) => void;
  setProject: (project: PlayableProject) => void;
  setSelectedScene: (sceneId: string) => void;
  setEditorMode: (mode: EditorMode) => void;
  updateProjectName: (name: string) => void;
  updateSettings: (settings: Partial<PlayableSettings>) => void;
  updateScene: (sceneId: string, scene: Partial<PlayableScene>) => void;
  addScene: (type?: SceneType) => PlayableScene | null;
  duplicateScene: (sceneId: string) => PlayableScene | null;
  deleteScene: (sceneId: string) => void;
  addObject: (type: EditorObjectType, defaults?: Partial<EditorObject>) => EditorObject | null;
  updateObject: (objectId: string, patch: Partial<EditorObject>) => void;
  deleteObject: (objectId: string) => void;
  duplicateObject: (objectId: string) => EditorObject | null;
  copyObject: (objectId: string) => void;
  pasteObject: () => EditorObject | null;
  selectObject: (objectId: string | null) => void;
  moveObject: (objectId: string, x: number, y: number) => void;
  resizeObject: (objectId: string, width: number, height: number, x?: number, y?: number) => void;
  rotateObject: (objectId: string, rotation: number) => void;
  bringForward: (objectId: string) => void;
  sendBackward: (objectId: string) => void;
  bringToFront: (objectId: string) => void;
  sendToBack: (objectId: string) => void;
  lockObject: (objectId: string, locked?: boolean) => void;
  hideObject: (objectId: string, hidden?: boolean) => void;
  addAsset: (asset: PlayableAsset) => void;
  deleteAsset: (assetId: string) => void;
  updateAssetUsage: (assetId: string, usage: AssetUsage) => void;
  removeAsset: (assetId: string) => void;
  setMechanic: (mechanic: InteractionMechanic | null) => void;
  saveProject: () => PlayableProject | null;
  duplicateCurrentProject: () => PlayableProject | null;
  deleteCurrentProject: () => void;
  resetFromTemplate: () => void;
  undo: () => void;
  redo: () => void;
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function syncProject(project: PlayableProject | null) {
  const normalized = project ? normalizeProject(project) : null;

  return {
    project: normalized,
    currentProject: normalized,
    objects: normalized?.objects ?? [],
    assets: normalized?.assets ?? []
  };
}

function capHistory(history: PlayableProject[]) {
  return history.slice(0, 40);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function defaultProps(type: EditorObjectType): EditorObjectProps {
  if (type === "text") {
    return {
      text: "Double-click to edit",
      fontSize: 28,
      fontWeight: "900",
      color: "#ffffff",
      align: "center",
      strokeColor: "#000000",
      strokeWidth: 0,
      shadow: true
    };
  }

  if (type === "button" || type === "ctaButton") {
    return {
      label: type === "ctaButton" ? "Play Full Game" : "Button",
      backgroundColor: type === "ctaButton" ? "#a3e635" : "#23d3ee",
      textColor: "#071014",
      borderRadius: 14,
      action: type === "ctaButton" ? { type: "openUrl", url: "https://example.com/portfolio" } : { type: "none" }
    };
  }

  if (type === "shape" || type === "background") {
    return {
      shape: type === "background" ? "rectangle" : "roundedRectangle",
      fillColor: type === "background" ? "#101014" : "#23d3ee",
      strokeColor: type === "background" ? "#101014" : "#a3e635",
      strokeWidth: type === "background" ? 0 : 3
    };
  }

  if (type === "animatedSprite") {
    return {
      assetId: "",
      src: "",
      frameWidth: 64,
      frameHeight: 64,
      frameCount: 4,
      fps: 8,
      loop: true,
      autoplay: true
    };
  }

  if (type === "audio") {
    return {
      assetId: "",
      src: "",
      volume: 0.8,
      loop: false,
      playOnSceneStart: false,
      playOnClick: true
    };
  }

  return {
    assetId: "",
    src: "",
    fit: "contain",
    borderRadius: 10
  };
}

function createObject(
  project: PlayableProject,
  sceneId: string,
  type: EditorObjectType,
  defaults?: Partial<EditorObject>
): EditorObject {
  const maxZ = project.objects.reduce((max, object) => Math.max(max, object.zIndex), 0);
  const base: EditorObject = {
    id: createId("object"),
    sceneId,
    type,
    name:
      defaults?.name ??
      (type === "ctaButton"
        ? "CTA Button"
        : type === "animatedSprite"
          ? "Animated Sprite"
          : `${type.charAt(0).toUpperCase()}${type.slice(1)}`),
    x: type === "background" ? 0 : 100,
    y: type === "background" ? 0 : 230,
    width: type === "background" ? 360 : type === "text" ? 180 : 140,
    height: type === "background" ? 640 : type === "text" ? 52 : 70,
    rotation: 0,
    opacity: 1,
    zIndex: type === "background" ? -10 : maxZ + 1,
    locked: false,
    hidden: false,
    props: defaultProps(type),
    animations: ["none"],
    actions: type === "ctaButton" ? [{ type: "openUrl", url: project.settings.ctaUrl }] : [{ type: "none" }]
  };

  return {
    ...base,
    ...defaults,
    props: defaults?.props ?? base.props,
    actions: defaults?.actions ?? base.actions,
    animations: defaults?.animations ?? base.animations
  };
}

export const useEditorStore = create<EditorState>((set, get) => {
  function commitProject(nextProject: PlayableProject, statusMessage: string, selectedObjectId?: string | null) {
    const current = get().project;
    const normalized = normalizeProject(nextProject);

    set({
      ...syncProject(normalized),
      selectedObjectId: selectedObjectId === undefined ? get().selectedObjectId : selectedObjectId,
      undoStack: current ? capHistory([current, ...get().undoStack]) : get().undoStack,
      redoStack: [],
      isDirty: true,
      statusMessage
    });
  }

  function updateCurrentProject(
    updater: (project: PlayableProject) => PlayableProject,
    statusMessage: string,
    selectedObjectId?: string | null
  ) {
    const project = get().project;

    if (!project) {
      return;
    }

    commitProject(updater(project), statusMessage, selectedObjectId);
  }

  function updateObjectZIndex(objectId: string, direction: "up" | "down" | "front" | "back") {
    updateCurrentProject((project) => {
      const sceneId = get().currentSceneId;
      const sceneObjects = project.objects
        .filter((object) => object.sceneId === sceneId)
        .sort((a, b) => a.zIndex - b.zIndex);
      const index = sceneObjects.findIndex((object) => object.id === objectId);

      if (index < 0) {
        return project;
      }

      let ordered = [...sceneObjects];

      if (direction === "up" && index < ordered.length - 1) {
        [ordered[index], ordered[index + 1]] = [ordered[index + 1], ordered[index]];
      }

      if (direction === "down" && index > 0) {
        [ordered[index], ordered[index - 1]] = [ordered[index - 1], ordered[index]];
      }

      if (direction === "front") {
        const [item] = ordered.splice(index, 1);
        ordered.push(item);
      }

      if (direction === "back") {
        const [item] = ordered.splice(index, 1);
        ordered.unshift(item);
      }

      const reindexed = new Map(ordered.map((object, order) => [object.id, order + 1]));

      return {
        ...project,
        objects: project.objects.map((object) =>
          object.sceneId === sceneId && reindexed.has(object.id)
            ? { ...object, zIndex: reindexed.get(object.id) ?? object.zIndex }
            : object
        )
      };
    }, "Layer order updated.");
  }

  return {
    project: null,
    currentProject: null,
    selectedSceneId: null,
    currentSceneId: null,
    selectedObjectId: null,
    objects: [],
    assets: [],
    undoStack: [],
    redoStack: [],
    editorMode: "design",
    isDirty: false,
    statusMessage: "",
    clipboardObject: null,
    loadProject: (projectId) => {
      const project = getProject(projectId);
      const normalized = project ? normalizeProject(project) : null;
      const firstSceneId = normalized?.scenes[0]?.id ?? null;
      set({
        ...syncProject(normalized),
        selectedSceneId: firstSceneId,
        currentSceneId: firstSceneId,
        selectedObjectId: null,
        undoStack: [],
        redoStack: [],
        editorMode: "design",
        isDirty: false,
        statusMessage: normalized ? "Project loaded." : "Project not found."
      });
    },
    setProject: (project) => {
      const normalized = normalizeProject(project);
      const firstSceneId = normalized.scenes[0]?.id ?? null;
      set({
        ...syncProject(normalized),
        selectedSceneId: firstSceneId,
        currentSceneId: firstSceneId,
        selectedObjectId: null,
        undoStack: [],
        redoStack: [],
        isDirty: false,
        statusMessage: "Project loaded."
      });
    },
    setSelectedScene: (sceneId) =>
      set({ selectedSceneId: sceneId, currentSceneId: sceneId, selectedObjectId: null }),
    setEditorMode: (mode) => set({ editorMode: mode, selectedObjectId: mode === "preview" ? null : get().selectedObjectId }),
    updateProjectName: (name) => {
      updateCurrentProject(
        (project) => ({
          ...project,
          name,
          settings: { ...project.settings, title: name }
        }),
        "Project renamed."
      );
    },
    updateSettings: (settings) => {
      updateCurrentProject(
        (project) => ({
          ...project,
          settings: { ...project.settings, ...settings }
        }),
        "Settings updated."
      );
    },
    updateScene: (sceneId, scenePatch) => {
      updateCurrentProject(
        (project) => ({
          ...project,
          scenes: project.scenes.map((scene) => (scene.id === sceneId ? { ...scene, ...scenePatch } : scene))
        }),
        "Scene updated."
      );
    },
    addScene: (type = "gameplay") => {
      const project = get().project;

      if (!project) {
        return null;
      }

      const scene: PlayableScene = {
        id: createId("scene"),
        type,
        title: type === "intro" ? "New Intro Scene" : type === "endCard" ? "New End Card Scene" : "New Gameplay Scene",
        subtitle: "New scene",
        buttonText: "Continue",
        duration: type === "gameplay" ? project.settings.duration : 4,
        backgroundColor: "#101014",
        transition: "none",
        ctaText: project.settings.ctaText,
        winMessage: "Nice work",
        loseMessage: "Try again"
      };

      commitProject(
        {
          ...project,
          scenes: [...project.scenes, scene]
        },
        "Scene added.",
        null
      );
      set({ selectedSceneId: scene.id, currentSceneId: scene.id });
      return scene;
    },
    duplicateScene: (sceneId) => {
      const project = get().project;
      const source = project?.scenes.find((scene) => scene.id === sceneId);

      if (!project || !source) {
        return null;
      }

      const scene: PlayableScene = {
        ...structuredClone(source),
        id: createId("scene"),
        title: `${source.title} Copy`
      };
      const copiedObjects = project.objects
        .filter((object) => object.sceneId === sceneId)
        .map((object) => ({ ...structuredClone(object), id: createId("object"), sceneId: scene.id }));

      commitProject(
        {
          ...project,
          scenes: [...project.scenes, scene],
          objects: [...project.objects, ...copiedObjects]
        },
        "Scene duplicated.",
        null
      );
      set({ selectedSceneId: scene.id, currentSceneId: scene.id });
      return scene;
    },
    deleteScene: (sceneId) => {
      updateCurrentProject((project) => {
        if (project.scenes.length <= 1) {
          return project;
        }

        const scenes = project.scenes.filter((scene) => scene.id !== sceneId);
        const fallbackSceneId = scenes[0]?.id ?? null;
        set({ selectedSceneId: fallbackSceneId, currentSceneId: fallbackSceneId, selectedObjectId: null });

        return {
          ...project,
          scenes,
          objects: project.objects.filter((object) => object.sceneId !== sceneId)
        };
      }, "Scene deleted.", null);
    },
    addObject: (type, defaults) => {
      const project = get().project;
      const sceneId = defaults?.sceneId ?? get().currentSceneId;

      if (!project || !sceneId) {
        return null;
      }

      const object = createObject(project, sceneId, type, defaults);
      commitProject({ ...project, objects: [...project.objects, object] }, "Object added.", object.id);
      return object;
    },
    updateObject: (objectId, patch) => {
      updateCurrentProject(
        (project) => ({
          ...project,
          objects: project.objects.map((object) => (object.id === objectId ? { ...object, ...patch } : object))
        }),
        "Object updated."
      );
    },
    deleteObject: (objectId) => {
      updateCurrentProject(
        (project) => ({
          ...project,
          objects: project.objects.filter((object) => object.id !== objectId)
        }),
        "Object deleted.",
        null
      );
    },
    duplicateObject: (objectId) => {
      const project = get().project;
      const source = project?.objects.find((object) => object.id === objectId);

      if (!project || !source) {
        return null;
      }

      const copy: EditorObject = {
        ...structuredClone(source),
        id: createId("object"),
        name: `${source.name} Copy`,
        x: clamp(source.x + 18, 0, 360 - source.width),
        y: clamp(source.y + 18, 0, 640 - source.height),
        zIndex: source.zIndex + 1
      };

      commitProject({ ...project, objects: [...project.objects, copy] }, "Object duplicated.", copy.id);
      return copy;
    },
    copyObject: (objectId) => {
      const object = get().project?.objects.find((item) => item.id === objectId);
      set({ clipboardObject: object ? structuredClone(object) : null });
    },
    pasteObject: () => {
      const project = get().project;
      const clipboardObject = get().clipboardObject;
      const sceneId = get().currentSceneId;

      if (!project || !clipboardObject || !sceneId) {
        return null;
      }

      const copy: EditorObject = {
        ...structuredClone(clipboardObject),
        id: createId("object"),
        sceneId,
        name: `${clipboardObject.name} Copy`,
        x: clamp(clipboardObject.x + 20, 0, 360 - clipboardObject.width),
        y: clamp(clipboardObject.y + 20, 0, 640 - clipboardObject.height)
      };

      commitProject({ ...project, objects: [...project.objects, copy] }, "Object pasted.", copy.id);
      return copy;
    },
    selectObject: (objectId) => set({ selectedObjectId: objectId }),
    moveObject: (objectId, x, y) => {
      const object = get().project?.objects.find((item) => item.id === objectId);

      if (!object || object.locked) {
        return;
      }

      get().updateObject(objectId, {
        x: clamp(Math.round(x), 0, 360 - object.width),
        y: clamp(Math.round(y), 0, 640 - object.height)
      });
    },
    resizeObject: (objectId, width, height, x, y) => {
      const object = get().project?.objects.find((item) => item.id === objectId);

      if (!object || object.locked) {
        return;
      }

      get().updateObject(objectId, {
        width: clamp(Math.round(width), 12, 360),
        height: clamp(Math.round(height), 12, 640),
        x: x === undefined ? object.x : clamp(Math.round(x), 0, 360 - Math.max(width, 12)),
        y: y === undefined ? object.y : clamp(Math.round(y), 0, 640 - Math.max(height, 12))
      });
    },
    rotateObject: (objectId, rotation) => {
      const object = get().project?.objects.find((item) => item.id === objectId);

      if (!object || object.locked) {
        return;
      }

      get().updateObject(objectId, { rotation: Math.round(rotation) });
    },
    bringForward: (objectId) => updateObjectZIndex(objectId, "up"),
    sendBackward: (objectId) => updateObjectZIndex(objectId, "down"),
    bringToFront: (objectId) => updateObjectZIndex(objectId, "front"),
    sendToBack: (objectId) => updateObjectZIndex(objectId, "back"),
    lockObject: (objectId, locked) => {
      const object = get().project?.objects.find((item) => item.id === objectId);
      get().updateObject(objectId, { locked: locked ?? !object?.locked });
    },
    hideObject: (objectId, hidden) => {
      const object = get().project?.objects.find((item) => item.id === objectId);
      get().updateObject(objectId, { hidden: hidden ?? !object?.hidden });
    },
    addAsset: (asset) => {
      updateCurrentProject(
        (project) => ({
          ...project,
          assets: [asset, ...project.assets]
        }),
        "Asset added."
      );
    },
    deleteAsset: (assetId) => {
      updateCurrentProject(
        (project) => ({
          ...project,
          assets: project.assets.filter((asset) => asset.id !== assetId),
          objects: project.objects.map((object) => {
            if (!("assetId" in object.props) || object.props.assetId !== assetId) {
              return object;
            }

            return {
              ...object,
              props: { ...object.props, assetId: "", src: "" }
            };
          })
        }),
        "Asset deleted."
      );
    },
    updateAssetUsage: (assetId, usage) => {
      updateCurrentProject(
        (project) => ({
          ...project,
          assets: project.assets.map((asset) => (asset.id === assetId ? { ...asset, usage } : asset))
        }),
        "Asset usage updated."
      );
    },
    removeAsset: (assetId) => get().deleteAsset(assetId),
    setMechanic: (mechanic) => {
      updateCurrentProject((project) => ({ ...project, mechanic }), "Mechanic updated.");
    },
    saveProject: () => {
      const project = get().project;

      if (!project) {
        return null;
      }

      const saved = persistProject(project);
      set({ ...syncProject(saved), isDirty: false, statusMessage: "Project saved locally." });
      return saved;
    },
    duplicateCurrentProject: () => {
      const project = get().project;

      if (!project) {
        return null;
      }

      persistProject(project);
      return duplicateProject(project.id);
    },
    deleteCurrentProject: () => {
      const project = get().project;

      if (!project) {
        return;
      }

      deleteProject(project.id);
      set({
        ...syncProject(null),
        selectedSceneId: null,
        currentSceneId: null,
        selectedObjectId: null,
        isDirty: false,
        statusMessage: "Project deleted."
      });
    },
    resetFromTemplate: () => {
      const project = get().project;

      if (!project) {
        return;
      }

      const fresh = createProjectFromTemplate(project.templateId);
      const scenes = fresh.scenes;
      const resetProject: PlayableProject = {
        ...fresh,
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        objects: createDefaultObjects(project.name, scenes)
      };

      commitProject(resetProject, "Template defaults restored. Save to keep them.", null);
      set({ selectedSceneId: scenes[0]?.id ?? null, currentSceneId: scenes[0]?.id ?? null });
    },
    undo: () => {
      const current = get().project;
      const [previous, ...rest] = get().undoStack;

      if (!current || !previous) {
        return;
      }

      set({
        ...syncProject(previous),
        selectedObjectId: null,
        undoStack: rest,
        redoStack: capHistory([current, ...get().redoStack]),
        isDirty: true,
        statusMessage: "Undo."
      });
    },
    redo: () => {
      const current = get().project;
      const [next, ...rest] = get().redoStack;

      if (!current || !next) {
        return;
      }

      set({
        ...syncProject(next),
        selectedObjectId: null,
        undoStack: capHistory([current, ...get().undoStack]),
        redoStack: rest,
        isDirty: true,
        statusMessage: "Redo."
      });
    }
  };
});
