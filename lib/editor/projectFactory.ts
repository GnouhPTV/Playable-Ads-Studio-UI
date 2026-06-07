import type {
  EditorObject,
  EditorObjectType,
  InteractionMechanic,
  PlayableDuration,
  PlayableProject,
  PlayableScene,
  TemplateId
} from "@/types/project";
import { createDefaultLogicConfig, normalizeLogicConfig } from "@/lib/logic/defaultLogicConfigs";
import { getTemplateDefinition } from "@/lib/templates/templateDefinitions";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const templateCopy: Record<TemplateId, { intro: string; subtitle: string; end: string; mechanic: InteractionMechanic }> = {
  "merge-cannon": {
    intro: "Merge Cannons. Hold the Line.",
    subtitle: "Drag matching cannons together, upgrade firepower, and stop the wave.",
    end: "Your Defense Is Ready",
    mechanic: "merge"
  },
  "runner-gate": {
    intro: "Choose the Best Gate",
    subtitle: "Drag left and right, collect gems, and grow your score before the finish.",
    end: "Run Complete",
    mechanic: "dragHorizontal"
  },
  "tap-monster": {
    intro: "Tap the Monster",
    subtitle: "React fast and tap the monster before the timer reaches zero.",
    end: "Monster Cleared",
    mechanic: "tap"
  },
  "gem-collector": {
    intro: "Collect Every Gem",
    subtitle: "Tap glowing gems, build your score, and race the timer.",
    end: "Gem Run Complete",
    mechanic: "tap"
  },
  "simple-end-card": {
    intro: "Show the Offer",
    subtitle: "Use this focused end-card starter to practice CTA composition.",
    end: "Ready to Install",
    mechanic: "buttonAction"
  },
  "intro-cta": {
    intro: "Try the Core Loop",
    subtitle: "Guide the player from one clear promise into a CTA.",
    end: "Continue the Journey",
    mechanic: "sceneTransition"
  }
};

export function createScenes(templateId: TemplateId, duration: PlayableDuration): PlayableScene[] {
  const copy = templateCopy[templateId];

  return [
    {
      id: createId("scene"),
      type: "intro",
      title: copy.intro,
      subtitle: copy.subtitle,
      buttonText: "Play",
      duration: 3,
      backgroundColor: "#101014",
      transition: "fade",
      ctaText: "Start",
      winMessage: "Ready",
      loseMessage: "Try again"
    },
    {
      id: createId("scene"),
      type: "gameplay",
      title: "Gameplay",
      subtitle: "Playable interaction area",
      buttonText: "Continue",
      duration,
      backgroundColor: "#111827",
      transition: "none",
      ctaText: "Keep Playing",
      winMessage: "You win",
      loseMessage: "Time is up"
    },
    {
      id: createId("scene"),
      type: "endCard",
      title: copy.end,
      subtitle: "Export this learning playable and improve the flow.",
      buttonText: "Learn More",
      duration: 5,
      backgroundColor: "#101014",
      transition: "pop",
      ctaText: "Learn More",
      winMessage: "Great run",
      loseMessage: "Try another build"
    }
  ];
}

function baseObject(
  sceneId: string,
  type: EditorObjectType,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zIndex: number
): Omit<EditorObject, "props"> {
  return {
    id: createId("object"),
    sceneId,
    type,
    name,
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    zIndex,
    locked: false,
    hidden: false,
    animations: ["none"],
    actions: [{ type: "none" }]
  };
}

