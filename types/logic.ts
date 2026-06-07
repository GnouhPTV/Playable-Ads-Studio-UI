export type LogicTemplateType =
  | "tapMonster"
  | "runnerGate"
  | "mergeCannon"
  | "gemCollector"
  | "introCta"
  | "endCard";

export type ObjectRole =
  | "none"
  | "playButton"
  | "replayButton"
  | "ctaButton"
  | "tapTarget"
  | "scoreText"
  | "timerText"
  | "player"
  | "enemy"
  | "obstacle"
  | "gate"
  | "collectible"
  | "cannon"
  | "mergeSlot"
  | "projectile"
  | "background"
  | "endCardPanel";

export type LogicActionTrigger =
  | "onClick"
  | "onTap"
  | "onDrag"
  | "onDrop"
  | "onCollision"
  | "onTimerEnd"
  | "onScoreReached"
  | "onSceneStart";

export type LogicActionType =
  | "addScore"
  | "addGems"
  | "subtractScore"
  | "goToScene"
  | "nextScene"
  | "showEndCard"
  | "replay"
  | "openUrl"
  | "randomizePosition"
  | "playAnimation"
  | "hideObject"
  | "showObject"
  | "spawnObject"
  | "damageTarget"
  | "mergeObject"
  | "applyGateEffect";

export type LogicConditionType =
  | "timerEnded"
  | "scoreReached"
  | "objectTapped"
  | "enemyDestroyed"
  | "playerDead"
  | "allTargetsCleared";

export type LogicOperator = "equals" | "notEquals" | "greaterThan" | "greaterThanOrEqual" | "lessThan" | "lessThanOrEqual";

export type LogicSettingValue = string | number | boolean | string[] | number[] | null;

export interface LogicScoreConfig {
  enabled: boolean;
  initialValue: number;
  targetValue: number;
  scoreObjectId?: string;
}

export interface LogicTimerConfig {
  enabled: boolean;
  duration: number;
  timerObjectId?: string;
  onCompleteAction?: LogicAction;
}

export interface LogicObjectRole {
  objectId: string;
  role: ObjectRole;
  settings: Record<string, LogicSettingValue>;
}

export interface LogicAction {
  id: string;
  trigger: LogicActionTrigger;
  type: LogicActionType;
  value?: LogicSettingValue;
  targetObjectId?: string;
  targetSceneId?: string;
}

export interface LogicCondition {
  type: LogicConditionType;
  operator: LogicOperator;
  value?: LogicSettingValue;
  nextAction?: LogicAction;
}

export interface LogicSceneFlow {
  introSceneId?: string;
  gameplaySceneId?: string;
  endCardSceneId?: string;
}

export interface PlayableLogicConfig {
  templateType: LogicTemplateType;
  score: LogicScoreConfig;
  timer: LogicTimerConfig;
  objectRoles: LogicObjectRole[];
  actions: LogicAction[];
  winCondition?: LogicCondition;
  loseCondition?: LogicCondition;
  sceneFlow: LogicSceneFlow;
  settings: Record<string, LogicSettingValue>;
}
