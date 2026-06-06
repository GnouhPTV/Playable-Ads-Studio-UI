"use client";

import { BatteryFull, Signal, Wifi } from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { PhaserPreview } from "@/components/game/PhaserPreview";

export function PhonePreviewFrame({ project }: { project: PlayableProject }) {
  return (
    <div className="relative rounded-[38px] border border-white/16 bg-gradient-to-b from-zinc-800 to-zinc-950 p-3 shadow-panel">
      <div className="absolute -left-1 top-32 h-16 w-1 rounded-l bg-zinc-700" />
      <div className="absolute -right-1 top-24 h-12 w-1 rounded-r bg-zinc-700" />
      <div className="absolute -right-1 top-44 h-12 w-1 rounded-r bg-zinc-700" />

      <div className="relative h-[640px] w-[360px] overflow-hidden rounded-[28px] border border-white/12 bg-black">
        <div className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between bg-black/30 px-5 text-[10px] font-black text-white/80 backdrop-blur-sm">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2.5 h-4 w-24 -translate-x-1/2 rounded-full bg-black/82" />
          <span className="flex items-center gap-1.5">
            <Signal className="size-3" aria-hidden />
            <Wifi className="size-3" aria-hidden />
            <BatteryFull className="size-3.5" aria-hidden />
          </span>
        </div>
        <PhaserPreview project={project} />
      </div>
      <div className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-white/16" />
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-studio-muted">
        <span className="rounded-md border border-white/10 bg-white/6 px-2 py-1">360 x 640</span>
        <span className="rounded-md border border-cyan-300/18 bg-cyan-300/10 px-2 py-1 text-cyan-100">
          {project.templateId}
        </span>
      </div>
    </div>
  );
}
