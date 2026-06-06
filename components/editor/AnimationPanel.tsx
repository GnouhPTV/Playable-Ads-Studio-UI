"use client";

import type { AnimationPreset, EditorObject } from "@/types/project";
import { useEditorStore } from "@/store/editorStore";

const animationPresets: AnimationPreset[] = [
  "none",
  "fadeIn",
  "popIn",
  "bounce",
  "pulse",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
  "shake"
];

export function AnimationPanel({ object }: { object: EditorObject }) {
  const updateObject = useEditorStore((state) => state.updateObject);
  const animation = object.animations[0] ?? "none";

  return (
    <section className="rounded-lg border border-white/8 bg-white/[0.035] p-4">
      <h3 className="text-sm font-black text-white">Animation</h3>
      <label className="mt-3 block">
        <span className="studio-label">Animation preset</span>
        <select
          className="studio-input"
          value={animation}
          onChange={(event) => updateObject(object.id, { animations: [event.target.value as AnimationPreset] })}
        >
          {animationPresets.map((preset) => (
            <option key={preset} value={preset}>
              {preset}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
