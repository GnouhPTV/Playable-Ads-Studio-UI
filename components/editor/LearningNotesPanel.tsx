"use client";

import { BookOpen, CheckSquare, FileCode2, Lightbulb } from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { Tooltip } from "@/components/editor/Tooltip";

const templateLessons = {
  "merge-cannon": [
    "Drag input moves the selected cannon.",
    "Merge logic checks matching levels and distance.",
    "Auto-shooting is a repeated timer event."
  ],
  "runner-gate": [
    "Pointer movement controls the player X position.",
    "Gate collisions change score with simple rules.",
    "Cleanup removes objects after they leave the screen."
  ],
  "tap-monster": [
    "Tap input adds score.",
    "Tween animation moves the monster to a new position.",
    "The timer decides when to show the end card."
  ],
  "gem-collector": [
    "Tap targets can add score and trigger floating feedback.",
    "Gem collection is a simple loop for teaching reward timing.",
    "End cards should repeat the win feeling before CTA."
  ],
  "simple-end-card": [
    "End cards are final conversion screens.",
    "CTA copy should be short and specific.",
    "Keep one clear next action on the screen."
  ],
  "intro-cta": [
    "Intro scenes explain the playable goal.",
    "Buttons can transition between scenes.",
    "A short flow is useful for testing ad copy quickly."
  ]
} satisfies Record<PlayableProject["templateId"], string[]>;

const templateSceneFiles = {
  "gem-collector": "GemCollectorScene",
  "intro-cta": "CtaFlowScene",
  "merge-cannon": "MergeCannonScene",
  "runner-gate": "RunnerGateScene",
  "simple-end-card": "CtaFlowScene",
  "tap-monster": "TapMonsterScene"
} satisfies Record<PlayableProject["templateId"], string>;

export function LearningNotesPanel({
  project,
  onShowOnboarding,
  embedded = false
}: {
  project: PlayableProject;
  onShowOnboarding: () => void;
  embedded?: boolean;
}) {
  return (
    <section className={embedded ? "" : "studio-panel rounded-lg p-4"}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-slate-950">Learning Guide</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Small checkpoints for studying this playable while you edit.
          </p>
        </div>
        <Tooltip
          label="Scene"
          text="A scene is one screen in the playable flow: intro, gameplay, or end card."
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <NoteCard icon={BookOpen} title="Study Path" items={templateLessons[project.templateId]} />
        <NoteCard
          icon={CheckSquare}
          title="Export Readiness"
          items={[
            "Confirm the intro tells the player what to do.",
            "Test the runtime preview in the phone frame.",
            "Verify video/audio objects have local sources.",
            "Make the CTA text clear before export."
          ]}
        />
        <NoteCard
          icon={FileCode2}
          title="Files To Read"
          items={[
            "types/project.ts",
            "components/runtime/PlayableRuntime.tsx",
            "lib/runtime/runtimeActions.ts",
            "store/editorStore.ts",
            "lib/editor/exportProject.ts",
            `lib/game/scenes/${templateSceneFiles[project.templateId]}.ts`
          ]}
        />
      </div>

      <button
        type="button"
        onClick={onShowOnboarding}
        className="mt-4 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:border-blue-300"
      >
        <Lightbulb className="size-4" aria-hidden />
        Show Guided Onboarding
      </button>
    </section>
  );
}

function NoteCard({
  icon: Icon,
  title,
  items
}: {
  icon: typeof BookOpen;
  title: string;
  items: string[];
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-950">
        <Icon className="size-4 text-blue-600" aria-hidden />
        {title}
      </div>
      <ul className="space-y-2 text-xs leading-5 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
