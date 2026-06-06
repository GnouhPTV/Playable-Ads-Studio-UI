"use client";

import { BringToFront, Copy, Lock, SendToBack, Trash2, Unlock } from "lucide-react";
import type { EditorObject } from "@/types/project";
import { useEditorStore } from "@/store/editorStore";

export function ObjectToolbar({ object }: { object: EditorObject }) {
  const duplicateObject = useEditorStore((state) => state.duplicateObject);
  const deleteObject = useEditorStore((state) => state.deleteObject);
  const bringToFront = useEditorStore((state) => state.bringToFront);
  const sendToBack = useEditorStore((state) => state.sendToBack);
  const lockObject = useEditorStore((state) => state.lockObject);

  return (
    <div className="absolute -top-11 left-0 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-panel">
      <ToolButton label="Duplicate" onClick={() => duplicateObject(object.id)} icon={Copy} />
      <ToolButton label="Bring to front" onClick={() => bringToFront(object.id)} icon={BringToFront} />
      <ToolButton label="Send to back" onClick={() => sendToBack(object.id)} icon={SendToBack} />
      <ToolButton label={object.locked ? "Unlock" : "Lock"} onClick={() => lockObject(object.id)} icon={object.locked ? Unlock : Lock} />
      <ToolButton label="Delete" onClick={() => deleteObject(object.id)} icon={Trash2} danger />
    </div>
  );
}

function ToolButton({
  label,
  icon: Icon,
  onClick,
  danger = false
}: {
  label: string;
  icon: typeof Copy;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-md border transition ${
        danger
          ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
      }`}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
