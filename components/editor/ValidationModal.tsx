"use client";

import { CheckCircle2, TriangleAlert, X, XCircle } from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { validateProjectForExport, type ValidationItem } from "@/lib/editor/validators";

export function ValidationModal({
  project,
  open,
  onClose
}: {
  project: PlayableProject;
  open: boolean;
  onClose: () => void;
  onShowOnboarding: () => void;
}) {
  if (!open) return null;

  const items = validateProjectForExport(project);
  const errors = items.filter((item) => item.level === "error").length;
  const warnings = items.filter((item) => item.level === "warning").length;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg border border-slate-200 bg-white shadow-panel">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Validation Results</h2>
            <p className="mt-1 text-sm text-slate-600">
              {errors} error(s), {warnings} warning(s). Fix errors before production-style export.
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-900">
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2">
          {items.map((item) => (
            <ValidationRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ValidationRow({ item }: { item: ValidationItem }) {
  const Icon = item.level === "pass" ? CheckCircle2 : item.level === "warning" ? TriangleAlert : XCircle;
  const color =
    item.level === "pass"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : item.level === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-red-200 bg-red-50 text-red-700";

  return (
    <article className={`rounded-md border p-4 ${color}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <h3 className="text-sm font-black">{item.label}</h3>
          <p className="mt-1 text-xs leading-5 opacity-85">{item.message}</p>
        </div>
      </div>
    </article>
  );
}
