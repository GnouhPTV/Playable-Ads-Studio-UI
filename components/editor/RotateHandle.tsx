"use client";

import { RotateCw } from "lucide-react";

export function RotateHandle({
  onRotateStart
}: {
  onRotateStart: (event: React.PointerEvent) => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={onRotateStart}
      className="absolute left-1/2 top-[-42px] grid size-8 -translate-x-1/2 cursor-grab place-items-center rounded-full border border-cyan-300/40 bg-zinc-950 text-studio-cyan shadow-glow"
      aria-label="Rotate object"
    >
      <RotateCw className="size-4" aria-hidden />
    </button>
  );
}
