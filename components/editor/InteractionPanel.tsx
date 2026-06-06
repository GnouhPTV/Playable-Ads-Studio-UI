"use client";

import { Crosshair, Fingerprint, MoveHorizontal, MousePointer2, Repeat2 } from "lucide-react";
import type { InteractionMechanic, PlayableProject } from "@/types/project";
import { Tooltip } from "@/components/editor/Tooltip";
import { useEditorStore } from "@/store/editorStore";

const mechanicOptions: {
  id: InteractionMechanic;
  label: string;
  description: string;
  icon: typeof Fingerprint;
}[] = [
  {
    id: "tap",
    label: "Tap",
    description: "The player taps a target to increase score or trigger feedback.",
    icon: Fingerprint
  },
  {
    id: "dragHorizontal",
    label: "Drag left/right",
    description: "The player moves a character across lanes by dragging horizontally.",
    icon: MoveHorizontal
  },
  {
    id: "dragDrop",
    label: "Drag and drop",
    description: "The player picks up an item and drops it onto a target area.",
    icon: MousePointer2
  },
  {
    id: "merge",
    label: "Merge",
    description: "Two matching items combine into a stronger upgraded item.",
    icon: Repeat2
  },
  {
    id: "autoShoot",
    label: "Auto shoot",
    description: "Units automatically attack enemies after the player places them.",
    icon: Crosshair
  }
];

export function InteractionPanel({ project }: { project: PlayableProject }) {
  const setMechanic = useEditorStore((state) => state.setMechanic);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-950">Interaction Editor</h3>
          <p className="mt-1 text-xs text-slate-500">Choose one primary mechanic for the MVP export.</p>
        </div>
        <Tooltip
          label="Mechanic"
          text="A mechanic is the main action the player learns: tap, drag, merge, or auto-shoot."
        />
      </div>

      <div className="mt-4 space-y-2">
        {mechanicOptions.map((option) => {
          const Icon = option.icon;
          const active = project.mechanic === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMechanic(option.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                active
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <span className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-slate-950">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{option.description}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