export function createDefaultObjects(projectName: string, scenes: PlayableScene[]): EditorObject[] {
  const intro = scenes.find((scene) => scene.type === "intro") ?? scenes[0];
  const gameplay = scenes.find((scene) => scene.type === "gameplay") ?? scenes[0];
  const endCard = scenes.find((scene) => scene.type === "endCard") ?? scenes[scenes.length - 1];

  return [
    {
      ...baseObject(intro.id, "text", "Intro Title", 34, 128, 292, 72, 10),
      props: {
        text: intro.title,
        fontSize: 30,
        fontWeight: "900",
        color: "#ffffff",
        align: "center",
        strokeColor: "#000000",
        strokeWidth: 0,
        shadow: true
      }
    },
    {
      ...baseObject(intro.id, "text", "Intro Subtitle", 42, 214, 276, 64, 11),
      props: {
        text: intro.subtitle,
        fontSize: 15,
        fontWeight: "600",
        color: "#cbd5e1",
        align: "center",
        strokeColor: "#000000",
        strokeWidth: 0,
        shadow: false
      }
    },
    {
      ...baseObject(intro.id, "button", "Play Button", 80, 430, 200, 56, 20),
      props: {
        label: "Play",
        backgroundColor: "#23d3ee",
        textColor: "#071014",
        borderRadius: 14,
        action: { type: "nextScene", targetSceneId: gameplay.id }
      },
      actions: [{ type: "nextScene", targetSceneId: gameplay.id }],
      animations: ["popIn"]
    },
    {
      ...baseObject(gameplay.id, "text", "Score HUD", 16, 28, 130, 30, 20),
      props: {
        text: "Score 0",
        fontSize: 16,
        fontWeight: "800",
        color: "#ffffff",
        align: "left",
        strokeColor: "#000000",
        strokeWidth: 0,
        shadow: true
      }
    },
    {
      ...baseObject(gameplay.id, "text", "Timer HUD", 242, 28, 100, 30, 21),
      props: {
        text: "30s",
        fontSize: 16,
        fontWeight: "800",
        color: "#ffffff",
        align: "right",
        strokeColor: "#000000",
        strokeWidth: 0,
        shadow: true
      }
    },
    {
      ...baseObject(gameplay.id, "shape", "Gameplay Focus Object", 130, 286, 100, 100, 8),
      props: {
        shape: "circle",
        fillColor: "#23d3ee",
        strokeColor: "#a3e635",
        strokeWidth: 4
      },
      animations: ["pulse"]
    },
    {
      ...baseObject(endCard.id, "text", "End Card Title", 36, 144, 288, 76, 10),
      props: {
        text: endCard.title,
        fontSize: 28,
        fontWeight: "900",
        color: "#ffffff",
        align: "center",
        strokeColor: "#000000",
        strokeWidth: 0,
        shadow: true
      }
    },
    {
      ...baseObject(endCard.id, "text", "End Card Subtitle", 46, 242, 268, 64, 11),
      props: {
        text: `${projectName} is ready to test locally.`,
        fontSize: 15,
        fontWeight: "600",
        color: "#cbd5e1",
        align: "center",
        strokeColor: "#000000",
        strokeWidth: 0,
        shadow: false
      }
    },
    {
      ...baseObject(endCard.id, "text", "Final Score Text", 58, 320, 244, 42, 12),
      props: {
        text: "Final Score 0",
        fontSize: 20,
        fontWeight: "900",
        color: "#ffffff",
        align: "center",
        strokeColor: "#000000",
        strokeWidth: 0,
        shadow: true
      }
    },
    {
      ...baseObject(endCard.id, "ctaButton", "CTA Button", 62, 420, 236, 56, 20),
      props: {
        label: "Play Full Game",
        backgroundColor: "#a3e635",
        textColor: "#071014",
        borderRadius: 16,
        action: { type: "openUrl", url: "https://example.com/portfolio" }
      },
      actions: [{ type: "openUrl", url: "https://example.com/portfolio" }],
      animations: ["bounce"]
    },
    {
      ...baseObject(endCard.id, "button", "Replay Button", 92, 492, 176, 46, 21),
      props: {
        label: "Replay",
        backgroundColor: "#eff6ff",
        textColor: "#1d4ed8",
        borderRadius: 14,
        action: { type: "replay" }
      },
      actions: [{ type: "replay" }]
    }
  ];
}

export function createProjectFromTemplate(templateId: TemplateId): PlayableProject {
  const template = getTemplateDefinition(templateId);
  const now = new Date().toISOString();
  const copy = templateCopy[template.id];
  const scenes = createScenes(template.id, template.recommendedDuration);

  const objects = createDefaultObjects(template.name, scenes);
  const projectSettings = {
    title: template.name,
    duration: template.id === "tap-monster" ? 30 : template.recommendedDuration,
    targetScore: template.id === "tap-monster" ? 20 : 80,
    mainColor: template.accentColor,
    accentColor: template.id === "runner-gate" ? "#fbbf24" : "#a3e635",
    backgroundStyle: template.id === "runner-gate" ? "forestArcade" : "midnightGrid",
    difficulty: template.difficulty,
    ctaText: "Play Full Game",
    ctaUrl: "https://example.com/portfolio",
    introTitle: copy.intro,
    introSubtitle: copy.subtitle,
    playButtonText: "Play",
    endCardTitle: copy.end,
    endCardSubtitle: "This local MVP export is ready for learning and testing.",
    orientation: "portrait",
    networkPreset: "generic",
    packageName: template.id,
    compressionQuality: 80
  } satisfies PlayableProject["settings"];

  return {
    id: createId("project"),
    name: template.name,
    templateId: template.id,
    createdAt: now,
    updatedAt: now,
    mechanic: copy.mechanic,
    assets: [],
    settings: projectSettings,
    scenes,
    objects,
    logicConfig: createDefaultLogicConfig(template.id, scenes, objects, projectSettings)
  };
}

export function cloneProject(project: PlayableProject): PlayableProject {
  const now = new Date().toISOString();

  return {
    ...structuredClone(project),
    id: createId("project"),
    name: `${project.name} Copy`,
    createdAt: now,
    updatedAt: now
  };
}

export function touchProject(project: PlayableProject): PlayableProject {
  return {
    ...project,
    updatedAt: new Date().toISOString()
  };
}

export function normalizeProject(project: PlayableProject): PlayableProject {
  const scenes = project.scenes.map((scene) => ({
    ...scene,
    transition: scene.transition ?? "none"
  }));
  const objects = project.objects?.length ? project.objects : createDefaultObjects(project.name, scenes);
  const assets = (project.assets ?? []).map((asset) => ({
    ...asset,
    mimeType: asset.mimeType ?? (asset.dataUrl.match(/^data:(.*?);/)?.[1] || "application/octet-stream")
  }));

  return {
    ...project,
    scenes,
    assets,
    objects,
    logicConfig: normalizeLogicConfig(project.templateId, scenes, objects, project.settings, project.logicConfig)
  };
}
