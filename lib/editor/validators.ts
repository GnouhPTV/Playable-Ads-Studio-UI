import type { PlayableProject } from "@/types/project";
import { estimateProjectBytes } from "@/lib/editor/projectStorage";
import { validateLogicConfig } from "@/lib/logic/logicValidation";

export type ValidationLevel = "pass" | "warning" | "error";

export interface ValidationItem {
  id: string;
  label: string;
  level: ValidationLevel;
  message: string;
}

function hasScene(project: PlayableProject, type: "intro" | "gameplay" | "endCard") {
  return project.scenes.some((scene) => scene.type === type);
}

function objectHasSource(project: PlayableProject, objectId: string) {
  const object = project.objects.find((item) => item.id === objectId);

  if (!object || !("src" in object.props)) {
    return false;
  }

  return Boolean(object.props.src || object.props.assetId);
}

function getMissingActionTargets(project: PlayableProject) {
  const sceneIds = new Set(project.scenes.map((scene) => scene.id));

  return project.objects.filter((object) =>
    object.actions.some((action) =>
      (action.type === "nextScene" || action.type === "goToScene") &&
      action.targetSceneId &&
      !sceneIds.has(action.targetSceneId)
    )
  );
}

export function validateProjectForExport(project: PlayableProject): ValidationItem[] {
  const estimatedBytes = estimateProjectBytes(project);
  const imageObjects = project.objects.filter((object) => object.type === "image" || object.type === "animatedSprite");
  const audioObjects = project.objects.filter((object) => object.type === "audio");
  const videoObjects = project.objects.filter((object) => object.type === "video");
  const hasCtaButton = project.objects.some((object) => object.type === "ctaButton");
  const missingImageSources = imageObjects.filter((object) => !objectHasSource(project, object.id));
  const missingAudioSources = audioObjects.filter((object) => !objectHasSource(project, object.id));
  const missingVideoSources = videoObjects.filter((object) => !objectHasSource(project, object.id));
  const missingActionTargets = getMissingActionTargets(project);

  const baseItems: ValidationItem[] = [
    {
      id: "intro-scene",
      label: "Intro scene",
      level: hasScene(project, "intro") ? "pass" : "error",
      message: hasScene(project, "intro") ? "Intro scene exists." : "Add an intro scene before exporting."
    },
    {
      id: "gameplay-scene",
      label: "Gameplay scene",
      level: hasScene(project, "gameplay") ? "pass" : "error",
      message: hasScene(project, "gameplay")
        ? "Gameplay scene exists."
        : "Add a gameplay scene before exporting."
    },
    {
      id: "end-card",
      label: "End card scene",
      level: hasScene(project, "endCard") ? "pass" : "error",
      message: hasScene(project, "endCard")
        ? "End card exists."
        : "Add an end card before exporting."
    },
    {
      id: "cta-text",
      label: "CTA text",
      level: project.settings.ctaText.trim() && hasCtaButton ? "pass" : "error",
      message:
        project.settings.ctaText.trim() && hasCtaButton
          ? "CTA text and a CTA button object are ready."
          : "Add CTA text and at least one CTA button object."
    },
    {
      id: "duration",
      label: "Playable duration",
      level: project.settings.duration ? "pass" : "error",
      message: project.settings.duration
        ? `${project.settings.duration}s duration selected.`
        : "Choose a playable duration."
    },
    {
      id: "mechanic",
      label: "Interaction mechanic",
      level: project.mechanic ? "pass" : "warning",
      message: project.mechanic
        ? "A primary interaction mechanic is selected."
        : "Choose a mechanic so the export clearly communicates the interaction."
    },
    {
      id: "image-sources",
      label: "Image object sources",
      level: missingImageSources.length === 0 ? "pass" : "error",
      message:
        missingImageSources.length === 0
          ? "All image and sprite objects have a source."
          : `${missingImageSources.length} image or sprite object needs an uploaded asset or source.`
    },
    {
      id: "audio-sources",
      label: "Audio object sources",
      level: missingAudioSources.length === 0 ? "pass" : "error",
      message:
        missingAudioSources.length === 0
          ? "All audio objects have a source or there are no audio objects."
          : `${missingAudioSources.length} audio object needs an uploaded audio source.`
    },
    {
      id: "video-sources",
      label: "Video object sources",
      level: missingVideoSources.length === 0 ? "pass" : "error",
      message:
        missingVideoSources.length === 0
          ? "All video objects have a source or there are no video objects."
          : `${missingVideoSources.length} video object needs an uploaded video source.`
    },
    {
      id: "action-targets",
      label: "Scene action targets",
      level: missingActionTargets.length === 0 ? "pass" : "error",
      message:
        missingActionTargets.length === 0
          ? "All scene navigation actions point to existing scenes."
          : `${missingActionTargets.length} action points to a missing scene.`
    },
    {
      id: "mobile-size",
      label: "Mobile size",
      level: "pass",
      message: "The visual editor and export use a 360x640 portrait canvas."
    },
    {
      id: "package-size",
      label: "Package size",
      level: estimatedBytes > 4_500_000 ? "warning" : "pass",
      message:
        estimatedBytes > 4_500_000
          ? "The project data is large. Real networks often enforce strict file limits."
          : "Estimated package size is comfortable for local testing."
    }
  ];

  const logicItems: ValidationItem[] = validateLogicConfig(project).map((item) => ({
    id: `logic-${item.id}`,
    label: item.label,
    level: item.level,
    message: `${item.message} ${item.level === "pass" ? "" : `Fix: ${item.suggestion}`}`.trim()
  }));

  return [...baseItems, ...logicItems];
}

export function getExportChecklist(project: PlayableProject): ValidationItem[] {
  return [
    {
      id: "check-intro-screen",
      label: "Intro screen",
      level: hasScene(project, "intro") ? "pass" : "error",
      message: hasScene(project, "intro")
        ? "The playable has a first screen that can explain the goal."
        : "Add an intro scene so players know what to do."
    },
    {
      id: "check-gameplay-interaction",
      label: "Gameplay interaction",
      level: project.mechanic ? "pass" : "warning",
      message: project.mechanic
        ? "A main player action is selected."
        : "Choose a mechanic such as tap, drag, merge, or auto-shoot."
    },
    {
      id: "check-timer",
      label: "Timer",
      level: project.settings.duration > 0 ? "pass" : "error",
      message:
        project.settings.duration > 0
          ? `${project.settings.duration}s timer is set.`
          : "Choose a duration so the playable can end automatically."
    },
    {
      id: "check-end-card",
      label: "End card",
      level: hasScene(project, "endCard") ? "pass" : "error",
      message: hasScene(project, "endCard")
        ? "The playable has a final screen."
        : "Add an end card scene."
    },
    {
      id: "check-cta-button",
      label: "CTA button",
      level: project.settings.ctaText.trim() && project.objects.some((object) => object.type === "ctaButton") ? "pass" : "error",
      message: project.settings.ctaText.trim() && project.objects.some((object) => object.type === "ctaButton")
        ? "CTA button text is ready."
        : "Add CTA text and a CTA button object."
    },
    {
      id: "check-mobile-portrait",
      label: "Mobile portrait size",
      level: "pass",
      message: "Preview and export target a 360x640 portrait canvas."
    }
  ];
}

export function hasBlockingExportErrors(items: ValidationItem[]) {
  return items.some((item) => item.level === "error");
}
