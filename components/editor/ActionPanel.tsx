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
      <section className="rounded-lg border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
        Actions are mainly for buttons and CTA buttons in this MVP.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-black text-slate-950">Action</h3>
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
            <option value="goToScene">go to specific scene</option>
            <option value="startGame">start game</option>
            <option value="showEndCard">show end card</option>
            <option value="openUrl">open CTA URL</option>
            <option value="replay">replay</option>
          </select>
        </label>

        {action.type === "nextScene" || action.type === "goToScene" ? (
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
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Real ad networks may require MRAID or network-specific CTA handling.
          </div>
        ) : null}
      </div>
    </section>
  );
}
