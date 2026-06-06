"use client";

import { useMemo, useState } from "react";
import { Bot, Copy, Wand2 } from "lucide-react";

export function AiBuilderPage() {
  const [form, setForm] = useState({
    appName: "My Puzzle App",
    genre: "Puzzle",
    mechanic: "Drag & Drop",
    colorStyle: "Bright blue and white",
    ctaText: "Play Now",
    network: "Generic HTML5",
    prompt: "Create a 30-second playable with a clear intro, one core interaction, and an end card."
  });

  const output = useMemo(
    () => ({
      idea: `${form.appName}: ${form.mechanic} playable for ${form.genre}`,
      layout: {
        intro: `Headline introduces ${form.genre} challenge`,
        gameplay: `One-screen ${form.mechanic} interaction with score feedback`,
        endCard: `CTA button: ${form.ctaText}`
      },
      style: form.colorStyle,
      targetNetwork: form.network,
      scenes: ["Intro Scene", "Gameplay Scene", "End Card Scene"]
    }),
    [form]
  );

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <section className="studio-panel rounded-lg p-6">
        <p className="mb-2 text-sm font-bold text-blue-700">Local Mock Generator</p>
        <h1 className="text-3xl font-black text-slate-950">AI Playable Builder</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Structured MVP for future AI generation. It creates mock playable specs locally, with no backend calls.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="studio-panel rounded-lg p-5">
          <h2 className="text-lg font-black text-slate-950">Playable Brief</h2>
          <div className="mt-4 grid gap-3">
            <Field label="Game/App name" value={form.appName} onChange={(value) => update("appName", value)} />
            <Field label="Genre" value={form.genre} onChange={(value) => update("genre", value)} />
            <Field label="Main mechanic" value={form.mechanic} onChange={(value) => update("mechanic", value)} />
            <Field label="Color style" value={form.colorStyle} onChange={(value) => update("colorStyle", value)} />
            <Field label="CTA text" value={form.ctaText} onChange={(value) => update("ctaText", value)} />
            <Field label="Target network" value={form.network} onChange={(value) => update("network", value)} />
            <label>
              <span className="studio-label">Prompt</span>
              <textarea className="studio-input min-h-28" value={form.prompt} onChange={(event) => update("prompt", event.target.value)} />
            </label>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <Action label="Generate Playable Idea" />
            <Action label="Generate Layout" />
            <Action label="Generate Scene Copy" />
          </div>
        </section>

        <section className="studio-panel rounded-lg p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="size-5 text-blue-600" aria-hidden />
            <h2 className="text-lg font-black text-slate-950">Mock Structured Output</h2>
          </div>
          <pre className="overflow-auto rounded-md border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-sky-100">
            {JSON.stringify(output, null, 2)}
          </pre>
          <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
            <Copy className="size-4" aria-hidden />
            Copy JSON
          </button>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="studio-label">{label}</span>
      <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Action({ label }: { label: string }) {
  return (
    <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-black text-white transition hover:bg-blue-700">
      <Wand2 className="size-4" aria-hidden />
      {label}
    </button>
  );
}
