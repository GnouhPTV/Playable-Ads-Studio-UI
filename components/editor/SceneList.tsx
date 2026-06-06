"use client";

import { Clapperboard, Gamepad2, Trophy } from "lucide-react";
import type { PlayableProject, SceneType } from "@/types/project";
import { Tooltip } from "@/components/editor/Tooltip";
import { useEditorStore } from "@/store/editorStore";

const sceneIcons: Record<SceneType, typeof Clapperboard> = {
  intro: Clapperboard,
  gameplay: Gamepad2,
  endCard: Trophy
};

export function SceneList({
  project,
  selectedSceneId
}: {
  project: PlayableProject;
  selectedSceneId: string | null;
}) {
  const setSelectedScene = useEditorStore((state) => state.setSelectedScene);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-slate-950">Project Scenes</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Intro, gameplay, and end card flow.</p>
        </div>
        <Tooltip
          label="Scene"
          text="A scene is one screen in the playable. Beginners usually edit the intro promise, gameplay rules, then end card CTA."
        />
      </div>

      <div className="space-y-2">
        {project.scenes.map((scene, index) => {
          const Icon = sceneIcons[scene.type];
          const active = scene.id === selectedSceneId;

          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => setSelectedScene(scene.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                active
                  ? "border-blue-200 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-slate-950">
                    {index + 1}. {scene.title}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {scene.duration}s - {scene.type}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
        MVP export is for learning and local testing. Real network deployment needs extra specs and QA.
      </div>
    </div>
  );
}
