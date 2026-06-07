"use client";

import { BookOpen, FileCode2, Lightbulb } from "lucide-react";
import type { PlayableProject } from "@/types/project";

const guides: Record<PlayableProject["templateId"], { title: string; steps: string[]; concepts: string[] }> = {
  "tap-monster": {
    title: "How to customize Tap Monster",
    steps: [
      "Select the monster object.",
      "In Playable Role, choose Tap Target.",
      "Set score per tap.",
      "Enable randomize position after tap.",
      "Select Score Text and assign role Score Text.",
      "Select Timer Text and assign role Timer Text.",
      "Set timer duration in Gameplay Logic.",
      "Preview the game.",
      "Export ZIP."
    ],
    concepts: ["Tap Target role", "score per tap", "random movement", "timer end action", "CTA and replay roles"]
  },
  "merge-cannon": {
    title: "How to customize Merge Cannon",
    steps: [
      "Assign Cannon role to cannon objects.",
      "Use Gameplay settings to change cannon damage and fire rate.",
      "Set enemy HP, enemy speed, spawn rate, and merge max level.",
      "Preview drag and merge behavior.",
      "Export ZIP and test locally."
    ],
    concepts: ["cannon role", "merge slot role", "enemy role", "damage", "fire rate", "drag and merge"]
  },
  "runner-gate": {
    title: "How to customize Runner Gate",
    steps: [
      "Assign Player role to the runner object.",
      "Use Gameplay settings to set lane count and gate values.",
      "Preview drag horizontal movement.",
      "Tune gate rewards and penalties.",
      "Export ZIP and test locally."
    ],
    concepts: ["player role", "gate role", "gate values", "drag horizontal mechanic"]
  },
  "gem-collector": {
    title: "How to customize Gem Collector",
    steps: [
      "Assign Collectible role to gem objects.",
      "Set gem value and target score.",
      "Choose whether gems respawn on tap.",
      "Preview score and timer behavior.",
      "Export ZIP and test locally."
    ],
    concepts: ["collectible role", "score value", "respawn setting", "target score"]
  },
  "simple-end-card": {
    title: "How to customize Simple End Card",
    steps: [
      "Edit title and subtitle text objects.",
      "Assign CTA Button role to the CTA button.",
      "Set CTA text and URL placeholder.",
      "Preview CTA behavior.",
      "Export ZIP."
    ],
    concepts: ["CTA role", "end card copy", "local URL placeholder"]
  },
  "intro-cta": {
    title: "How to customize Intro + CTA",
    steps: [
      "Edit intro title and subtitle.",
      "Assign Play Button role to the intro button.",
      "Set the button action to go to the end card.",
      "Assign CTA Button role on the end card.",
      "Preview and export."
    ],
    concepts: ["intro scene", "scene transition", "CTA action"]
  }
};

const codeFiles = [
  "components/editor/LogicPanel.tsx",
  "components/editor/ObjectRolePanel.tsx",
  "components/editor/ActionBuilder.tsx",
  "lib/logic/logicRuntime.ts",
  "lib/logic/defaultLogicConfigs.ts",
  "components/runtime/PlayableRuntime.tsx",
  "lib/editor/exportProject.ts"
];

export function TemplateGuidePanel({ project }: { project: PlayableProject }) {
  const guide = guides[project.templateId];

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-blue-50 text-blue-600">
            <Lightbulb className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase text-slate-950">{guide.title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              This guide matches the selected template and the no-code logic panels.
            </p>
          </div>
        </div>
        <ol className="grid gap-2 text-sm leading-6 text-slate-700">
          {guide.steps.map((step, index) => (
            <li key={step} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <strong className="mr-2 text-blue-700">{index + 1}.</strong>
              {step}
            </li>
          ))}
        </ol>
      </article>

      <div className="grid gap-4">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
            <BookOpen className="size-4 text-blue-600" aria-hidden />
            Template Concepts
          </h3>
          <ul className="space-y-2 text-xs leading-5 text-slate-600">
            {guide.concepts.map((concept) => (
              <li key={concept}>{concept}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
            <FileCode2 className="size-4 text-blue-600" aria-hidden />
            What To Study In Code
          </h3>
          <ul className="space-y-2 text-xs leading-5 text-slate-600">
            {codeFiles.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
