"use client";

import { ArrowRight, CheckCircle2, Download, Images, MousePointer2, X } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Pick a scene",
    text: "Use the left panel to move between intro, gameplay, and end card screens."
  },
  {
    title: "Edit safely",
    text: "Change text, colors, duration, difficulty, and CTA copy in the right panel."
  },
  {
    title: "Preview often",
    text: "The phone frame runs a Phaser prototype so you can test the main mechanic quickly."
  },
  {
    title: "Export when ready",
    text: "The export modal checks required pieces before it downloads a local ZIP package."
  }
];

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/76 p-4 backdrop-blur-sm">
      <section className="studio-panel w-full max-w-3xl rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-studio-cyan">First editor visit</p>
            <h2 className="mt-2 text-2xl font-black text-white">Build your playable in four passes</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-studio-muted">
              This editor is intentionally small. Start with the scene flow, then tune gameplay,
              assets, and export readiness.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/6 text-studio-muted hover:text-white"
            title="Close onboarding"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-lg border border-white/8 bg-white/[0.04] p-4">
              <div className="mb-3 grid size-9 place-items-center rounded-lg bg-cyan-300/12 text-studio-cyan">
                {index + 1}
              </div>
              <h3 className="text-sm font-black text-white">{step.title}</h3>
              <p className="mt-2 text-xs leading-5 text-studio-muted">{step.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-3 rounded-lg border border-lime-300/16 bg-lime-300/8 p-4 text-sm leading-6 text-lime-50 md:grid-cols-3">
          <span className="inline-flex items-center gap-2">
            <MousePointer2 className="size-4" aria-hidden />
            Interact inside preview
          </span>
          <span className="inline-flex items-center gap-2">
            <Images className="size-4" aria-hidden />
            Optional local assets
          </span>
          <span className="inline-flex items-center gap-2">
            <Download className="size-4" aria-hidden />
            Local ZIP export
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs text-studio-muted">
            <CheckCircle2 className="size-4 text-lime-300" aria-hidden />
            You can reopen this guidance from the Learning Notes panel.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg bg-studio-cyan px-4 py-3 text-sm font-extrabold text-zinc-950"
          >
            Start Editing
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </section>
    </div>
  );
}
