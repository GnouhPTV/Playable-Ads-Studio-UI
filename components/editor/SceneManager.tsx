"use client";

import { Copy, Plus, Trash2 } from "lucide-react";
import type { SceneType } from "@/types/project";
import { useEditorStore } from "@/store/editorStore";

const sceneTypes: { value: SceneType; label: string }[] = [
  { value: "intro", label: "Intro Scene" },
  { value: "gameplay", label: "Gameplay Scene" },
  { value: "endCard", label: "End Card Scene" }
];

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

          return (
            <article
              key={scene.id}
              className={`rounded-lg border p-3 ${
                active ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedScene(scene.id)}
                className="mb-2 block w-full text-left text-xs font-black uppercase tracking-normal text-slate-500"
              >
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
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700"
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
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
          >
            <Plus className="size-4 text-studio-cyan" aria-hidden />
            Add {sceneType.label}
          </button>
        ))}
      </div>
    </section>
  );
}
