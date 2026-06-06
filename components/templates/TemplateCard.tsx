"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Gamepad2 } from "lucide-react";
import type { TemplateDefinition } from "@/types/template";
import { createProjectFromTemplate } from "@/lib/editor/projectFactory";
import { saveProject } from "@/lib/editor/projectStorage";

export function TemplateCard({ template }: { template: TemplateDefinition }) {
  const router = useRouter();

  function useTemplate() {
    const project = saveProject(createProjectFromTemplate(template.id));
    router.push(`/editor/${project.id}`);
  }

  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      className="studio-panel flex min-h-[470px] flex-col overflow-hidden rounded-lg transition hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(15,23,42,0.12)]"
    >
      <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${template.thumbnailClass}`}>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-white/35" />
        <div className="absolute inset-0 grid place-items-center">
          <TemplateThumbnail templateId={template.id} />
        </div>
        <div className="absolute left-4 top-4 rounded-md border border-white/80 bg-white/80 px-3 py-1 text-xs font-bold text-slate-700 backdrop-blur">
          {template.difficulty}
        </div>
        <div className="absolute right-4 top-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {template.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">{template.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{template.description}</p>
            <p className="mt-3 text-xs font-bold uppercase text-blue-700">{template.mainMechanic}</p>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-600">
            <Gamepad2 className="size-5" aria-hidden />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {template.tags.map((tag) => (
            <span key={tag} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          >
            <Eye className="size-4" aria-hidden />
            Preview
          </button>
          <button
            type="button"
            onClick={useTemplate}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
          >
            Use Template
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function TemplateThumbnail({ templateId }: { templateId: TemplateDefinition["id"] }) {
  if (templateId === "runner-gate") {
    return (
      <div className="relative h-40 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
        <div className="absolute inset-x-8 bottom-0 top-0 bg-slate-100" />
        <div className="absolute inset-y-0 left-[70px] border-l border-dashed border-slate-300" />
        <div className="absolute inset-y-0 right-[70px] border-l border-dashed border-slate-300" />
        <div className="absolute left-7 top-7 rounded-md bg-lime-300 px-3 py-2 text-xs font-black text-zinc-950 shadow-glow">
          +10
        </div>
        <div className="absolute left-[83px] top-14 rounded-md bg-amber-300 px-3 py-2 text-xs font-black text-zinc-950">
          x2
        </div>
        <div className="absolute right-7 top-9 rounded-md bg-rose-300 px-3 py-2 text-xs font-black text-zinc-950">
          -5
        </div>
        <div className="absolute bottom-7 left-[94px] size-9 rounded-full bg-cyan-300 shadow-glow" />
        <div className="absolute bottom-3 left-[84px] text-[10px] font-black uppercase tracking-normal text-slate-400">
          drag lanes
        </div>
        <div className="absolute bottom-14 right-8 size-3 rounded-full bg-lime-300" />
        <div className="absolute bottom-20 left-10 size-2.5 rounded-full bg-lime-200" />
      </div>
    );
  }

  if (templateId === "tap-monster") {
    return (
      <div className="relative h-40 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
        <div className="absolute right-4 top-4 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-700">
          12s
        </div>
        <div className="absolute left-7 top-7 size-6 rounded-full border border-pink-200/40 bg-pink-300/35" />
        <div className="absolute right-10 top-20 size-5 rounded-full border border-pink-200/40 bg-pink-300/35" />
        <div className="absolute bottom-7 left-12 size-4 rounded-full border border-pink-200/40 bg-pink-300/35" />
        <div className="absolute left-[74px] top-[52px] size-20 rounded-full bg-pink-300 shadow-glow" />
        <div className="absolute left-[96px] top-[86px] h-2.5 w-9 rounded bg-zinc-950" />
        <div className="absolute left-[92px] top-[74px] flex gap-5">
          <span className="size-2 rounded-full bg-zinc-950" />
          <span className="size-2 rounded-full bg-zinc-950" />
        </div>
        <div className="absolute bottom-4 right-6 rounded-md bg-cyan-300 px-2 py-1 text-[10px] font-black text-zinc-950">
          tap target
        </div>
      </div>
    );
  }

  return (
      <div className="relative h-40 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="absolute bottom-4 left-4 right-4 h-14 rounded-lg border border-slate-200 bg-slate-100" />
      <div className="absolute bottom-10 left-7 size-11 rounded-full bg-cyan-300 shadow-glow" />
      <div className="absolute bottom-10 left-[80px] size-11 rounded-full bg-cyan-300/80" />
      <div className="absolute bottom-[53px] left-[62px] h-1.5 w-8 rounded bg-lime-300" />
      <div className="absolute bottom-9 left-[118px] rounded-md bg-lime-300 px-2 py-1 text-[10px] font-black text-zinc-950">
        L2
      </div>
      <div className="absolute right-7 top-8 size-10 rounded-full bg-rose-300" />
      <div className="absolute right-14 top-[72px] h-1.5 w-20 rotate-[-18deg] rounded bg-lime-300 shadow-glow" />
        <div className="absolute left-5 top-5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-700 shadow-sm">
        auto shoot
      </div>
    </div>
  );
}
