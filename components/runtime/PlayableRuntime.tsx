"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Target } from "lucide-react";
import type { PlayableProject } from "@/types/project";
import { RuntimeObject } from "@/components/runtime/RuntimeObject";
import { runRuntimeAction } from "@/lib/runtime/runtimeActions";
import { getInitialScene, getSceneById, getSceneByType, getSceneObjects } from "@/lib/runtime/renderScene";
import type { RuntimeContext, RuntimeEvent } from "@/lib/runtime/runtimeTypes";

interface PlayableRuntimeProps {
  project: PlayableProject;
  className?: string;
  onEvent?: (event: RuntimeEvent) => void;
  onCta?: (url: string) => void;
}

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

function randomMonsterPosition() {
  return {
    x: 48 + Math.round(Math.random() * 220),
    y: 148 + Math.round(Math.random() * 310)
  };
}

export function PlayableRuntime({ project, className = "", onEvent, onCta }: PlayableRuntimeProps) {
  const initialScene = getInitialScene(project);
  const [sceneId, setSceneId] = useState(initialScene?.id ?? "");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(project.settings.duration);
  const [monsterPosition, setMonsterPosition] = useState(randomMonsterPosition);
  const [floatingScore, setFloatingScore] = useState<{ id: number; x: number; y: number; text: string } | null>(null);

  const scene = getSceneById(project, sceneId) ?? initialScene;
  const sceneIndex = scene ? project.scenes.findIndex((item) => item.id === scene.id) : 0;
  const sceneObjects = useMemo(() => (scene ? getSceneObjects(project, scene.id) : []), [project, scene]);
  const sceneBackgroundAsset = scene?.backgroundImageAssetId
    ? project.assets.find((asset) => asset.id === scene.backgroundImageAssetId)
    : null;

  useEffect(() => {
    const nextInitialScene = getInitialScene(project);
    setSceneId(nextInitialScene?.id ?? "");
    setScore(0);
    setTimeLeft(project.settings.duration);
  }, [project.id, project.settings.duration]);

  useEffect(() => {
    if (!scene || scene.type === "endCard" || (project.templateId === "tap-monster" && scene.type === "gameplay")) {
      return;
    }

    if (!scene.duration) {
      return;
    }

    const timeout = window.setTimeout(() => {
      goToSceneIndex(Math.min(sceneIndex + 1, project.scenes.length - 1));
    }, scene.duration * 1000);

    return () => window.clearTimeout(timeout);
  }, [project.scenes.length, project.templateId, scene, sceneIndex]);

  useEffect(() => {
    if (!scene || project.templateId !== "tap-monster" || scene.type !== "gameplay") {
      return;
    }

    setTimeLeft(project.settings.duration);
    setMonsterPosition(randomMonsterPosition());

    const interval = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          goToSceneType("endCard");
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [project.settings.duration, project.templateId, scene?.id, scene?.type]);

  useEffect(() => {
    if (!floatingScore) {
      return;
    }

    const timeout = window.setTimeout(() => setFloatingScore(null), 620);
    return () => window.clearTimeout(timeout);
  }, [floatingScore]);

  if (!scene) {
    return <div className="grid h-full w-full place-items-center text-sm text-white/70">No runtime scene.</div>;
  }

  function emit(event: RuntimeEvent) {
    onEvent?.(event);
  }

  function goToScene(nextSceneId: string) {
    if (!getSceneById(project, nextSceneId)) {
      return;
    }

    setSceneId(nextSceneId);
    emit({ type: "sceneChange", message: `Scene changed to ${getSceneById(project, nextSceneId)?.title ?? "selected scene"}.` });
  }

  function goToSceneIndex(index: number) {
    const nextScene = project.scenes[index];

    if (nextScene) {
      goToScene(nextScene.id);
    }
  }

  function goToSceneType(type: "intro" | "gameplay" | "endCard") {
    const nextScene = getSceneByType(project, type);

    if (nextScene) {
      goToScene(nextScene.id);
    }
  }

  function reset() {
    const firstScene = getInitialScene(project);
    setSceneId(firstScene?.id ?? "");
    setScore(0);
    setTimeLeft(project.settings.duration);
    setMonsterPosition(randomMonsterPosition());
  }

  function openUrl(url?: string) {
    const ctaUrl = url || project.settings.ctaUrl || "#";
    onCta?.(ctaUrl);

    if (!onCta && typeof window !== "undefined") {
      window.open(ctaUrl, "_blank", "noopener,noreferrer");
    }
  }

  const context: RuntimeContext = {
    project,
    scene,
    sceneIndex,
    score,
    started: scene.type === "gameplay",
    goToScene,
    goToSceneIndex,
    goToSceneType,
    reset,
    setScore,
    openUrl
  };

  function handleTapMonster() {
    const nextScore = score + 1;
    const nextPosition = randomMonsterPosition();
    setScore(nextScore);
    setFloatingScore({
      id: Date.now(),
      x: monsterPosition.x + 40,
      y: monsterPosition.y - 12,
      text: "+1"
    });
    setMonsterPosition(nextPosition);
    emit({ type: "score", message: `Tap Monster score increased to ${nextScore}.` });
  }

  return (
    <div
      className={`relative h-[640px] w-[360px] overflow-hidden bg-black text-white ${className}`}
      style={{
        background: scene.backgroundColor,
        height: CANVAS_HEIGHT,
        width: CANVAS_WIDTH
      }}
    >
      {sceneBackgroundAsset ? (
        <img
          src={sceneBackgroundAsset.dataUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : null}

      {sceneObjects.map((object) => (
        <RuntimeObject
          key={`${scene.id}-${object.id}`}
          object={object}
          project={project}
          onAction={(action) => emit(runRuntimeAction(action, context))}
        />
      ))}

      {project.templateId === "tap-monster" && scene.type === "gameplay" ? (
        <div className="absolute inset-0 z-[1200]">
          <div className="absolute left-4 top-12 rounded-md bg-slate-950/60 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur">
            Score {score}
          </div>
          <div className="absolute right-4 top-12 rounded-md bg-slate-950/60 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur">
            {timeLeft}s
          </div>
          <button
            type="button"
            onClick={handleTapMonster}
            className="absolute grid size-24 place-items-center rounded-full border-4 border-lime-300 bg-gradient-to-br from-pink-400 to-blue-500 text-sm font-black text-white shadow-[0_0_34px_rgba(59,130,246,0.45)] animate-pulse"
            style={{ left: monsterPosition.x, top: monsterPosition.y }}
          >
            <Target className="size-9" aria-hidden />
            TAP
          </button>
          {floatingScore ? (
            <div
              key={floatingScore.id}
              className="pointer-events-none absolute rounded-full bg-white px-3 py-1 text-sm font-black text-blue-700 shadow-lg animate-slideUp"
              style={{ left: floatingScore.x, top: floatingScore.y }}
            >
              {floatingScore.text}
            </div>
          ) : null}
        </div>
      ) : null}

      {project.templateId === "tap-monster" && scene.type === "endCard" ? (
        <div className="pointer-events-none absolute inset-x-8 top-[318px] z-[1200] text-center">
          <div className="rounded-lg border border-white/20 bg-white/90 px-4 py-3 text-slate-950 shadow-lg">
            <div className="text-xs font-black uppercase text-slate-500">Final score</div>
            <div className="text-3xl font-black text-blue-700">{score}</div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="pointer-events-auto mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 text-xs font-black text-blue-700"
          >
            <RotateCcw className="size-4" aria-hidden />
            Replay
          </button>
        </div>
      ) : null}
    </div>
  );
}
