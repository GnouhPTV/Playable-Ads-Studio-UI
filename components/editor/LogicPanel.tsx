"use client";

import type { PlayableProject } from "@/types/project";
import { ActionBuilder } from "@/components/editor/ActionBuilder";
import { ConditionBuilder } from "@/components/editor/ConditionBuilder";
import { useEditorStore } from "@/store/editorStore";

export function LogicPanel({ project }: { project: PlayableProject }) {
  const updateLogicConfig = useEditorStore((state) => state.updateLogicConfig);
  const updateLogicSettings = useEditorStore((state) => state.updateLogicSettings);
  const updateLogicAction = useEditorStore((state) => state.updateLogicAction);
  const updateObjectRoleSettings = useEditorStore((state) => state.updateObjectRoleSettings);
  const tapTargetRole = project.logicConfig.objectRoles.find((role) => role.role === "tapTarget");

  function updateTimerDuration(duration: number) {
    updateLogicConfig({
      timer: {
        ...project.logicConfig.timer,
        duration
      }
    });
  }

  function updateTargetScore(targetValue: number) {
    updateLogicConfig({
      score: {
        ...project.logicConfig.score,
        targetValue
      }
    });
  }

  function updateTapSetting(key: string, value: string | number | boolean) {
    updateLogicSettings({ [key]: value });

    if (tapTargetRole) {
      updateObjectRoleSettings(tapTargetRole.objectId, { [key]: value });
      if (key === "scorePerTap") {
        const action = project.logicConfig.actions.find(
          (item) => item.targetObjectId === tapTargetRole.objectId && item.trigger === "onTap" && item.type === "addScore"
        );

        if (action) {
          updateLogicAction(action.id, { value });
        }
      }
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-3">
        <SettingsCard title="Core State">
          <NumberField label="Duration" value={project.logicConfig.timer.duration} onChange={updateTimerDuration} />
          <NumberField label="Target score" value={project.logicConfig.score.targetValue} onChange={updateTargetScore} />
          <CheckboxField
            label="Score enabled"
            checked={project.logicConfig.score.enabled}
            onChange={(value) => updateLogicConfig({ score: { ...project.logicConfig.score, enabled: value } })}
          />
          <CheckboxField
            label="Timer enabled"
            checked={project.logicConfig.timer.enabled}
            onChange={(value) => updateLogicConfig({ timer: { ...project.logicConfig.timer, enabled: value } })}
          />
        </SettingsCard>

        {project.logicConfig.templateType === "tapMonster" ? (
          <SettingsCard title="Tap Monster">
            <NumberField label="Score per tap" value={numberSetting(project, "scorePerTap", 1)} onChange={(value) => updateTapSetting("scorePerTap", value)} />
            <CheckboxField label="Random movement" checked={booleanSetting(project, "randomizeAfterTap", true)} onChange={(value) => updateTapSetting("randomizeAfterTap", value)} />
            <SelectField
              label="Random area"
              value={stringSetting(project, "randomArea", "safeArea")}
              onChange={(value) => updateTapSetting("randomArea", value)}
              options={[
                ["fullScreen", "Full screen"],
                ["safeArea", "Safe area"],
                ["custom", "Custom"]
              ]}
            />
            <SelectField
              label="Tap animation"
              value={stringSetting(project, "tapAnimation", "pop")}
              onChange={(value) => updateTapSetting("tapAnimation", value)}
              options={[
                ["pop", "Pop"],
                ["shake", "Shake"],
                ["pulse", "Pulse"],
                ["fade", "Fade"]
              ]}
            />
          </SettingsCard>
        ) : null}

        {project.logicConfig.templateType === "runnerGate" ? (
          <SettingsCard title="Runner Gate">
            <NumberField label="Player speed" value={numberSetting(project, "playerSpeed", 1)} onChange={(value) => updateLogicSettings({ playerSpeed: value })} />
            <NumberField label="Lane count" value={numberSetting(project, "laneCount", 3)} onChange={(value) => updateLogicSettings({ laneCount: value })} />
            <TextField label="Gate values" value={arraySetting(project, "gateValues", [10, 2, -5]).join(", ")} onChange={(value) => updateLogicSettings({ gateValues: parseNumberList(value) })} />
            <NumberField label="Gem reward" value={numberSetting(project, "gemReward", 5)} onChange={(value) => updateLogicSettings({ gemReward: value })} />
          </SettingsCard>
        ) : null}

        {project.logicConfig.templateType === "mergeCannon" ? (
          <SettingsCard title="Merge Cannon">
            <NumberField label="Enemy spawn rate" value={numberSetting(project, "enemySpawnRate", 2.2)} onChange={(value) => updateLogicSettings({ enemySpawnRate: value })} />
            <NumberField label="Cannon damage" value={numberSetting(project, "cannonDamage", 1)} onChange={(value) => updateLogicSettings({ cannonDamage: value })} />
            <NumberField label="Fire rate" value={numberSetting(project, "fireRate", 1.1)} onChange={(value) => updateLogicSettings({ fireRate: value })} />
            <NumberField label="Merge max level" value={numberSetting(project, "mergeLevelLimit", 4)} onChange={(value) => updateLogicSettings({ mergeLevelLimit: value })} />
          </SettingsCard>
        ) : null}

        {project.logicConfig.templateType === "gemCollector" ? (
          <SettingsCard title="Gem Collector">
            <NumberField label="Gem count" value={numberSetting(project, "gemCount", 5)} onChange={(value) => updateLogicSettings({ gemCount: value })} />
            <NumberField label="Gem value" value={numberSetting(project, "gemValue", 5)} onChange={(value) => updateLogicSettings({ gemValue: value })} />
            <NumberField label="Target score" value={project.logicConfig.score.targetValue} onChange={updateTargetScore} />
            <CheckboxField label="Respawn gems" checked={booleanSetting(project, "respawnOnTap", true)} onChange={(value) => updateLogicSettings({ respawnOnTap: value })} />
          </SettingsCard>
        ) : null}

        {(project.logicConfig.templateType === "introCta" || project.logicConfig.templateType === "endCard") ? (
          <SettingsCard title="Flow Copy">
            <TextField label="CTA text" value={String(project.logicConfig.settings.ctaText ?? project.settings.ctaText)} onChange={(value) => updateLogicSettings({ ctaText: value })} />
            <TextField label="CTA URL" value={String(project.logicConfig.settings.ctaUrl ?? project.settings.ctaUrl)} onChange={(value) => updateLogicSettings({ ctaUrl: value })} />
            <TextField label="End title" value={String(project.logicConfig.settings.endCardTitle ?? project.settings.endCardTitle)} onChange={(value) => updateLogicSettings({ endCardTitle: value })} />
          </SettingsCard>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ConditionBuilder project={project} />
        <ActionBuilder project={project} />
      </div>
    </section>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

function numberSetting(project: PlayableProject, key: string, fallback: number) {
  const value = project.logicConfig.settings[key];
  return typeof value === "number" ? value : fallback;
}

function stringSetting(project: PlayableProject, key: string, fallback: string) {
  const value = project.logicConfig.settings[key];
  return typeof value === "string" ? value : fallback;
}

function booleanSetting(project: PlayableProject, key: string, fallback: boolean) {
  const value = project.logicConfig.settings[key];
  return typeof value === "boolean" ? value : fallback;
}

function arraySetting(project: PlayableProject, key: string, fallback: number[]) {
  const value = project.logicConfig.settings[key];
  return Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : fallback;
}

function parseNumberList(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter(Number.isFinite);
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input className="studio-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="studio-label">{label}</span>
      <input type="number" className="studio-input" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
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
