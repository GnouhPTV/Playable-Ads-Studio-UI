"use client";

import { Clapperboard, Copy, Gamepad2, Plus, Trash2, Trophy } from "lucide-react";
import type { SceneType } from "@/types/project";
import { useEditorStore } from "@/store/editorStore";

const sceneTypes: { value: SceneType; label: string }[] = [
  { value: "intro", label: "Intro Scene" },
  { value: "gameplay", label: "Gameplay Scene" },
  { value: "endCard", label: "End Card Scene" }
];

const sceneIcons: Record<SceneType, typeof Clapperboard> = {
  intro: Clapperboard,
  gameplay: Gamepad2,
  endCard: Trophy
};

export function SceneManager() {
  const project = useEditorStore((state) => state.project);
  const currentSceneId = useEditorStore((state) => state.currentSceneId);
  const setSelectedScene = useEditorStore((state) => state.setSelectedScene);
  const updateScene = useEditorStore((state) => state.updateScene);
  const addScene = useEditorStore((state) => state.addScene);
  const duplicateScene = useEditorStore((state) => state.duplicateScene);
  const deleteScene = useEditorStore((state) => state.deleteScene);

  if (!project) {
    return null;
  }

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-black text-slate-950">Scenes</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">Edit the screen flow of your playable.</p>
      </div>

      <div className="space-y-2">
        {project.scenes.map((scene) => {
          const active = scene.id === currentSceneId;
          const Icon = sceneIcons[scene.type];

          return (
            <article
              key={scene.id}
              className={`rounded-lg border p-3 shadow-sm ${
                active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedScene(scene.id)}
                className="mb-2 flex w-full items-center gap-2 text-left text-xs font-black uppercase tracking-normal text-slate-500"
              >
                <span className="grid size-8 place-items-center rounded-md bg-white text-blue-600 shadow-sm">
                  <Icon className="size-4" aria-hidden />
                </span>
                {scene.type}
              </button>
              <input
                value={scene.title}
                onChange={(event) => updateScene(scene.id, { title: event.target.value })}
                className="studio-input py-2 text-sm font-bold"
                aria-label="Rename scene"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => duplicateScene(scene.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  <Copy className="size-3.5" aria-hidden />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => deleteScene(scene.id)}
                  disabled={project.scenes.length <= 1}
                  className="ml-auto grid size-7 place-items-center rounded-md border border-red-200 bg-red-50 text-red-700"
                  title="Delete scene"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2">
        {sceneTypes.map((sceneType) => (
          <button
            key={sceneType.value}
            type="button"
            onClick={() => addScene(sceneType.value)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            <Plus className="size-4 text-blue-600" aria-hidden />
            Add {sceneType.label}
          </button>
        ))}
      </div>
    </section>
  );
}
