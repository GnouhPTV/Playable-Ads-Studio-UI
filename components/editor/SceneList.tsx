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
          <h2 className="text-sm font-black uppercase tracking-normal text-white">Project Scenes</h2>
          <p className="mt-1 text-xs leading-5 text-studio-muted">Intro, gameplay, and end card flow.</p>
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
                  ? "border-cyan-300/35 bg-cyan-300/12"
                  : "border-white/8 bg-white/[0.04] hover:border-white/18"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/8 text-studio-cyan">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-white">
                    {index + 1}. {scene.title}
                  </span>
                  <span className="block text-xs text-studio-muted">
                    {scene.duration}s - {scene.type}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-lg border border-amber-300/18 bg-amber-300/8 p-3 text-xs leading-5 text-amber-100">
        MVP export is for learning and local testing. Real network deployment needs extra specs and QA.
      </div>
    </div>
  );
}
