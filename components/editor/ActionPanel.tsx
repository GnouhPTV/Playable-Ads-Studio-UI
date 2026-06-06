"use client";

import type { ButtonObjectProps, EditorAction, EditorObject } from "@/types/project";
import { useEditorStore } from "@/store/editorStore";

export function ActionPanel({ object }: { object: EditorObject }) {
  const project = useEditorStore((state) => state.project);
  const updateObject = useEditorStore((state) => state.updateObject);
  const action = object.actions[0] ?? { type: "none" };
  const isClickable = object.type === "button" || object.type === "ctaButton";

  function updateAction(patch: Partial<EditorAction>) {
    const nextAction: EditorAction = { ...action, ...patch };
    const nextPatch: Partial<EditorObject> = { actions: [nextAction] };

    if (isClickable) {
      nextPatch.props = {
        ...(object.props as ButtonObjectProps),
        action: nextAction
      };
    }

    updateObject(object.id, nextPatch);
  }

  if (!isClickable) {
    return (
      <section className="rounded-lg border border-white/8 bg-white/[0.035] p-4 text-xs leading-5 text-studio-muted">
        Actions are mainly for buttons and CTA buttons in this MVP.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/8 bg-white/[0.035] p-4">
      <h3 className="text-sm font-black text-white">Action</h3>
      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="studio-label">Click action</span>
          <select
            className="studio-input"
            value={action.type}
            onChange={(event) => updateAction({ type: event.target.value as EditorAction["type"] })}
          >
            <option value="none">none</option>
            <option value="nextScene">go to next scene</option>
            <option value="startGame">start game</option>
            <option value="openUrl">open CTA URL</option>
            <option value="replay">replay</option>
          </select>
        </label>

        {action.type === "nextScene" ? (
          <label className="block">
            <span className="studio-label">Target scene</span>
            <select
              className="studio-input"
              value={action.targetSceneId ?? ""}
              onChange={(event) => updateAction({ targetSceneId: event.target.value })}
            >
              <option value="">Choose scene</option>
              {project?.scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {action.type === "openUrl" ? (
          <label className="block">
            <span className="studio-label">URL</span>
            <input
              className="studio-input"
              value={action.url ?? project?.settings.ctaUrl ?? ""}
              onChange={(event) => updateAction({ url: event.target.value })}
            />
          </label>
        ) : null}

        {object.type === "ctaButton" ? (
          <div className="rounded-lg border border-amber-300/18 bg-amber-300/8 p-3 text-xs leading-5 text-amber-100">
            Real ad networks may require MRAID or network-specific CTA handling.
          </div>
        ) : null}
      </div>
    </section>
  );
}
