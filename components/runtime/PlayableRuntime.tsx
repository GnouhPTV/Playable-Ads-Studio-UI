"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { Target } from "lucide-react";
import type { ButtonObjectProps, EditorObject, PlayableProject, ShapeObjectProps, TextObjectProps } from "@/types/project";
import { RuntimeObject } from "@/components/runtime/RuntimeObject";
import {
  getActionsByTrigger,
  getActionsForObject,
  getLogicBoolean,
  getLogicNumber,
  getObjectByRole,
  getObjectRole,
  getRoleBoolean,
  getRoleName,
  getRoleNumber,
  getRoleString,
  getTemplateDuration
} from "@/lib/logic/logicRuntime";
import { runRuntimeAction } from "@/lib/runtime/runtimeActions";
import { getInitialScene, getSceneById, getSceneByType, getSceneObjects } from "@/lib/runtime/renderScene";
import type { RuntimeContext, RuntimeEvent } from "@/lib/runtime/runtimeTypes";
import type { LogicAction, LogicActionTrigger, LogicObjectRole } from "@/types/logic";

interface PlayableRuntimeProps {
  project: PlayableProject;
  className?: string;
  onEvent?: (event: RuntimeEvent) => void;
  onCta?: (url: string) => void;
}

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

function randomPosition(width = 96, height = 96, area: string = "safeArea") {
  const bounds =
    area === "fullScreen"
      ? { left: 16, top: 52, right: CANVAS_WIDTH - width - 16, bottom: CANVAS_HEIGHT - height - 32 }
      : { left: 32, top: 120, right: CANVAS_WIDTH - width - 32, bottom: CANVAS_HEIGHT - height - 120 };

  return {
    x: bounds.left + Math.round(Math.random() * Math.max(1, bounds.right - bounds.left)),
    y: bounds.top + Math.round(Math.random() * Math.max(1, bounds.bottom - bounds.top))
  };
}

