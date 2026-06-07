"use client";

import { Plus, Trash2 } from "lucide-react";
import type { LogicAction, LogicActionTrigger, LogicActionType } from "@/types/logic";
import type { PlayableProject } from "@/types/project";
import { useEditorStore } from "@/store/editorStore";

const triggerOptions: Array<[LogicActionTrigger, string]> = [
  ["onClick", "On Click"],
  ["onTap", "On Tap"],
  ["onDrag", "On Drag"],
  ["onDrop", "On Drop"],
  ["onCollision", "On Collision"],
  ["onTimerEnd", "On Timer End"],
  ["onScoreReached", "On Score Reached"],
  ["onSceneStart", "On Scene Start"]
];

const actionOptions: Array<[LogicActionType, string]> = [
  ["addScore", "Add Score"],
  ["addGems", "Add Gems"],
  ["subtractScore", "Subtract Score"],
  ["goToScene", "Go To Scene"],
  ["nextScene", "Next Scene"],
  ["showEndCard", "Show End Card"],
  ["replay", "Replay"],
  ["openUrl", "Open URL"],
  ["randomizePosition", "Randomize Position"],
  ["playAnimation", "Play Animation"],
  ["hideObject", "Hide Object"],
  ["showObject", "Show Object"],
  ["spawnObject", "Spawn Object"],
  ["damageTarget", "Damage Target"],
  ["mergeObject", "Merge Object"],
  ["applyGateEffect", "Apply Gate Effect"]
];

export function ActionBuilder({
  project,
  objectId
}: {
  project: PlayableProject;
  objectId?: string;
}) {
  const addLogicAction = useEditorStore((state) => state.addLogicAction);
  const updateLogicAction = useEditorStore((state) => state.updateLogicAction);
  const deleteLogicAction = useEditorStore((state) => state.deleteLogicAction);
  const actions = objectId
    ? project.logicConfig.actions.filter((action) => action.targetObjectId === objectId)
    : project.logicConfig.actions;

  function addAction() {
    addLogicAction({
      trigger: objectId ? "onClick" : "onTimerEnd",
      type: objectId ? "addScore" : "showEndCard",
      targetObjectId: objectId,
      targetSceneId: project.logicConfig.sceneFlow.endCardSceneId,
      value: objectId ? 1 : undefined
    });
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-950">Actions</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Actions are stored in the project logic config and are used by preview and export.
          </p>
        </div>
        <button
          type="button"
          onClick={addAction}
          className="inline-flex min-h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-black text-white"
        >
          <Plus className="size-4" aria-hidden />
          Add
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          No actions yet. Add one to make this object interactive.
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => (
            <article key={action.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-3">
                <SelectField
                  label="Trigger"
                  value={action.trigger}
                  onChange={(value) => updateLogicAction(action.id, { trigger: value as LogicActionTrigger })}
                  options={triggerOptions}
                />
                <SelectField
                  label="Action type"
                  value={action.type}
                  onChange={(value) => updateLogicAction(action.id, { type: value as LogicActionType })}
                  options={actionOptions}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Value"
                    value={action.value === undefined || action.value === null ? "" : String(action.value)}
                    onChange={(value) => updateLogicAction(action.id, { value: coerceValue(value) })}
                  />
                  <SelectField
                    label="Target scene"
                    value={action.targetSceneId ?? ""}
                    onChange={(value) => updateLogicAction(action.id, { targetSceneId: value || undefined })}
                    options={[["", "None"], ...project.scenes.map((scene) => [scene.id, scene.title] as [string, string])]}
                  />
                </div>
                <SelectField
                  label="Target object"
                  value={action.targetObjectId ?? ""}
                  onChange={(value) => updateLogicAction(action.id, { targetObjectId: value || undefined })}
                  options={[["", "None"], ...project.objects.map((object) => [object.id, object.name] as [string, string])]}
                />
              </div>
              <button
                type="button"
                onClick={() => deleteLogicAction(action.id)}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Delete Action
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function coerceValue(value: string) {
  if (value === "") {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && value.trim() !== "" ? numberValue : value;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField<TValue extends string>({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[TValue, string]>;
}) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <select className="studio-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
