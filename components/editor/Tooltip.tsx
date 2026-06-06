"use client";

import { HelpCircle } from "lucide-react";

interface TooltipProps {
  label: string;
  text: string;
}

export function Tooltip({ label, text }: TooltipProps) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="grid size-6 place-items-center rounded-md border border-white/10 bg-white/6 text-studio-muted transition hover:border-cyan-300/30 hover:text-studio-cyan"
      >
        <HelpCircle className="size-3.5" aria-hidden />
      </button>
      <span className="pointer-events-none absolute right-0 top-8 z-30 hidden w-64 rounded-lg border border-white/10 bg-zinc-950 p-3 text-left text-xs leading-5 text-zinc-200 shadow-panel group-hover:block group-focus-within:block">
        <span className="block font-extrabold text-white">{label}</span>
        <span className="mt-1 block text-studio-muted">{text}</span>
      </span>
    </span>
  );
}
