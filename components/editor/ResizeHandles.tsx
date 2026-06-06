"use client";

export type ResizeHandlePosition = "nw" | "ne" | "sw" | "se";

const handleClass =
  "absolute size-3 rounded-full border border-white bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.18)]";

export function ResizeHandles({
  onResizeStart
}: {
  onResizeStart: (event: React.PointerEvent, handle: ResizeHandlePosition) => void;
}) {
  return (
    <>
      <button
        type="button"
        className={`${handleClass} -left-1.5 -top-1.5 cursor-nwse-resize`}
        onPointerDown={(event) => onResizeStart(event, "nw")}
        aria-label="Resize top left"
      />
      <button
        type="button"
        className={`${handleClass} -right-1.5 -top-1.5 cursor-nesw-resize`}
        onPointerDown={(event) => onResizeStart(event, "ne")}
        aria-label="Resize top right"
      />
      <button
        type="button"
        className={`${handleClass} -bottom-1.5 -left-1.5 cursor-nesw-resize`}
        onPointerDown={(event) => onResizeStart(event, "sw")}
        aria-label="Resize bottom left"
      />
      <button
        type="button"
        className={`${handleClass} -bottom-1.5 -right-1.5 cursor-nwse-resize`}
        onPointerDown={(event) => onResizeStart(event, "se")}
        aria-label="Resize bottom right"
      />
    </>
  );
}
