"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Music2, Video } from "lucide-react";
import type {
  AudioObjectProps,
  ButtonObjectProps,
  EditorAction,
  EditorObject,
  ImageObjectProps,
  PlayableAsset,
  PlayableProject,
  ShapeObjectProps,
  TextObjectProps,
  VideoObjectProps
} from "@/types/project";
import { getRuntimeAnimationClass, getRuntimeObjectStyle } from "@/lib/runtime/runtimeAnimations";

interface RuntimeObjectProps {
  object: EditorObject;
  project: PlayableProject;
  onAction: (action?: EditorAction) => void;
  onLogicAction?: () => void;
}

export function RuntimeObject({ object, project, onAction, onLogicAction }: RuntimeObjectProps) {
  if (object.hidden) {
    return null;
  }

  const action = getObjectAction(object);
  const clickable = Boolean(onLogicAction) || (action && action.type !== "none");

  return (
    <div
      className={`select-none ${getRuntimeAnimationClass(object.animations)}`}
      style={{
        ...getRuntimeObjectStyle(object),
        pointerEvents: clickable || object.type === "audio" || object.type === "video" ? "auto" : "none",
        cursor: clickable ? "pointer" : "default"
      }}
      onClick={(event) => {
        if (!clickable || object.type === "button" || object.type === "ctaButton") {
          return;
        }

        event.stopPropagation();
        if (onLogicAction) {
          onLogicAction();
        } else {
          onAction(action);
        }
      }}
    >
      {renderRuntimeObject(object, project.assets, onAction, onLogicAction)}
    </div>
  );
}

function getObjectAction(object: EditorObject) {
  if (object.type === "button" || object.type === "ctaButton") {
    return (object.props as ButtonObjectProps).action ?? object.actions[0];
  }

  return object.actions[0];
}

function renderRuntimeObject(
  object: EditorObject,
  assets: PlayableAsset[],
  onAction: (action?: EditorAction) => void,
  onLogicAction?: () => void
) {
  if (object.type === "text") {
    const props = object.props as TextObjectProps;

    return (
      <div
        className="flex h-full w-full items-center whitespace-pre-wrap"
        style={{
          color: props.color,
          fontSize: props.fontSize,
          fontWeight: props.fontWeight,
          justifyContent: props.align === "left" ? "flex-start" : props.align === "right" ? "flex-end" : "center",
          lineHeight: 1.05,
          overflow: "hidden",
          textAlign: props.align,
          textShadow: props.shadow ? "0 8px 18px rgba(0,0,0,0.45)" : "none",
          WebkitTextStroke: props.strokeWidth ? `${props.strokeWidth}px ${props.strokeColor}` : undefined
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

      return src ? (
        <img
          src={src}
          alt=""
          draggable={false}
          className="h-full w-full"
          style={{
            borderRadius: props.borderRadius,
            objectFit: props.fit === "stretch" ? "fill" : props.fit
          }}
        />
      ) : (
        <RuntimePlaceholder label="Image" />
      );
    }
  }

  if (object.type === "video") {
    return <RuntimeVideo object={object} assets={assets} />;
  }

  if (object.type === "button" || object.type === "ctaButton") {
    const props = object.props as ButtonObjectProps;

    return (
      <button
        type="button"
        className="h-full w-full border-0 font-black shadow-lg transition hover:brightness-110"
        style={{
          background: props.backgroundColor,
          borderRadius: props.borderRadius,
          color: props.textColor
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (onLogicAction) {
            onLogicAction();
          } else {
            onAction(props.action ?? object.actions[0]);
          }
        }}
      >
        {props.label}
      </button>
    );
  }

  if (object.type === "shape" || object.type === "background") {
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
      <RuntimePlaceholder label="Sprite" />
    );
  }

  const props = object.props as AudioObjectProps;

  return (
    <button
      type="button"
      className="flex h-full w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-black text-blue-700"
      onClick={(event) => {
        event.stopPropagation();

        if (props.playOnClick && props.src) {
          const audio = new Audio(props.src);
          audio.volume = props.volume;
          audio.loop = props.loop;
          void audio.play();
        }
      }}
    >
      <Music2 className="size-4" aria-hidden />
      Audio
    </button>
  );
}

function RuntimeVideo({ object, assets }: { object: EditorObject; assets: PlayableAsset[] }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const props = object.props as VideoObjectProps;
  const asset = props.assetId ? assets.find((item) => item.id === props.assetId) : null;
  const src = props.src || asset?.dataUrl;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) {
      return;
    }

    const currentVideo = video;

    function handleLoadedMetadata() {
      if (props.startTime > 0) {
        currentVideo.currentTime = Math.min(props.startTime, currentVideo.duration || props.startTime);
      }
    }

    function handleTimeUpdate() {
      if (props.endTime > 0 && currentVideo.currentTime >= props.endTime) {
        if (props.loop) {
          currentVideo.currentTime = props.startTime;
          void currentVideo.play();
        } else {
          currentVideo.pause();
        }
      }
    }

    currentVideo.addEventListener("loadedmetadata", handleLoadedMetadata);
    currentVideo.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      currentVideo.removeEventListener("loadedmetadata", handleLoadedMetadata);
      currentVideo.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [props.endTime, props.loop, props.startTime, src]);

  return src ? (
    <video
      ref={videoRef}
      src={src}
      className="h-full w-full bg-black"
      style={{ objectFit: props.fit === "stretch" ? "fill" : props.fit }}
      muted={props.muted}
      loop={props.loop}
      autoPlay={props.autoplay}
      playsInline
      controls={props.controls}
    />
  ) : (
    <RuntimePlaceholder label="Video" icon={<Video className="size-5" aria-hidden />} />
  );
}

function RuntimePlaceholder({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="grid h-full w-full place-items-center rounded-lg border border-dashed border-white/30 bg-black/30 text-xs font-black text-white/70">
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
    </div>
  );
}
