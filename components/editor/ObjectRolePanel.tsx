"use client";

import type { EditorObject, PlayableProject } from "@/types/project";
import type { LogicObjectRole, ObjectRole } from "@/types/logic";
import { ActionBuilder } from "@/components/editor/ActionBuilder";
import { useEditorStore } from "@/store/editorStore";

const roleOptions: Array<[ObjectRole, string]> = [
  ["none", "None"],
  ["playButton", "Play Button"],
  ["replayButton", "Replay Button"],
  ["ctaButton", "CTA Button"],
  ["tapTarget", "Tap Target"],
  ["scoreText", "Score Text"],
  ["timerText", "Timer Text"],
  ["player", "Player"],
  ["enemy", "Enemy"],
  ["obstacle", "Obstacle"],
  ["gate", "Gate"],
  ["collectible", "Collectible"],
  ["cannon", "Cannon"],
  ["mergeSlot", "Merge Slot"],
  ["projectile", "Projectile"],
  ["background", "Background"],
  ["endCardPanel", "End Card Panel"]
];

const roleDescriptions: Record<ObjectRole, string> = {
  background: "Decorative or gameplay background layer.",
  cannon: "Merge Cannon object that can be dragged, merged, and used by auto-fire logic.",
  collectible: "Collectible target that adds score or gems when tapped.",
  ctaButton: "Final conversion button. In local builds this opens the configured placeholder URL.",
  enemy: "Enemy target for shooter/defense mechanics.",
  endCardPanel: "Visual panel shown on the final scene.",
  gate: "Runner gate that changes score when the player passes through it.",
  mergeSlot: "Drop/merge area for merge mechanics.",
  none: "No gameplay role. Object is visual only unless it has normal editor actions.",
  obstacle: "Runner or arcade obstacle.",
  playButton: "Starts the playable by moving from intro into gameplay.",
  player: "Player-controlled object for runner or drag mechanics.",
  projectile: "Projectile fired by cannon/shooter logic.",
  replayButton: "Restarts the playable from the intro scene.",
  scoreText: "Text object linked to runtime score state.",
  tapTarget: "Tap target that can add score, animate, and move after each tap.",
  timerText: "Text object linked to runtime countdown timer."
};

export function ObjectRolePanel({ project, object }: { project: PlayableProject; object: EditorObject }) {
  const setObjectRole = useEditorStore((state) => state.setObjectRole);
  const updateObjectRoleSettings = useEditorStore((state) => state.updateObjectRoleSettings);
  const updateLogicAction = useEditorStore((state) => state.updateLogicAction);
  const updateLogicSettings = useEditorStore((state) => state.updateLogicSettings);
  const role = project.logicConfig.objectRoles.find((item) => item.objectId === object.id) ?? {
    objectId: object.id,
    role: "none",
    settings: {}
  } satisfies LogicObjectRole;

  function updateSetting(key: string, value: string | number | boolean | null) {
    updateObjectRoleSettings(object.id, { [key]: value });

    if (role.role === "tapTarget") {
      if (key === "scorePerTap") {
        updateLogicSettings({ scorePerTap: value });
        const action = project.logicConfig.actions.find(
          (item) => item.targetObjectId === object.id && item.trigger === "onTap" && item.type === "addScore"
        );

        if (action) {
          updateLogicAction(action.id, { value });
        }
      }

      if (key === "randomizeAfterTap" || key === "randomArea" || key === "tapAnimation") {
        updateLogicSettings({ [key]: value });
      }
    }
  }

  function handleRoleChange(nextRole: ObjectRole) {
    setObjectRole(object.id, nextRole);
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-sm font-black text-slate-950">Playable Role</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Roles connect visual objects to gameplay logic. Preview and export both read these roles.
        </p>
      </div>

      <SelectField
        label="Role"
        value={role.role}
        onChange={(value) => handleRoleChange(value as ObjectRole)}
        options={roleOptions}
      />

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
        {roleDescriptions[role.role]}
      </div>

      <RoleSettings role={role} onChange={updateSetting} />
      <ActionBuilder project={project} objectId={object.id} />
    </section>
  );
}

function RoleSettings({
  role,
  onChange
}: {
  role: LogicObjectRole;
  onChange: (key: string, value: string | number | boolean | null) => void;
}) {
  if (role.role === "tapTarget") {
    return (
      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <NumberField label="Score per tap" value={numberSetting(role, "scorePerTap", 1)} onChange={(value) => onChange("scorePerTap", value)} />
        <CheckboxField label="Random move after tap" checked={booleanSetting(role, "randomizeAfterTap", true)} onChange={(value) => onChange("randomizeAfterTap", value)} />
        <SelectField
          label="Random area"
          value={stringSetting(role, "randomArea", "safeArea")}
          onChange={(value) => onChange("randomArea", value)}
          options={[
            ["fullScreen", "Full screen"],
            ["safeArea", "Safe area"],
            ["custom", "Custom"]
          ]}
        />
        <SelectField
          label="Tap animation"
          value={stringSetting(role, "tapAnimation", "pop")}
          onChange={(value) => onChange("tapAnimation", value)}
          options={[
            ["pop", "Pop"],
            ["shake", "Shake"],
            ["pulse", "Pulse"],
            ["fade", "Fade"]
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Respawn delay" value={numberSetting(role, "respawnDelay", 0)} onChange={(value) => onChange("respawnDelay", value)} />
          <NumberField label="Max taps" value={numberSetting(role, "maxTaps", 0)} onChange={(value) => onChange("maxTaps", value)} />
        </div>
        <CheckboxField label="Visible at scene start" checked={booleanSetting(role, "visibleAtSceneStart", true)} onChange={(value) => onChange("visibleAtSceneStart", value)} />
      </div>
    );
  }

  if (role.role === "scoreText") {
    return (
      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <TextField label="Prefix" value={stringSetting(role, "prefix", "Score")} onChange={(value) => onChange("prefix", value)} />
        <CheckboxField label="Final score display" checked={booleanSetting(role, "finalScore", false)} onChange={(value) => onChange("finalScore", value)} />
      </div>
    );
  }

  if (role.role === "timerText") {
    return (
      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <SelectField
          label="Format"
          value={stringSetting(role, "format", "30s")}
          onChange={(value) => onChange("format", value)}
          options={[
            ["30s", "30s"],
            ["00:30", "00:30"]
          ]}
        />
        <CheckboxField label="Linked to game timer" checked={booleanSetting(role, "linkedToTimer", true)} onChange={(value) => onChange("linkedToTimer", value)} />
      </div>
    );
  }

  if (role.role === "collectible" || role.role === "gate" || role.role === "cannon") {
    return (
      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <NumberField label={role.role === "cannon" ? "Level" : "Value"} value={numberSetting(role, role.role === "cannon" ? "level" : "value", 1)} onChange={(value) => onChange(role.role === "cannon" ? "level" : "value", value)} />
      </div>
    );
  }

  return null;
}

function numberSetting(role: LogicObjectRole, key: string, fallback: number) {
  const value = role.settings[key];
  return typeof value === "number" ? value : fallback;
}

function stringSetting(role: LogicObjectRole, key: string, fallback: string) {
  const value = role.settings[key];
  return typeof value === "string" ? value : fallback;
}

function booleanSetting(role: LogicObjectRole, key: string, fallback: boolean) {
  const value = role.settings[key];
  return typeof value === "boolean" ? value : fallback;
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
