import type { EditorObject, PlayableProject } from "@/types/project";
import type { LogicAction, LogicActionTrigger, LogicObjectRole, ObjectRole, PlayableLogicConfig } from "@/types/logic";

export function getObjectRole(logicConfig: PlayableLogicConfig, objectId: string): LogicObjectRole | null {
  return logicConfig.objectRoles.find((role) => role.objectId === objectId) ?? null;
}

export function getRoleName(logicConfig: PlayableLogicConfig, objectId: string): ObjectRole {
  return getObjectRole(logicConfig, objectId)?.role ?? "none";
}

export function getObjectsByRole(project: PlayableProject, role: ObjectRole): EditorObject[] {
  const roleIds = new Set(
    project.logicConfig.objectRoles
      .filter((item) => item.role === role)
      .map((item) => item.objectId)
  );

  return project.objects.filter((object) => roleIds.has(object.id));
}

export function getObjectByRole(project: PlayableProject, role: ObjectRole): EditorObject | null {
  return getObjectsByRole(project, role)[0] ?? null;
}

export function getRoleForObject(project: PlayableProject, objectId: string) {
  return project.logicConfig.objectRoles.find((item) => item.objectId === objectId) ?? null;
}

export function getActionsForObject(
  logicConfig: PlayableLogicConfig,
  objectId: string,
  trigger?: LogicActionTrigger
): LogicAction[] {
  return logicConfig.actions.filter((action) => {
    if (action.targetObjectId !== objectId) {
      return false;
    }

    return trigger ? action.trigger === trigger : true;
  });
}

export function getActionsByTrigger(logicConfig: PlayableLogicConfig, trigger: LogicActionTrigger): LogicAction[] {
  return logicConfig.actions.filter((action) => action.trigger === trigger);
}

export function getLogicNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function getLogicString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

export function getLogicBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function getRoleNumber(role: LogicObjectRole | null, key: string, fallback: number) {
  return getLogicNumber(role?.settings[key], fallback);
}

export function getRoleString(role: LogicObjectRole | null, key: string, fallback: string) {
  return getLogicString(role?.settings[key], fallback);
}

export function getRoleBoolean(role: LogicObjectRole | null, key: string, fallback: boolean) {
  return getLogicBoolean(role?.settings[key], fallback);
}

export function getTemplateDuration(project: PlayableProject) {
  return project.logicConfig.timer.enabled
    ? project.logicConfig.timer.duration
    : project.settings.duration;
}
