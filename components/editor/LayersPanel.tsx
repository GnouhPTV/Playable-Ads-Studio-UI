"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Lock, Trash2, Unlock } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

export function LayersPanel({ embedded = false }: { embedded?: boolean }) {
  const project = useEditorStore((state) => state.project);
  const currentSceneId = useEditorStore((state) => state.currentSceneId);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const selectObject = useEditorStore((state) => state.selectObject);
  const updateObject = useEditorStore((state) => state.updateObject);
  const hideObject = useEditorStore((state) => state.hideObject);
  const lockObject = useEditorStore((state) => state.lockObject);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);
  const deleteObject = useEditorStore((state) => state.deleteObject);

  const layers =
    project?.objects
      .filter((object) => object.sceneId === currentSceneId)
      .sort((a, b) => b.zIndex - a.zIndex) ?? [];

  return (
    <section className={embedded ? "" : "studio-panel rounded-lg p-4"}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-slate-950">Layers</h2>
          <p className="mt-1 text-xs text-slate-500">Top layer is rendered first in this list.</p>
        </div>
      </div>

      {layers.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          No objects in this scene yet.
        </div>
      ) : (
        <div className="grid max-h-52 gap-2 overflow-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
          {layers.map((object) => {
            const active = object.id === selectedObjectId;

            return (
              <article
                key={object.id}
                className={`rounded-md border p-2 ${
                  active ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectObject(object.id)}
                  className="mb-2 block w-full text-left text-[10px] font-black uppercase tracking-normal text-slate-500"
                >
                  {object.type} - z{object.zIndex}
                </button>
                <input
                  value={object.name}
                  onChange={(event) => updateObject(object.id, { name: event.target.value })}
                  className="studio-input py-2 text-xs font-bold"
                  aria-label="Layer name"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  <IconButton label="Toggle visibility" onClick={() => hideObject(object.id)} icon={object.hidden ? EyeOff : Eye} />
                  <IconButton label="Toggle lock" onClick={() => lockObject(object.id)} icon={object.locked ? Lock : Unlock} />
                  <IconButton label="Move layer up" onClick={() => bringForward(object.id)} icon={ArrowUp} />
                  <IconButton label="Move layer down" onClick={() => sendBackward(object.id)} icon={ArrowDown} />
                  <IconButton label="Delete layer" onClick={() => deleteObject(object.id)} icon={Trash2} danger />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  danger = false
}: {
  label: string;
  icon: typeof Eye;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-md border ${
        danger
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
      }`}
    >
      <Icon className="size-3.5" aria-hidden />
    </button>
  );
}
