"use client";

import { Clock3 } from "lucide-react";
import type { PlayableProject } from "@/types/project";

export function TimelinePanel({ project }: { project: PlayableProject }) {
  const totalDuration = project.scenes.reduce((total, scene) => total + scene.duration, 0);

  return (
    <section className="studio-panel rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-white">Event Timeline</h2>
          <p className="mt-1 text-xs text-studio-muted">
            {project.mechanic ?? "No mechanic"} - {totalDuration}s scene flow
          </p>
        </div>
        <Clock3 className="size-5 text-studio-cyan" aria-hidden />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {project.scenes.map((scene) => (
          <div key={scene.id} className="rounded-lg border border-white/8 bg-white/[0.04] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold text-white">{scene.title}</span>
              <span className="rounded-md bg-white/8 px-2 py-1 text-xs text-studio-muted">
                {scene.duration}s
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-studio-cyan"
                style={{ width: `${Math.max(12, (scene.duration / totalDuration) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
