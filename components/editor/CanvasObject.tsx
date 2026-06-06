"use client";

import { Music2 } from "lucide-react";
import type {
  AudioObjectProps,
  ButtonObjectProps,
  EditorAction,
  EditorMode,
  EditorObject,
  ImageObjectProps,
  PlayableAsset,
  ShapeObjectProps,
  TextObjectProps
} from "@/types/project";

interface CanvasObjectProps {
  object: EditorObject;
  assets: PlayableAsset[];
  selected: boolean;
  mode: EditorMode;
  onSelect: (objectId: string) => void;
  onDragStart: (event: React.PointerEvent, object: EditorObject) => void;
  onAction: (action: EditorAction) => void;
}

export function CanvasObject({
  object,
  assets,
  selected,
  mode,
  onSelect,
  onDragStart,
  onAction
}: CanvasObjectProps) {
  if (object.hidden) {
    return null;
  }

  const className = object.animations
    .filter((animation) => animation !== "none")
    .map((animation) => `animate-${animation}`)
    .join(" ");
  const style: React.CSSProperties = {
    position: "absolute",
    left: object.x,
    top: object.y,
    width: object.width,
    height: object.height,
    opacity: object.opacity,
    zIndex: object.zIndex,
    transform: `rotate(${object.rotation}deg)`,
    transformOrigin: "center",
    pointerEvents: mode === "preview" && (object.type === "button" || object.type === "ctaButton" || object.type === "audio") ? "auto" : "auto",
    cursor: mode === "design" ? (object.locked ? "not-allowed" : "move") : "default"
  };

  function handlePointerDown(event: React.PointerEvent) {
    event.stopPropagation();

    if (mode === "preview") {
      return;
    }

    onSelect(object.id);

    if (!object.locked) {
      onDragStart(event, object);
    }
  }

  return (
    <div
      data-object-id={object.id}
      className={`select-none ${className} ${selected ? "ring-1 ring-cyan-300/30" : ""}`}
      style={style}
      onPointerDown={handlePointerDown}
    >
      {renderObject(object, assets, mode, onAction)}
    </div>
  );
}

function renderObject(
  object: EditorObject,
  assets: PlayableAsset[],
  mode: EditorMode,
  onAction: (action: EditorAction) => void
) {
  if (object.type === "text") {
    const props = object.props as TextObjectProps;

    return (
      <div
        className="flex h-full w-full items-center"
        style={{
          color: props.color,
          fontSize: props.fontSize,
          fontWeight: props.fontWeight,
          justifyContent: props.align === "left" ? "flex-start" : props.align === "right" ? "flex-end" : "center",
          textAlign: props.align,
          textShadow: props.shadow ? "0 8px 18px rgba(0,0,0,0.45)" : "none",
          WebkitTextStroke: props.strokeWidth ? `${props.strokeWidth}px ${props.strokeColor}` : undefined,
          lineHeight: 1.05,
          overflow: "hidden"
        }}
      >
        {props.text}
      </div>
    );
  }

  if (object.type === "image" || object.type === "background") {
    const props = object.props as ImageObjectProps | ShapeObjectProps;

    if ("src" in props) {
      const asset = props.assetId ? assets.find((item) => item.id === props.assetId) : null;
      const src = props.src || asset?.dataUrl;

      if (src) {
        return (
          <img
            src={src}
            alt=""
            className="h-full w-full"
            draggable={false}
            style={{
              objectFit: props.fit === "stretch" ? "fill" : props.fit,
              borderRadius: props.borderRadius
            }}
          />
        );
      }
    }

    if ("shape" in props) {
      return (
        <div
          className="h-full w-full"
          style={{
            background: props.fillColor,
            border: `${props.strokeWidth}px solid ${props.strokeColor}`,
            borderRadius: props.shape === "circle" ? "999px" : props.shape === "roundedRectangle" ? 18 : 0
          }}
        />
      );
    }

    return <Placeholder label={object.type === "background" ? "Background" : "Image"} />;
  }

  if (object.type === "button" || object.type === "ctaButton") {
    const props = object.props as ButtonObjectProps;
    const action = props.action?.type ? props.action : object.actions[0];

    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();

          if (mode === "preview") {
            onAction(action);
          }
        }}
        className="h-full w-full font-black shadow-lg transition hover:brightness-110"
        style={{
          background: props.backgroundColor,
          color: props.textColor,
          borderRadius: props.borderRadius
        }}
      >
        {props.label}
      </button>
    );
  }

  if (object.type === "shape") {
    const props = object.props as ShapeObjectProps;

    return (
      <div
        className="h-full w-full"
        style={{
          background: props.fillColor,
          border: `${props.strokeWidth}px solid ${props.strokeColor}`,
          borderRadius: props.shape === "circle" ? "999px" : props.shape === "roundedRectangle" ? 18 : 0
        }}
      />
    );
  }

  if (object.type === "animatedSprite") {
    const props = object.props as ImageObjectProps;
    const asset = props.assetId ? assets.find((item) => item.id === props.assetId) : null;
    const src = props.src || asset?.dataUrl;

    return src ? (
      <img src={src} alt="" draggable={false} className="h-full w-full object-contain" />
    ) : (
      <Placeholder label="Sprite" />
    );
  }

  const props = object.props as AudioObjectProps;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();

        if (mode === "preview" && props.playOnClick && props.src) {
          const audio = new Audio(props.src);
          audio.volume = props.volume;
          audio.loop = props.loop;
          void audio.play();
        }
      }}
      className="flex h-full w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/12 text-xs font-black text-cyan-100"
    >
      <Music2 className="size-4" aria-hidden />
      Audio
    </button>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="grid h-full w-full place-items-center rounded-lg border border-dashed border-white/18 bg-white/8 text-xs font-black text-white/70">
      {label}
    </div>
  );
}
