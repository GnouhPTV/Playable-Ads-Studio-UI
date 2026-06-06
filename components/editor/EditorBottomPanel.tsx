"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, FileText, Layers, Lightbulb, TriangleAlert, XCircle } from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { validateProjectForExport, type ValidationItem } from "@/lib/editor/validators";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { LearningNotesPanel } from "@/components/editor/LearningNotesPanel";

type BottomTab = "layers" | "notes" | "validation" | "guide";

interface EditorBottomPanelProps {
  project: PlayableProject;
  onShowOnboarding: () => void;
}

const tabs: Array<{ id: BottomTab; label: string; icon: typeof Layers }> = [
  { id: "layers", label: "Layers", icon: Layers },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "validation", label: "Validation", icon: CheckCircle2 },
  { id: "guide", label: "Learning Guide", icon: BookOpen }
];

export function EditorBottomPanel({ project, onShowOnboarding }: EditorBottomPanelProps) {
  const [tab, setTab] = useState<BottomTab>("layers");
  const validation = useMemo(() => validateProjectForExport(project), [project]);

  return (
    <section className="studio-panel rounded-lg">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 p-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
              tab === id ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "layers" ? <LayersPanel embedded /> : null}
        {tab === "notes" ? <NotesPanel /> : null}
        {tab === "validation" ? <ValidationGrid items={validation} /> : null}
        {tab === "guide" ? <LearningNotesPanel project={project} onShowOnboarding={onShowOnboarding} embedded /> : null}
      </div>
    </section>
  );
}

function NotesPanel() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Note title="Onboarding tip" text="Start by naming scenes clearly: Intro, Gameplay, End Card. The exported project.json keeps those names." />
      <Note title="Shortcut hints" text="Delete removes selection. Ctrl+C/V copies and pastes. Ctrl+D duplicates. Arrow keys nudge objects." />
      <Note title="Project notes" text="Use this panel as a checklist while designing: goal, interaction, feedback, CTA, export target." />
    </div>
  );
}

function Note({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
    </article>
  );
}

function ValidationGrid({ items }: { items: ValidationItem[] }) {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ValidationRow key={item.id} item={item} />
      ))}
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
    <article className={`rounded-md border p-3 ${color}`}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div>
          <h3 className="text-sm font-black">{item.label}</h3>
          <p className="mt-1 text-xs leading-5 opacity-85">{item.message}</p>
        </div>
      </div>
    </article>
  );
}
