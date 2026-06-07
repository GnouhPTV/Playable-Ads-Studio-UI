import type { PlayableProject } from "@/types/project";
import type { ObjectRole } from "@/types/logic";

export type LogicValidationLevel = "pass" | "warning" | "error";

export interface LogicValidationItem {
  id: string;
  label: string;
  level: LogicValidationLevel;
  message: string;
  suggestion: string;
}

function countRole(project: PlayableProject, role: ObjectRole) {
  return project.logicConfig.objectRoles.filter((item) => item.role === role).length;
}

function hasScene(project: PlayableProject, type: "intro" | "gameplay" | "endCard") {
  return project.scenes.some((scene) => scene.type === type);
}

function item(
  id: string,
  label: string,
  pass: boolean,
  message: string,
  suggestion: string,
  warning = false
): LogicValidationItem {
  return {
    id,
    label,
    level: pass ? "pass" : warning ? "warning" : "error",
    message,
    suggestion
  };
}

export function validateLogicConfig(project: PlayableProject): LogicValidationItem[] {
  const templateType = project.logicConfig.templateType;
  const items: LogicValidationItem[] = [
    item(
      "logic-end-card",
      "End card scene",
      hasScene(project, "endCard"),
      hasScene(project, "endCard") ? "End card scene exists." : "Missing end card scene.",
      "Add an end card scene."
    )
  ];

  if (templateType === "tapMonster") {
    items.push(
      item(
        "tap-target",
        "Tap target role",
        countRole(project, "tapTarget") > 0,
        countRole(project, "tapTarget") > 0 ? "Tap target is assigned." : "No object has Tap Target role.",
        "Select the monster object and set Playable Role to Tap Target."
      ),
      item(
        "tap-score-text",
        "Score text role",
        countRole(project, "scoreText") > 0,
        countRole(project, "scoreText") > 0 ? "Score text role is assigned." : "No score text role found.",
        "Select the score HUD object and set role to Score Text."
      ),
      item(
        "tap-timer-text",
        "Timer text role",
        countRole(project, "timerText") > 0,
        countRole(project, "timerText") > 0 ? "Timer text role is assigned." : "No timer text role found.",
        "Select the timer HUD object and set role to Timer Text."
      ),
      item(
        "tap-cta",
        "CTA role",
        countRole(project, "ctaButton") > 0,
        countRole(project, "ctaButton") > 0 ? "CTA button role is assigned." : "CTA role is missing.",
        "Assign a CTA Button role on the end card.",
        true
      )
    );
  }

  if (templateType === "runnerGate") {
    items.push(
      item("runner-player", "Player role", countRole(project, "player") > 0, "Player role check complete.", "Assign Player role to the runner object."),
      item("runner-gate", "Gate role or generated gates", true, "MVP gates are generated from Gameplay settings.", "Use Gameplay panel to edit gate values."),
      item("runner-score", "Score text role", countRole(project, "scoreText") > 0, "Score text check complete.", "Assign Score Text role.")
    );
  }

  if (templateType === "mergeCannon") {
    items.push(
      item("merge-cannon", "Cannon role", countRole(project, "cannon") > 0, "Cannon role check complete.", "Assign Cannon role to at least one object."),
      item("merge-enemy", "Enemy spawn config", Boolean(project.logicConfig.settings.enemySpawnRate), "Enemy spawn config exists.", "Set enemy spawn rate in Gameplay panel.")
    );
  }

  if (templateType === "gemCollector") {
    items.push(
      item("gem-collectible", "Collectible role", countRole(project, "collectible") > 0, "Collectible role check complete.", "Assign Collectible role to at least one gem object."),
      item("gem-score", "Score text role", countRole(project, "scoreText") > 0, "Score text check complete.", "Assign Score Text role.")
    );
  }

  return items;
}
