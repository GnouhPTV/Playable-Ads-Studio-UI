import type { TemplateDefinition } from "@/types/template";

export const templateDefinitions: TemplateDefinition[] = [
  {
    id: "merge-cannon",
    name: "Merge Cannon Defense",
    difficulty: "normal",
    category: "Merge",
    popularity: 96,
    addedAt: "2026-05-22",
    mainMechanic: "Merge + Auto Shoot",
    tags: ["merge", "drag drop", "auto shoot", "defense"],
    mechanics: ["dragDrop", "merge", "autoShoot"],
    recommendedDuration: 30,
    description: "Drag cannons, merge equal levels, and let them fire at waves of enemies.",
    accentColor: "#23d3ee",
    thumbnailClass: "from-sky-200 via-white to-emerald-100"
  },
  {
    id: "runner-gate",
    name: "Runner Gate Game",
    difficulty: "easy",
    category: "Runner",
    popularity: 91,
    addedAt: "2026-05-28",
    mainMechanic: "Drag Horizontal",
    tags: ["runner", "drag left/right", "gates", "gems"],
    mechanics: ["dragHorizontal"],
    recommendedDuration: 30,
    description: "Slide a character through score gates, collect gems, and avoid bad paths.",
    accentColor: "#a3e635",
    thumbnailClass: "from-emerald-100 via-white to-amber-100"
  },
  {
    id: "tap-monster",
    name: "Tap Monster",
    difficulty: "easy",
    category: "Tap",
    popularity: 88,
    addedAt: "2026-05-30",
    mainMechanic: "Tap Reaction",
    tags: ["tap", "score", "timer", "reaction"],
    mechanics: ["tap"],
    recommendedDuration: 15,
    description: "Tap a monster as it jumps around the screen before the timer runs out.",
    accentColor: "#f472b6",
    thumbnailClass: "from-pink-100 via-white to-sky-100"
  },
  {
    id: "gem-collector",
    name: "Gem Collector",
    difficulty: "easy",
    category: "Casual",
    popularity: 84,
    addedAt: "2026-06-01",
    mainMechanic: "Tap + Score",
    tags: ["tap", "collection", "score", "casual"],
    mechanics: ["tap"],
    recommendedDuration: 30,
    description: "Collect glowing gems, show score feedback, and end with a clean CTA screen.",
    accentColor: "#0ea5e9",
    thumbnailClass: "from-sky-100 via-white to-cyan-100"
  },
  {
    id: "simple-end-card",
    name: "Simple End Card Template",
    difficulty: "easy",
    category: "Casual",
    popularity: 78,
    addedAt: "2026-06-03",
    mainMechanic: "CTA Layout",
    tags: ["end card", "cta", "layout", "beginner"],
    mechanics: ["buttonAction", "endCardTrigger"],
    recommendedDuration: 15,
    description: "A focused end-card layout with app title, benefit copy, image slot, and CTA button.",
    accentColor: "#22c55e",
    thumbnailClass: "from-emerald-100 via-white to-slate-100"
  },
  {
    id: "intro-cta",
    name: "Intro + CTA Template",
    difficulty: "normal",
    category: "Puzzle",
    popularity: 73,
    addedAt: "2026-06-05",
    mainMechanic: "Scene Transition",
    tags: ["intro", "cta", "scene flow", "copy"],
    mechanics: ["sceneTransition", "buttonAction"],
    recommendedDuration: 15,
    description: "A beginner-friendly two-screen flow for testing onboarding copy and CTA clarity.",
    accentColor: "#6366f1",
    thumbnailClass: "from-indigo-100 via-white to-sky-100"
  }
];

export function getTemplateDefinition(templateId: string) {
  return templateDefinitions.find((template) => template.id === templateId) ?? templateDefinitions[0];
}
