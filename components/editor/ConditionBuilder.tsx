"use client";

import type { LogicCondition, LogicConditionType, LogicOperator } from "@/types/logic";
import type { PlayableProject } from "@/types/project";
import { useEditorStore } from "@/store/editorStore";

const conditionTypes: Array<[LogicConditionType, string]> = [
  ["timerEnded", "Timer Ended"],
  ["scoreReached", "Score Reached"],
  ["objectTapped", "Object Tapped"],
  ["enemyDestroyed", "Enemy Destroyed"],
  ["playerDead", "Player Dead"],
  ["allTargetsCleared", "All Targets Cleared"]
];

const operators: Array<[LogicOperator, string]> = [
  ["equals", "Equals"],
  ["notEquals", "Not Equals"],
  ["greaterThan", "Greater Than"],
  ["greaterThanOrEqual", "Greater Than Or Equal"],
  ["lessThan", "Less Than"],
  ["lessThanOrEqual", "Less Than Or Equal"]
];

export function ConditionBuilder({ project }: { project: PlayableProject }) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-black text-slate-950">Conditions</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Conditions describe when a playable should win, lose, or move to an end card.
        </p>
      </div>
      <ConditionEditor project={project} kind="winCondition" label="Win condition" />
      <ConditionEditor project={project} kind="loseCondition" label="Lose condition" />
    </section>
  );
}

function ConditionEditor({
  project,
  kind,
  label
}: {
  project: PlayableProject;
  kind: "winCondition" | "loseCondition";
  label: string;
}) {
  const updateLogicConfig = useEditorStore((state) => state.updateLogicConfig);
  const condition =
    project.logicConfig[kind] ??
    ({
      type: kind === "winCondition" ? "scoreReached" : "timerEnded",
      operator: kind === "winCondition" ? "greaterThanOrEqual" : "equals",
      value: kind === "winCondition" ? project.logicConfig.score.targetValue : 0
    } satisfies LogicCondition);

  function updateCondition(patch: Partial<LogicCondition>) {
    updateLogicConfig({
      [kind]: {
        ...condition,
        ...patch
      }
    } as Partial<typeof project.logicConfig>);
  }

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 text-xs font-black uppercase text-slate-600">{label}</div>
      <div className="grid gap-3 md:grid-cols-3">
        <SelectField
          label="Type"
          value={condition.type}
          onChange={(value) => updateCondition({ type: value as LogicConditionType })}
          options={conditionTypes}
        />
        <SelectField
          label="Operator"
          value={condition.operator}
          onChange={(value) => updateCondition({ operator: value as LogicOperator })}
          options={operators}
        />
        <TextField
          label="Value"
          value={condition.value === undefined || condition.value === null ? "" : String(condition.value)}
          onChange={(value) => updateCondition({ value: coerceValue(value) })}
        />
      </div>
    </div>
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
