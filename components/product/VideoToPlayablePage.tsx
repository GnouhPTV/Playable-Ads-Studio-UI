"use client";

import { useState } from "react";
import { Download, Layers, MousePointerClick, Scissors, Upload, Video } from "lucide-react";

export function VideoToPlayablePage() {
  const [fileName, setFileName] = useState("");
  const [cta, setCta] = useState("Play Now");
  const [headline, setHeadline] = useState("Try the interactive version");

  return (
    <div className="space-y-6">
      <section className="studio-panel rounded-lg p-6">
        <div className="max-w-3xl">
          <p className="mb-2 text-sm font-bold text-blue-700">MVP Placeholder</p>
          <h1 className="text-3xl font-black text-slate-950">Video to Playable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload a video, plan trim/crop, add overlays, preview the composition, and prepare a local export plan. Full video editing can be added later.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4">
          <section className="studio-panel rounded-lg p-5">
            <h2 className="text-lg font-black text-slate-950">1. Upload Video</h2>
            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-blue-300 bg-blue-50 p-4 text-sm font-bold text-blue-700">
              <Upload className="size-5" aria-hidden />
              {fileName || "Choose MP4/WebM file"}
              <input
                type="file"
                accept="video/mp4,video/webm"
                className="sr-only"
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
              />
            </label>
          </section>

          <section className="studio-panel rounded-lg p-5">
            <h2 className="text-lg font-black text-slate-950">2. Overlays</h2>
            <div className="mt-4 space-y-3">
              <Field label="Text overlay" value={headline} onChange={setHeadline} />
              <Field label="CTA button" value={cta} onChange={setCta} />
              <div className="grid grid-cols-2 gap-2">
                <Tool icon={<Scissors className="size-4" />} label="Trim" />
                <Tool icon={<Layers className="size-4" />} label="Crop" />
                <Tool icon={<MousePointerClick className="size-4" />} label="CTA Overlay" />
                <Tool icon={<Download className="size-4" />} label="Export Plan" />
              </div>
            </div>
          </section>
        </aside>

        <section className="studio-panel rounded-lg p-6">
          <div className="mx-auto max-w-[360px] rounded-[34px] border border-slate-200 bg-white p-3 shadow-panel">
            <div className="relative h-[640px] overflow-hidden rounded-[26px] bg-slate-950">
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white">
                <div className="text-center">
                  <Video className="mx-auto mb-4 size-14 text-blue-300" aria-hidden />
                  <p className="text-sm font-bold">{fileName || "Video preview placeholder"}</p>
                </div>
              </div>
              <div className="absolute inset-x-6 top-20 rounded-md bg-white/90 p-3 text-center text-lg font-black text-slate-950">
                {headline}
              </div>
              <button className="absolute bottom-16 left-1/2 min-h-12 w-56 -translate-x-1/2 rounded-md bg-blue-600 text-sm font-black text-white shadow-glow">
                {cta}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Tool({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
      {icon}
      {label}
    </button>
  );
}