export function PlayableRuntime({ project, className = "", onEvent, onCta }: PlayableRuntimeProps) {
  const initialScene = getInitialScene(project);
  const [sceneId, setSceneId] = useState(initialScene?.id ?? "");
  const [score, setScore] = useState(project.logicConfig.score.initialValue);
  const [timeLeft, setTimeLeft] = useState(getTemplateDuration(project));
  const [tapCount, setTapCount] = useState(0);
  const [targetPosition, setTargetPosition] = useState(randomPosition);
  const [floatingScore, setFloatingScore] = useState<{ id: number; x: number; y: number; text: string } | null>(null);
  const [gemPositions, setGemPositions] = useState<Array<{ x: number; y: number; hidden?: boolean }>>([]);
  const [playerX, setPlayerX] = useState(155);
  const [usedGates, setUsedGates] = useState<number[]>([]);
  const [cannons, setCannons] = useState([
    { id: "c1", x: 82, y: 500, level: 1 },
    { id: "c2", x: 160, y: 500, level: 1 },
    { id: "c3", x: 238, y: 500, level: 2 }
  ]);
  const [activeCannonId, setActiveCannonId] = useState<string | null>(null);
  const [enemyHp, setEnemyHp] = useState(getLogicNumber(project.logicConfig.settings.enemyHp, 3));
  const [enemyY, setEnemyY] = useState(150);

  const scene = getSceneById(project, sceneId) ?? initialScene;
  const sceneIndex = scene ? project.scenes.findIndex((item) => item.id === scene.id) : 0;
  const sceneObjects = useMemo(() => (scene ? getSceneObjects(project, scene.id) : []), [project, scene]);
  const sceneBackgroundAsset = scene?.backgroundImageAssetId
    ? project.assets.find((asset) => asset.id === scene.backgroundImageAssetId)
    : null;
  const templateType = project.logicConfig.templateType;
  const generatedGameplay = scene?.type === "gameplay" && ["tapMonster", "gemCollector", "runnerGate", "mergeCannon"].includes(templateType);

  const runtimeSceneObjects = useMemo(() => {
    if (!generatedGameplay) {
      return sceneObjects;
    }

    return sceneObjects.filter((object) => getRoleName(project.logicConfig, object.id) === "background");
  }, [generatedGameplay, project.logicConfig, sceneObjects]);

  useEffect(() => {
    const nextInitialScene = getInitialScene(project);
    setSceneId(nextInitialScene?.id ?? "");
    resetRuntimeState();
  }, [project.id]);

  useEffect(() => {
    if (!scene || scene.type !== "gameplay" || !project.logicConfig.timer.enabled) {
      return;
    }

    setTimeLeft(project.logicConfig.timer.duration);
    const interval = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          runTrigger("onTimerEnd");
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [project.logicConfig.timer.duration, project.logicConfig.timer.enabled, scene?.id, scene?.type]);

  useEffect(() => {
    if (!scene || scene.type !== "gameplay") {
      return;
    }

    if (templateType === "tapMonster") {
      const target = getObjectByRole(project, "tapTarget");
      const role = target ? getObjectRole(project.logicConfig, target.id) : null;
      setTapCount(0);
      setTargetPosition(randomPosition(target?.width, target?.height, getRoleString(role, "randomArea", "safeArea")));
    }

    if (templateType === "gemCollector") {
      const count = getLogicNumber(project.logicConfig.settings.gemCount, 5);
      setGemPositions(Array.from({ length: count }, () => randomPosition(42, 42, "safeArea")));
    }

    if (templateType === "runnerGate") {
      setPlayerX(155);
      setUsedGates([]);
    }

    if (templateType === "mergeCannon") {
      setEnemyHp(getLogicNumber(project.logicConfig.settings.enemyHp, 3));
      setEnemyY(150);
      setCannons([
        { id: "c1", x: 82, y: 500, level: 1 },
        { id: "c2", x: 160, y: 500, level: 1 },
        { id: "c3", x: 238, y: 500, level: 2 }
      ]);
    }
  }, [project, scene?.id, scene?.type, templateType]);

  useEffect(() => {
    if (!scene || scene.type !== "gameplay" || templateType !== "mergeCannon") {
      return;
    }

    const fireRate = Math.max(0.25, getLogicNumber(project.logicConfig.settings.fireRate, 1.1));
    const interval = window.setInterval(() => {
      setEnemyY((value) => (value > 420 ? 150 : value + 18));
      setEnemyHp((value) => {
        const damage = getLogicNumber(project.logicConfig.settings.cannonDamage, 1) * cannons.reduce((total, cannon) => total + cannon.level, 0);
        const next = value - damage;

        if (next <= 0) {
          setScore((current) => current + getLogicNumber(project.logicConfig.settings.coinReward, 10));
          setFloatingScore({ id: Date.now(), x: 170, y: enemyY - 28, text: "+ reward" });
          return getLogicNumber(project.logicConfig.settings.enemyHp, 3);
        }

        return next;
      });
    }, fireRate * 1000);

    return () => window.clearInterval(interval);
  }, [cannons, enemyY, project.logicConfig.settings, scene?.id, scene?.type, templateType]);

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

  function resetRuntimeState() {
    setScore(project.logicConfig.score.initialValue);
    setTimeLeft(getTemplateDuration(project));
    setTapCount(0);
    setFloatingScore(null);
    setUsedGates([]);
    setEnemyHp(getLogicNumber(project.logicConfig.settings.enemyHp, 3));
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
    resetRuntimeState();
  }

  function openUrl(url?: string) {
    const ctaUrl = url || String(project.logicConfig.settings.ctaUrl ?? project.settings.ctaUrl) || "#";
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

  function runLogicAction(action: LogicAction) {
    if (action.type === "addScore" || action.type === "addGems") {
      const amount = getLogicNumber(action.value, 1);
      const nextScore = score + amount;
      setScore(nextScore);
      emit({ type: "score", message: `Score changed to ${nextScore}.` });

      if (project.logicConfig.score.enabled && nextScore >= project.logicConfig.score.targetValue) {
        getActionsByTrigger(project.logicConfig, "onScoreReached").forEach(runLogicAction);
      }
      return;
    }

    if (action.type === "subtractScore") {
      setScore((value) => Math.max(0, value - getLogicNumber(action.value, 1)));
      return;
    }

    if (action.type === "goToScene" && action.targetSceneId) {
      goToScene(action.targetSceneId);
      return;
    }

    if (action.type === "nextScene") {
      goToSceneIndex(Math.min(sceneIndex + 1, project.scenes.length - 1));
      return;
    }

    if (action.type === "showEndCard") {
      goToSceneType("endCard");
      return;
    }

    if (action.type === "replay") {
      reset();
      return;
    }

    if (action.type === "openUrl") {
      openUrl(typeof action.value === "string" ? action.value : undefined);
    }
  }

  function runTrigger(trigger: LogicActionTrigger, objectId?: string) {
    const actions = objectId
      ? getActionsForObject(project.logicConfig, objectId, trigger)
      : getActionsByTrigger(project.logicConfig, trigger);

    actions.forEach(runLogicAction);
  }

  function handleTapTarget(target: EditorObject, role: LogicObjectRole | null) {
    const scorePerTap = getRoleNumber(role, "scorePerTap", getLogicNumber(project.logicConfig.settings.scorePerTap, 1));
    const randomize = getRoleBoolean(role, "randomizeAfterTap", getLogicBoolean(project.logicConfig.settings.randomizeAfterTap, true));
    const maxTaps = getRoleNumber(role, "maxTaps", 0);
    const nextTapCount = tapCount + 1;

    if (maxTaps > 0 && tapCount >= maxTaps) {
      return;
    }

    const tapActions = getActionsForObject(project.logicConfig, target.id, "onTap");
    setTapCount(nextTapCount);
    if (tapActions.length === 0) {
      setScore((value) => value + scorePerTap);
    }
    setFloatingScore({ id: Date.now(), x: targetPosition.x + target.width / 2 - 8, y: targetPosition.y - 16, text: `+${scorePerTap}` });
    tapActions.forEach(runLogicAction);

    if (randomize) {
      setTargetPosition(randomPosition(target.width, target.height, getRoleString(role, "randomArea", "safeArea")));
    }
  }

  function handleGate(index: number, value: number) {
    if (usedGates.includes(index)) {
      return;
    }

    setUsedGates((items) => [...items, index]);
    setScore((current) => Math.max(0, value === 2 ? current * 2 : current + value));
    setFloatingScore({ id: Date.now(), x: 72 + index * 96, y: 372, text: value === 2 ? "x2" : `${value > 0 ? "+" : ""}${value}` });
  }

  function mergeCannon(sourceId: string) {
    const source = cannons.find((cannon) => cannon.id === sourceId);

    if (!source) {
      return;
    }

    const target = cannons.find(
      (cannon) =>
        cannon.id !== source.id &&
        cannon.level === source.level &&
        Math.hypot(cannon.x - source.x, cannon.y - source.y) < 80
    );

    if (!target) {
      return;
    }

    const maxLevel = getLogicNumber(project.logicConfig.settings.mergeLevelLimit, 4);
    setCannons((items) =>
      items
        .filter((cannon) => cannon.id !== source.id)
        .map((cannon) => (cannon.id === target.id ? { ...cannon, level: Math.min(maxLevel, cannon.level + 1) } : cannon))
    );
    setFloatingScore({ id: Date.now(), x: target.x, y: target.y - 24, text: "Merged" });
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

      {runtimeSceneObjects.map((object) => {
        const hasLogicClick = getActionsForObject(project.logicConfig, object.id, "onClick").length > 0;

        return (
          <RuntimeObject
            key={`${scene.id}-${object.id}`}
            object={object}
            project={project}
            onAction={(action) => emit(runRuntimeAction(action, context))}
            onLogicAction={hasLogicClick ? () => runTrigger("onClick", object.id) : undefined}
          />
        );
      })}

      {generatedGameplay ? (
        <div className="absolute inset-0 z-[1200]">
          <RuntimeScoreAndTimer project={project} sceneObjects={sceneObjects} score={score} timeLeft={timeLeft} />
          {templateType === "tapMonster" ? (
            <TapMonsterLayer project={project} position={targetPosition} onTap={handleTapTarget} />
          ) : null}
          {templateType === "gemCollector" ? (
            <GemCollectorLayer project={project} positions={gemPositions} setPositions={setGemPositions} setScore={setScore} setFloatingScore={setFloatingScore} />
          ) : null}
          {templateType === "runnerGate" ? (
            <RunnerGateLayer
              project={project}
              playerX={playerX}
              setPlayerX={setPlayerX}
              usedGates={usedGates}
              onGate={handleGate}
            />
          ) : null}
          {templateType === "mergeCannon" ? (
            <MergeCannonLayer
              cannons={cannons}
              setCannons={setCannons}
              activeCannonId={activeCannonId}
              setActiveCannonId={setActiveCannonId}
              mergeCannon={mergeCannon}
              enemyHp={enemyHp}
              enemyY={enemyY}
            />
          ) : null}
        </div>
      ) : null}

      {scene.type === "endCard" ? (
        <div className="pointer-events-none absolute inset-0 z-[1100]">
          {sceneObjects.map((object) => {
            const role = getObjectRole(project.logicConfig, object.id);

            if (role?.role === "scoreText" && getRoleBoolean(role, "finalScore", false)) {
              return <RuntimeText key={object.id} object={object} text={`${getRoleString(role, "prefix", "Final Score")} ${score}`} />;
            }

            if (role?.role === "ctaButton" || role?.role === "replayButton") {
              return (
                <div key={object.id} className="pointer-events-auto">
                  <RuntimeObject
                    object={object}
                    project={project}
                    onAction={(action) => emit(runRuntimeAction(action, context))}
                    onLogicAction={getActionsForObject(project.logicConfig, object.id, "onClick").length > 0 ? () => runTrigger("onClick", object.id) : undefined}
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
      ) : null}

      {floatingScore ? (
        <div
          key={floatingScore.id}
          className="pointer-events-none absolute z-[1600] rounded-full bg-white px-3 py-1 text-sm font-black text-blue-700 shadow-lg animate-slideUp"
          style={{ left: floatingScore.x, top: floatingScore.y }}
        >
          {floatingScore.text}
        </div>
      ) : null}
    </div>
  );
}

function RuntimeScoreAndTimer({
  project,
  sceneObjects,
  score,
  timeLeft
}: {
  project: PlayableProject;
  sceneObjects: EditorObject[];
  score: number;
  timeLeft: number;
}) {
  return (
    <>
      {sceneObjects.map((object) => {
        const role = getObjectRole(project.logicConfig, object.id);

        if (role?.role === "scoreText" && !getRoleBoolean(role, "finalScore", false)) {
          return <RuntimeText key={object.id} object={object} text={`${getRoleString(role, "prefix", "Score")} ${score}`} />;
        }

        if (role?.role === "timerText") {
          return <RuntimeText key={object.id} object={object} text={formatTime(timeLeft, getRoleString(role, "format", "30s"))} />;
        }

        return null;
      })}
    </>
  );
}

function TapMonsterLayer({
  project,
  position,
  onTap
}: {
  project: PlayableProject;
  position: { x: number; y: number };
  onTap: (target: EditorObject, role: LogicObjectRole | null) => void;
}) {
  const target = getObjectByRole(project, "tapTarget");
  const role = target ? getObjectRole(project.logicConfig, target.id) : null;

  if (!target || !getRoleBoolean(role, "visibleAtSceneStart", true)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => onTap(target, role)}
      className="absolute grid place-items-center border-0 text-sm font-black text-white shadow-[0_0_34px_rgba(59,130,246,0.45)]"
      style={{
        ...shapeStyle(target),
        left: position.x,
        top: position.y,
        width: target.width,
        height: target.height
      }}
    >
      <Target className="size-9" aria-hidden />
      TAP
    </button>
  );
}

function GemCollectorLayer({
  project,
  positions,
  setPositions,
  setScore,
  setFloatingScore
}: {
  project: PlayableProject;
  positions: Array<{ x: number; y: number; hidden?: boolean }>;
  setPositions: Dispatch<SetStateAction<Array<{ x: number; y: number; hidden?: boolean }>>>;
  setScore: Dispatch<SetStateAction<number>>;
  setFloatingScore: (value: { id: number; x: number; y: number; text: string }) => void;
}) {
  const gemValue = getLogicNumber(project.logicConfig.settings.gemValue, 5);
  const respawn = getLogicBoolean(project.logicConfig.settings.respawnOnTap, true);

  return (
    <>
      {positions.map((position, index) =>
        position.hidden ? null : (
          <button
            key={index}
            type="button"
            onClick={() => {
              setScore((score) => score + gemValue);
              setFloatingScore({ id: Date.now(), x: position.x, y: position.y - 16, text: `+${gemValue}` });
              const next = [...positions];
              next[index] = respawn ? randomPosition(42, 42, "safeArea") : { ...position, hidden: true };
              setPositions(next);
            }}
            className="absolute grid size-10 rotate-45 place-items-center rounded-md border-0 bg-cyan-300 text-xs font-black text-slate-950 shadow-lg"
            style={{ left: position.x, top: position.y }}
          >
            <span className="-rotate-45">+{gemValue}</span>
          </button>
        )
      )}
    </>
  );
}

function RunnerGateLayer({
  project,
  playerX,
  setPlayerX,
  usedGates,
  onGate
}: {
  project: PlayableProject;
  playerX: number;
  setPlayerX: (value: number) => void;
  usedGates: number[];
  onGate: (index: number, value: number) => void;
}) {
  const gateValues = Array.isArray(project.logicConfig.settings.gateValues)
    ? project.logicConfig.settings.gateValues.map(Number).filter(Number.isFinite)
    : [10, 2, -5];

  function handlePointer(clientX: number) {
    const nextX = Math.max(24, Math.min(306, clientX - 25));
    setPlayerX(nextX);
    gateValues.forEach((value, index) => {
      const gateX = 42 + index * 94;

      if (Math.abs(nextX - gateX) < 54) {
        onGate(index, value);
      }
    });
  }

  return (
    <div
      className="absolute inset-0"
      onPointerMove={(event) => {
        if (event.buttons) {
          const rect = event.currentTarget.getBoundingClientRect();
          handlePointer(event.clientX - rect.left);
        }
      }}
      onPointerDown={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        handlePointer(event.clientX - rect.left);
      }}
    >
      <div className="absolute inset-x-10 top-32 bottom-20 rounded-xl bg-white/5" />
      {gateValues.map((value, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onGate(index, value)}
          className={`absolute top-[390px] h-12 w-20 rounded-md border-0 text-sm font-black ${
            value < 0 ? "bg-rose-300 text-slate-950" : "bg-lime-300 text-slate-950"
          } ${usedGates.includes(index) ? "opacity-30" : ""}`}
          style={{ left: 36 + index * 96 }}
        >
          {value === 2 ? "x2" : `${value > 0 ? "+" : ""}${value}`}
        </button>
      ))}
      <div
        className="absolute top-[500px] grid size-14 place-items-center rounded-full bg-blue-500 text-xs font-black text-white shadow-lg"
        style={{ left: playerX }}
      >
        RUN
      </div>
    </div>
  );
}

function MergeCannonLayer({
  cannons,
  setCannons,
  activeCannonId,
  setActiveCannonId,
  mergeCannon,
  enemyHp,
  enemyY
}: {
  cannons: Array<{ id: string; x: number; y: number; level: number }>;
  setCannons: Dispatch<SetStateAction<Array<{ id: string; x: number; y: number; level: number }>>>;
  activeCannonId: string | null;
  setActiveCannonId: (id: string | null) => void;
  mergeCannon: (id: string) => void;
  enemyHp: number;
  enemyY: number;
}) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute right-10 grid size-16 place-items-center rounded-full bg-rose-400 text-xs font-black text-white shadow-lg"
        style={{ top: enemyY }}
      >
        HP {Math.max(0, Math.ceil(enemyHp))}
      </div>
      <div className="absolute right-24 top-[260px] h-1.5 w-28 -rotate-12 rounded-full bg-lime-300 shadow-lg" />
      {cannons.map((cannon) => (
        <button
          key={cannon.id}
          type="button"
          className="absolute grid place-items-center rounded-full border-0 bg-cyan-300 text-sm font-black text-slate-950 shadow-lg"
          style={{
            left: cannon.x,
            top: cannon.y,
            width: 52 + cannon.level * 8,
            height: 52 + cannon.level * 8
          }}
          onPointerDown={() => setActiveCannonId(cannon.id)}
          onPointerMove={(event) => {
            if (activeCannonId !== cannon.id || !event.buttons) {
              return;
            }

            const rect = (event.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
            const next = cannons.map((item) =>
              item.id === cannon.id
                ? {
                    ...item,
                    x: Math.max(20, Math.min(300, event.clientX - rect.left - 28)),
                    y: Math.max(140, Math.min(560, event.clientY - rect.top - 28))
                  }
                : item
            );
            setCannons(next);
          }}
          onPointerUp={() => {
            mergeCannon(cannon.id);
            setActiveCannonId(null);
          }}
        >
          L{cannon.level}
        </button>
      ))}
    </div>
  );
}

function RuntimeText({ object, text }: { object: EditorObject; text: string }) {
  const props = object.props as TextObjectProps;

  return (
    <div
      className="absolute z-[1300] flex items-center whitespace-pre-wrap"
      style={{
        left: object.x,
        top: object.y,
        width: object.width,
        height: object.height,
        opacity: object.opacity,
        transform: `rotate(${object.rotation}deg)`,
        color: props.color,
        fontSize: props.fontSize,
        fontWeight: props.fontWeight,
        justifyContent: props.align === "left" ? "flex-start" : props.align === "right" ? "flex-end" : "center",
        lineHeight: 1.05,
        textAlign: props.align,
        textShadow: props.shadow ? "0 8px 18px rgba(0,0,0,0.45)" : "none",
        WebkitTextStroke: props.strokeWidth ? `${props.strokeWidth}px ${props.strokeColor}` : undefined
      }}
    >
      {text}
    </div>
  );
}

function shapeStyle(object: EditorObject): CSSProperties {
  if (object.type === "shape") {
    const props = object.props as ShapeObjectProps;

    return {
      background: props.fillColor,
      border: `${props.strokeWidth}px solid ${props.strokeColor}`,
      borderRadius: props.shape === "circle" ? "999px" : props.shape === "roundedRectangle" ? 18 : 0
    };
  }

  if (object.type === "button" || object.type === "ctaButton") {
    const props = object.props as ButtonObjectProps;
    return {
      background: props.backgroundColor,
      borderRadius: props.borderRadius,
      color: props.textColor
    };
  }

  return {
    background: "linear-gradient(135deg, #f472b6, #3b82f6)",
    borderRadius: 999
  };
}

function formatTime(seconds: number, format: string) {
  if (format === "00:30") {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
    const remainder = Math.max(0, seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  return `${Math.max(0, seconds)}s`;
}
