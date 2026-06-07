"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Grid3X3, Maximize2, MousePointer2, Play, Ruler, ZoomIn } from "lucide-react";
import type { EditorAction, EditorObject, PlayableAsset } from "@/types/project";
import { CanvasObject } from "@/components/editor/CanvasObject";
import { SelectionBox } from "@/components/editor/SelectionBox";
import type { ResizeHandlePosition } from "@/components/editor/ResizeHandles";
import { PlayableRuntime } from "@/components/runtime/PlayableRuntime";
import { useEditorStore } from "@/store/editorStore";

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

type CanvasOperation =
  | {
      type: "drag";
      objectId: string;
      startX: number;
      startY: number;
      objectX: number;
      objectY: number;
    }
  | {
      type: "resize";
      objectId: string;
      handle: ResizeHandlePosition;
      startX: number;
      startY: number;
      object: EditorObject;
    }
  | {
      type: "rotate";
      objectId: string;
      centerX: number;
      centerY: number;
    };

export function DesignCanvas() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [operation, setOperation] = useState<CanvasOperation | null>(null);
  const [helper, setHelper] = useState("");
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const {
    project,
    currentSceneId,
    selectedObjectId,
    editorMode,
    objects,
    assets,
    setSelectedScene,
    selectObject,
    moveObject,
    resizeObject,
    rotateObject,
    addObject,
    deleteObject,
    duplicateObject,
    copyObject,
    pasteObject,
    undo,
    redo,
    setEditorMode
  } = useEditorStore();

  const scene = project?.scenes.find((item) => item.id === currentSceneId) ?? project?.scenes[0] ?? null;
  const sceneBackgroundAsset = scene?.backgroundImageAssetId
    ? assets.find((asset) => asset.id === scene.backgroundImageAssetId)
    : null;
  const sceneObjects = useMemo(
    () =>
      objects
        .filter((object) => object.sceneId === scene?.id)
        .sort((a, b) => a.zIndex - b.zIndex),
    [objects, scene?.id]
  );
  const selectedObject = sceneObjects.find((object) => object.id === selectedObjectId) ?? null;

  function pointerToCanvas(event: PointerEvent | React.PointerEvent) {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return { x: 0, y: 0 };
    }

    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT
    };
  }

  function startDrag(event: React.PointerEvent, object: EditorObject) {
    const pointer = pointerToCanvas(event);
    setOperation({
      type: "drag",
      objectId: object.id,
      startX: pointer.x,
      startY: pointer.y,
      objectX: object.x,
      objectY: object.y
    });
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function startResize(event: React.PointerEvent, handle: ResizeHandlePosition) {
    event.stopPropagation();

    if (!selectedObject) {
      return;
    }

    const pointer = pointerToCanvas(event);
    setOperation({
      type: "resize",
      objectId: selectedObject.id,
      handle,
      startX: pointer.x,
      startY: pointer.y,
      object: selectedObject
    });
  }

  function startRotate(event: React.PointerEvent) {
    event.stopPropagation();

    if (!selectedObject) {
      return;
    }

    setOperation({
      type: "rotate",
      objectId: selectedObject.id,
      centerX: selectedObject.x + selectedObject.width / 2,
      centerY: selectedObject.y + selectedObject.height / 2
    });
  }

  function runAction(action: EditorAction) {
    if (!project) {
      return;
    }

    if ((action.type === "nextScene" || action.type === "goToScene") && action.targetSceneId) {
      setSelectedScene(action.targetSceneId);
      return;
    }

    if (action.type === "nextScene") {
      const index = project.scenes.findIndex((item) => item.id === currentSceneId);
      const nextScene = project.scenes[Math.min(index + 1, project.scenes.length - 1)];

      if (nextScene) {
        setSelectedScene(nextScene.id);
      }
      return;
    }

    if (action.type === "startGame") {
      const gameplay = project.scenes.find((item) => item.type === "gameplay");

      if (gameplay) {
        setSelectedScene(gameplay.id);
      }
      return;
    }

    if (action.type === "replay") {
      setSelectedScene(project.scenes[0]?.id ?? currentSceneId ?? "");
      return;
    }

    if (action.type === "showEndCard") {
      const endCard = project.scenes.find((item) => item.type === "endCard");

      if (endCard) {
        setSelectedScene(endCard.id);
      }
      return;
    }

    if (action.type === "openUrl") {
      window.open(action.url || project.settings.ctaUrl || "#", "_blank", "noopener,noreferrer");
    }
  }

  function addAssetObject(asset: PlayableAsset, x: number, y: number) {
    if (asset.type === "audio") {
      addObject("audio", {
        x,
        y,
        width: 108,
        height: 48,
        name: asset.name,
        props: {
          assetId: asset.id,
          src: asset.dataUrl,
          volume: 0.8,
          loop: false,
          playOnSceneStart: false,
          playOnClick: true
        }
      });
      return;
    }

    if (asset.type === "video") {
      addObject("video", {
        x,
        y,
        width: 220,
        height: 180,
        name: asset.name,
        props: {
          assetId: asset.id,
          src: asset.dataUrl,
          fit: "cover",
          muted: true,
          loop: false,
          autoplay: true,
          controls: false,
          startTime: 0,
          endTime: 0
        }
      });
      return;
    }

    addObject(asset.type === "spriteSheet" ? "animatedSprite" : "image", {
      x,
      y,
      width: 132,
      height: 132,
      name: asset.name,
      props:
        asset.type === "spriteSheet"
          ? {
              assetId: asset.id,
              src: asset.dataUrl,
              frameWidth: 64,
              frameHeight: 64,
              frameCount: 4,
              fps: 8,
              loop: true,
              autoplay: true
            }
          : {
              assetId: asset.id,
              src: asset.dataUrl,
              fit: "contain",
              borderRadius: 10
            }
    });
  }

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!operation) {
        return;
      }

      const pointer = pointerToCanvas(event);

      if (operation.type === "drag") {
        const object = objects.find((item) => item.id === operation.objectId);

        if (!object) {
          return;
        }

        let x = operation.objectX + pointer.x - operation.startX;
        let y = operation.objectY + pointer.y - operation.startY;
        const nextGuides: { x?: number; y?: number } = {};

        if (Math.abs(x + object.width / 2 - CANVAS_WIDTH / 2) < 6) {
          x = CANVAS_WIDTH / 2 - object.width / 2;
          nextGuides.x = CANVAS_WIDTH / 2;
        }

        if (Math.abs(y + object.height / 2 - CANVAS_HEIGHT / 2) < 6) {
          y = CANVAS_HEIGHT / 2 - object.height / 2;
          nextGuides.y = CANVAS_HEIGHT / 2;
        }

        moveObject(operation.objectId, x, y);
        setGuides(nextGuides);
        setHelper(`x ${Math.round(x)} y ${Math.round(y)} w ${object.width} h ${object.height}`);
        return;
      }

      if (operation.type === "resize") {
        const dx = pointer.x - operation.startX;
        const dy = pointer.y - operation.startY;
        const base = operation.object;
        let x = base.x;
        let y = base.y;
        let width = base.width;
        let height = base.height;

        if (operation.handle.includes("e")) {
          width = base.width + dx;
        }

        if (operation.handle.includes("s")) {
          height = base.height + dy;
        }

        if (operation.handle.includes("w")) {
          width = base.width - dx;
          x = base.x + dx;
        }

        if (operation.handle.includes("n")) {
          height = base.height - dy;
          y = base.y + dy;
        }

        resizeObject(operation.objectId, width, height, x, y);
        setHelper(`x ${Math.round(x)} y ${Math.round(y)} w ${Math.round(width)} h ${Math.round(height)}`);
        return;
      }

      const angle = (Math.atan2(pointer.y - operation.centerY, pointer.x - operation.centerX) * 180) / Math.PI + 90;
      rotateObject(operation.objectId, angle);
      setHelper(`${Math.round(angle)} deg`);
    }

    function handlePointerUp() {
      setOperation(null);
      setHelper("");
      setGuides({});
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [moveObject, objects, operation, resizeObject, rotateObject]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT";

      if (isTyping) {
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && selectedObjectId) {
        event.preventDefault();
        deleteObject(selectedObjectId);
      }

      if (event.ctrlKey && event.key.toLowerCase() === "c" && selectedObjectId) {
        event.preventDefault();
        copyObject(selectedObjectId);
      }

      if (event.ctrlKey && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteObject();
      }

      if (event.ctrlKey && event.key.toLowerCase() === "d" && selectedObjectId) {
        event.preventDefault();
        duplicateObject(selectedObjectId);
      }

      if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }

      if (event.ctrlKey && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }

      if (selectedObject && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        const delta = event.shiftKey ? 10 : 1;
        const x = selectedObject.x + (event.key === "ArrowRight" ? delta : event.key === "ArrowLeft" ? -delta : 0);
        const y = selectedObject.y + (event.key === "ArrowDown" ? delta : event.key === "ArrowUp" ? -delta : 0);
        moveObject(selectedObject.id, x, y);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copyObject, deleteObject, duplicateObject, moveObject, pasteObject, redo, selectedObject, selectedObjectId, undo]);

  if (!project || !scene) {
    return <div className="grid h-full place-items-center text-sm text-studio-muted">No scene selected.</div>;
  }

  return (
    <section className="studio-panel flex min-h-[680px] flex-col rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-black text-slate-950">{scene.title}</h2>
          <p className="text-xs text-slate-500">Phone preview frame - 360 x 640 portrait</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEditorMode(editorMode === "design" ? "preview" : "design")}
            className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold ${
              editorMode === "preview"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {editorMode === "preview" ? <Play className="size-4" aria-hidden /> : <MousePointer2 className="size-4" aria-hidden />}
            {editorMode === "preview" ? "Preview Mode" : "Design Mode"}
          </button>
          <button
            type="button"
            onClick={() => setShowGrid((value) => !value)}
            className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold ${
              showGrid ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <Grid3X3 className="size-4" aria-hidden />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setShowSafeArea((value) => !value)}
            className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold ${
              showSafeArea ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <Ruler className="size-4" aria-hidden />
            Safe Area
          </button>
          {[0.5, 0.75, 1].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setZoom(value)}
              className={`min-h-9 rounded-md border px-3 text-xs font-bold ${
                zoom === value ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {Math.round(value * 100)}%
            </button>
          ))}
          <button
            type="button"
            onClick={() => setZoom(0.82)}
            className="grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600"
            title="Fit"
          >
            <Maximize2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div
        className="scrollbar-soft flex flex-1 items-start justify-center overflow-auto bg-[#eef3f8] p-6"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const assetId = event.dataTransfer.getData("application/playable-asset-id");
          const asset = assets.find((item) => item.id === assetId);
          const pointer = pointerToCanvas(event as unknown as React.PointerEvent);

          if (asset) {
            addAssetObject(asset, pointer.x - 66, pointer.y - 66);
          }
        }}
      >
        <div
          className="relative rounded-[38px] border border-slate-300 bg-gradient-to-b from-white to-slate-100 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
          style={{ width: CANVAS_WIDTH * zoom + 24, height: CANVAS_HEIGHT * zoom + 84 }}
        >
          <div
            ref={canvasRef}
            className="relative h-[640px] w-[360px] origin-top-left overflow-hidden rounded-[28px] border border-slate-300 bg-black shadow-inner"
            style={{
              transform: `scale(${zoom})`,
              background: scene.backgroundColor
            }}
            onPointerDown={() => {
              if (editorMode === "design") {
                selectObject(null);
              }
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[5000] flex h-9 items-center justify-between bg-slate-950/45 px-5 text-[10px] font-black text-white/85 backdrop-blur-sm">
              <span>9:41</span>
              <span className="absolute left-1/2 top-2.5 h-4 w-24 -translate-x-1/2 rounded-full bg-black/80 shadow-sm" />
              <span className="inline-flex items-center gap-1">
                <ZoomIn className="size-3" aria-hidden />
              {Math.round(zoom * 100)}%
              </span>
            </div>

            {sceneBackgroundAsset && editorMode === "design" ? (
              <img
                src={sceneBackgroundAsset.dataUrl}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            ) : null}

            {editorMode === "preview" ? (
              <PlayableRuntime
                key={`${project.id}-${project.updatedAt}`}
                project={project}
                className="absolute inset-0"
                onCta={(url) => window.open(url, "_blank", "noopener,noreferrer")}
              />
            ) : null}

            {showGrid && editorMode === "design" ? (
              <div
                className="pointer-events-none absolute inset-0 z-[50] opacity-35"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(14,165,233,.32) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,165,233,.32) 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }}
              />
            ) : null}

            {showSafeArea && editorMode === "design" ? (
              <div className="pointer-events-none absolute inset-x-5 bottom-8 top-12 z-[55] rounded-xl border border-dashed border-emerald-300/80" />
            ) : null}

            {editorMode === "design"
              ? sceneObjects.map((object) => (
                  <CanvasObject
                    key={object.id}
                    object={object}
                    assets={assets}
                    selected={selectedObjectId === object.id}
                    mode={editorMode}
                    onSelect={selectObject}
                    onDragStart={startDrag}
                    onAction={runAction}
                  />
                ))
              : null}

            {selectedObject && editorMode === "design" ? (
              <SelectionBox object={selectedObject} onResizeStart={startResize} onRotateStart={startRotate} />
            ) : null}

            {guides.x ? (
              <div className="pointer-events-none absolute top-0 z-[6000] h-full w-px bg-lime-300" style={{ left: guides.x }} />
            ) : null}
            {guides.y ? (
              <div className="pointer-events-none absolute left-0 z-[6000] h-px w-full bg-lime-300" style={{ top: guides.y }} />
            ) : null}
            {helper ? (
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-[7000] -translate-x-1/2 rounded-lg bg-zinc-950/90 px-3 py-1 text-xs font-bold text-white">
                {helper}
              </div>
            ) : null}
          </div>
          <div className="absolute bottom-4 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-slate-300" />
        </div>
      </div>
    </section>
  );
}
