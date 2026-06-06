"use client";

import type { EditorObject } from "@/types/project";
import { ObjectToolbar } from "@/components/editor/ObjectToolbar";
import { ResizeHandles, type ResizeHandlePosition } from "@/components/editor/ResizeHandles";
import { RotateHandle } from "@/components/editor/RotateHandle";

export function SelectionBox({
  object,
  onResizeStart,
  onRotateStart
}: {
  object: EditorObject;
  onResizeStart: (event: React.PointerEvent, handle: ResizeHandlePosition) => void;
  onRotateStart: (event: React.PointerEvent) => void;
}) {
  return (
    <div
      className="pointer-events-none absolute border border-blue-500 shadow-[0_0_0_1px_rgba(37,99,235,0.18)]"
      style={{
        left: object.x,
        top: object.y,
        width: object.width,
        height: object.height,
        zIndex: object.zIndex + 1000,
        transform: `rotate(${object.rotation}deg)`,
        transformOrigin: "center"
      }}
    >
      <div className="pointer-events-auto">
        <ObjectToolbar object={object} />
        {!object.locked ? (
          <>
            <ResizeHandles onResizeStart={onResizeStart} />
            <RotateHandle onRotateStart={onRotateStart} />
          </>
        ) : null}
      </div>
    </div>
  );
}
