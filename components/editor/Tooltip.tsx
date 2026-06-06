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
        className="grid size-6 place-items-center rounded-md border border-slate-200 bg-white text-slate-400 transition hover:border-blue-200 hover:text-blue-600"
      >
        <HelpCircle className="size-3.5" aria-hidden />
      </button>
      <span className="pointer-events-none absolute right-0 top-8 z-30 hidden w-64 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs leading-5 text-slate-600 shadow-panel group-hover:block group-focus-within:block">
        <span className="block font-extrabold text-slate-950">{label}</span>
        <span className="mt-1 block text-slate-500">{text}</span>
      </span>
    </span>
  );
}
