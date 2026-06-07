import type { EditorObject, PlayableScene, PlayableSettings, TemplateId } from "@/types/project";
import type {
  LogicAction,
  LogicObjectRole,
  LogicSettingValue,
  LogicTemplateType,
  ObjectRole,
  PlayableLogicConfig
} from "@/types/logic";

function createLogicId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function templateIdToLogicType(templateId: TemplateId): LogicTemplateType {
  const map: Record<TemplateId, LogicTemplateType> = {
    "gem-collector": "gemCollector",
    "intro-cta": "introCta",
    "merge-cannon": "mergeCannon",
    "runner-gate": "runnerGate",
    "simple-end-card": "endCard",
    "tap-monster": "tapMonster"
  };

  return map[templateId];
}

function sceneByType(scenes: PlayableScene[], type: PlayableScene["type"]) {
  return scenes.find((scene) => scene.type === type) ?? scenes[0];
}

function findObject(objects: EditorObject[], sceneId: string | undefined, names: string[]) {
  const normalizedNames = names.map((name) => name.toLowerCase());

  return objects.find((object) => {
    if (sceneId && object.sceneId !== sceneId) {
      return false;
    }

    return normalizedNames.some((name) => object.name.toLowerCase().includes(name));
  });
}

function role(object: EditorObject | undefined, roleName: ObjectRole, settings: Record<string, LogicSettingValue> = {}): LogicObjectRole[] {
  return object ? [{ objectId: object.id, role: roleName, settings }] : [];
}

function action(
  trigger: LogicAction["trigger"],
  type: LogicAction["type"],
  options: Omit<LogicAction, "id" | "trigger" | "type"> = {}
): LogicAction {
  return {
    id: createLogicId("action"),
    trigger,
    type,
    ...options
  };
}

function baseConfig(templateId: TemplateId, scenes: PlayableScene[], objects: EditorObject[], settings: PlayableSettings): PlayableLogicConfig {
  const intro = sceneByType(scenes, "intro");
  const gameplay = sceneByType(scenes, "gameplay");
  const endCard = sceneByType(scenes, "endCard");
  const scoreObject = findObject(objects, gameplay?.id, ["score"]);
  const timerObject = findObject(objects, gameplay?.id, ["timer"]);

  return {
    templateType: templateIdToLogicType(templateId),
    score: {
      enabled: true,
      initialValue: 0,
      targetValue: settings.targetScore || 20,
      scoreObjectId: scoreObject?.id
    },
    timer: {
      enabled: true,
      duration: settings.duration || gameplay?.duration || 30,
      timerObjectId: timerObject?.id,
      onCompleteAction: action("onTimerEnd", "showEndCard", { targetSceneId: endCard?.id })
    },
    objectRoles: [],
    actions: [],
    sceneFlow: {
      introSceneId: intro?.id,
      gameplaySceneId: gameplay?.id,
      endCardSceneId: endCard?.id
    },
    settings: {}
  };
}

