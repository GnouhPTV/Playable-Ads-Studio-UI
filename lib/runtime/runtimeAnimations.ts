import type { CSSProperties } from "react";
import type { AnimationPreset, EditorObject } from "@/types/project";

export function getRuntimeAnimationClass(animations: AnimationPreset[]) {
  return animations
    .filter((animation) => animation !== "none")
    .map((animation) => `animate-${animation}`)
    .join(" ");
}

export function getRuntimeObjectStyle(object: EditorObject): CSSProperties {
  return {
    position: "absolute",
    left: object.x,
    top: object.y,
    width: object.width,
    height: object.height,
    opacity: object.opacity,
    zIndex: object.zIndex,
    transform: `rotate(${object.rotation}deg)`,
    transformOrigin: "center"
  };
}
