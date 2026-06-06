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
    <div className="absolute -top-11 left-0 flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-950/96 p-1 shadow-panel">
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
          ? "border-rose-300/18 bg-rose-400/10 text-rose-200 hover:border-rose-200/40"
          : "border-white/8 bg-white/6 text-studio-muted hover:text-white"
      }`}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}