export function createDefaultLogicConfig(
  templateId: TemplateId,
  scenes: PlayableScene[],
  objects: EditorObject[],
  settings: PlayableSettings
): PlayableLogicConfig {
  const config = baseConfig(templateId, scenes, objects, settings);
  const intro = sceneByType(scenes, "intro");
  const gameplay = sceneByType(scenes, "gameplay");
  const endCard = sceneByType(scenes, "endCard");
  const playButton = findObject(objects, intro?.id, ["play button"]);
  const ctaButton = findObject(objects, endCard?.id, ["cta"]);
  const replayButton = findObject(objects, endCard?.id, ["replay"]);
  const scoreObject = findObject(objects, gameplay?.id, ["score"]);
  const timerObject = findObject(objects, gameplay?.id, ["timer"]);
  const focusObject = findObject(objects, gameplay?.id, ["focus", "monster", "player", "gem", "cannon"]);
  const finalScoreObject = findObject(objects, endCard?.id, ["final score", "score"]);

  const commonRoles = [
    ...role(playButton, "playButton"),
    ...role(scoreObject, "scoreText", { prefix: "Score", finalScore: false }),
    ...role(timerObject, "timerText", { format: "30s", linkedToTimer: true }),
    ...role(finalScoreObject, "scoreText", { prefix: "Final Score", finalScore: true }),
    ...role(ctaButton, "ctaButton"),
    ...role(replayButton, "replayButton")
  ];
  const commonActions = [
    action("onClick", "goToScene", { targetObjectId: playButton?.id, targetSceneId: gameplay?.id }),
    action("onTimerEnd", "showEndCard", { targetSceneId: endCard?.id }),
    action("onClick", "openUrl", { targetObjectId: ctaButton?.id, value: settings.ctaUrl }),
    action("onClick", "replay", { targetObjectId: replayButton?.id })
  ];

  if (templateId === "tap-monster") {
    return {
      ...config,
      score: { ...config.score, targetValue: settings.targetScore || 20, scoreObjectId: scoreObject?.id },
      timer: { ...config.timer, duration: 30, timerObjectId: timerObject?.id },
      objectRoles: [
        ...commonRoles,
        ...role(focusObject, "tapTarget", {
          scorePerTap: 1,
          randomizeAfterTap: true,
          randomArea: "safeArea",
          tapAnimation: "pop",
          respawnDelay: 0,
          maxTaps: 0,
          visibleAtSceneStart: true
        })
      ],
      actions: [
        ...commonActions,
        action("onTap", "addScore", { targetObjectId: focusObject?.id, value: 1 }),
        action("onTap", "randomizePosition", { targetObjectId: focusObject?.id, value: "safeArea" }),
        action("onTap", "playAnimation", { targetObjectId: focusObject?.id, value: "pop" })
      ],
      settings: {
        scorePerTap: 1,
        randomizeAfterTap: true,
        randomArea: "safeArea",
        tapAnimation: "pop",
        respawnDelay: 0,
        maxTaps: 0
      }
    };
  }

  if (templateId === "runner-gate") {
    return {
      ...config,
      objectRoles: [...commonRoles, ...role(focusObject, "player")],
      actions: [...commonActions, action("onDrag", "applyGateEffect", { targetObjectId: focusObject?.id })],
      settings: {
        playerSpeed: 1,
        laneCount: 3,
        gateValues: [10, 2, -5],
        gemReward: 5
      }
    };
  }

  if (templateId === "merge-cannon") {
    return {
      ...config,
      objectRoles: [...commonRoles, ...role(focusObject, "cannon", { level: 1 })],
      actions: [
        ...commonActions,
        action("onDrag", "mergeObject", { targetObjectId: focusObject?.id }),
        action("onCollision", "damageTarget", { targetObjectId: focusObject?.id, value: 1 })
      ],
      settings: {
        cannonDamage: 1,
        fireRate: 1.1,
        enemyHp: 3,
        enemySpeed: 1,
        mergeLevelLimit: 4,
        coinReward: 10,
        gemReward: 1,
        enemySpawnRate: 2.2
      }
    };
  }

  if (templateId === "gem-collector") {
    return {
      ...config,
      objectRoles: [...commonRoles, ...role(focusObject, "collectible", { value: 5 })],
      actions: [
        ...commonActions,
        action("onTap", "addScore", { targetObjectId: focusObject?.id, value: 5 }),
        action("onTap", "randomizePosition", { targetObjectId: focusObject?.id, value: "safeArea" })
      ],
      settings: {
        gemCount: 5,
        gemValue: 5,
        respawnOnTap: true
      }
    };
  }

  if (templateId === "simple-end-card") {
    return {
      ...config,
      score: { ...config.score, enabled: false },
      timer: { ...config.timer, enabled: false },
      objectRoles: commonRoles,
      actions: commonActions,
      settings: {
        title: settings.endCardTitle,
        subtitle: settings.endCardSubtitle,
        ctaText: settings.ctaText,
        ctaUrl: settings.ctaUrl,
        backgroundColor: endCard?.backgroundColor ?? "#101014"
      }
    };
  }

  return {
    ...config,
    score: { ...config.score, enabled: false },
    timer: { ...config.timer, enabled: false },
    objectRoles: commonRoles,
    actions: [
      action("onClick", "goToScene", { targetObjectId: playButton?.id, targetSceneId: endCard?.id }),
      action("onClick", "openUrl", { targetObjectId: ctaButton?.id, value: settings.ctaUrl }),
      action("onClick", "replay", { targetObjectId: replayButton?.id })
    ],
    settings: {
      introTitle: settings.introTitle,
      introSubtitle: settings.introSubtitle,
      buttonText: settings.playButtonText,
      endCardTitle: settings.endCardTitle,
      ctaText: settings.ctaText,
      ctaUrl: settings.ctaUrl
    }
  };
}

export function normalizeLogicConfig(
  templateId: TemplateId,
  scenes: PlayableScene[],
  objects: EditorObject[],
  settings: PlayableSettings,
  logicConfig?: PlayableLogicConfig
): PlayableLogicConfig {
  const fallback = createDefaultLogicConfig(templateId, scenes, objects, settings);

  if (!logicConfig) {
    return fallback;
  }

  return {
    ...fallback,
    ...logicConfig,
    score: { ...fallback.score, ...logicConfig.score },
    timer: { ...fallback.timer, ...logicConfig.timer },
    objectRoles: logicConfig.objectRoles ?? fallback.objectRoles,
    actions: logicConfig.actions ?? fallback.actions,
    sceneFlow: { ...fallback.sceneFlow, ...logicConfig.sceneFlow },
    settings: { ...fallback.settings, ...logicConfig.settings }
  };
}
