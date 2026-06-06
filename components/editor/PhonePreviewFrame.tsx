"use client";

import { BatteryFull, Signal, Wifi } from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { PhaserPreview } from "@/components/game/PhaserPreview";

export function PhonePreviewFrame({ project }: { project: PlayableProject }) {
  return (
    <div className="relative rounded-[38px] border border-slate-300 bg-gradient-to-b from-white to-slate-100 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
      <div className="absolute -left-1 top-32 h-16 w-1 rounded-l bg-slate-300" />
      <div className="absolute -right-1 top-24 h-12 w-1 rounded-r bg-slate-300" />
      <div className="absolute -right-1 top-44 h-12 w-1 rounded-r bg-slate-300" />

      <div className="relative h-[640px] w-[360px] overflow-hidden rounded-[28px] border border-slate-300 bg-black shadow-inner">
        <div className="absolute inset-x-0 top-0 z-20 flex h-9 items-center justify-between bg-slate-950/45 px-5 text-[10px] font-black text-white/85 backdrop-blur-sm">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2.5 h-4 w-24 -translate-x-1/2 rounded-full bg-black/80 shadow-sm" />
          <span className="flex items-center gap-1.5">
            <Signal className="size-3" aria-hidden />
            <Wifi className="size-3" aria-hidden />
            <BatteryFull className="size-3.5" aria-hidden />
          </span>
        </div>
        <PhaserPreview project={project} />
      </div>
      <div className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-slate-300" />
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-bold">360 x 640</span>
        <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 font-bold text-blue-700">
          {project.templateId}
        </span>
      </div>
    </div>
  );
}
