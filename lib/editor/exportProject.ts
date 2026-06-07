import JSZip from "jszip";
import type { PlayableAsset, PlayableProject } from "@/types/project";
import { hasBlockingExportErrors, validateProjectForExport } from "@/lib/editor/validators";

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

function parseDataUrl(asset: PlayableAsset) {
  const [meta, data] = asset.dataUrl.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? asset.mimeType ?? "application/octet-stream";
  const extension = mime.includes("jpeg")
    ? "jpg"
    : mime.includes("mp4")
      ? "mp4"
      : mime.includes("webm")
        ? "webm"
    : mime.includes("svg")
      ? "svg"
      : mime.includes("webp")
        ? "webp"
        : mime.includes("mpeg")
          ? "mp3"
          : mime.includes("ogg")
            ? "ogg"
            : mime.includes("wav")
              ? "wav"
              : "png";

  return {
    data,
    extension,
    mime
  };
}

function buildExportProject(project: PlayableProject) {
  const assets = project.assets.map((asset) => {
    const parsed = parseDataUrl(asset);
    const file = `assets/${asset.id}.${parsed.extension}`;

    return {
      ...asset,
      dataUrl: file,
      file
    };
  });
  const assetFileById = new Map(assets.map((asset) => [asset.id, asset.file]));

  return {
    ...project,
    assets,
    objects: project.objects.map((object) => {
      if (!("assetId" in object.props) || !object.props.assetId) {
        return object;
      }

      const file = assetFileById.get(object.props.assetId);

      return file
        ? {
            ...object,
            props: {
              ...object.props,
              src: file
            }
          }
        : object;
    })
  };
}

function createIndexHtml(project: PlayableProject) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <title>${project.settings.title}</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <main id="playable" aria-label="${project.settings.title} playable export"></main>
    <script src="./playable.js"></script>
  </body>
</html>`;
}

function createStyleCss(project: PlayableProject) {
  return `:root {
  --main: ${project.settings.mainColor};
  --accent: ${project.settings.accentColor};
  --ink: #09090b;
}

* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; background: var(--ink); font-family: Arial, sans-serif; }
body { display: grid; place-items: center; overflow: hidden; }
#playable {
  position: relative;
  width: min(100vw, 360px);
  height: min(100vh, 640px);
  aspect-ratio: 9 / 16;
  overflow: hidden;
  background: #101014;
  touch-action: none;
}
.object {
  position: absolute;
  transform-origin: center;
  user-select: none;
}
.object button {
  border: 0;
  width: 100%;
  height: 100%;
  font-weight: 900;
}
.object video,
.object img {
  display: block;
}
.placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 1px dashed rgba(255,255,255,0.24);
  color: rgba(255,255,255,0.7);
  font-size: 12px;
}
.mechanic-layer {
  position: absolute;
  inset: 0;
  z-index: 40;
  pointer-events: auto;
}
.hud {
  position: absolute;
  left: 16px;
  top: 44px;
  color: white;
  font-size: 14px;
  font-weight: 900;
}
.tap-score,
.tap-timer {
  position: absolute;
  top: 48px;
  z-index: 12;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.72);
  color: #fff;
  padding: 9px 12px;
  font-size: 13px;
  font-weight: 900;
  backdrop-filter: blur(10px);
}
.tap-score { left: 16px; }
.tap-timer { right: 16px; }
.tap-target, .runner-player, .cannon, .gem {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--main);
  color: #071014;
  font-weight: 900;
  box-shadow: 0 0 24px rgba(35, 211, 238, 0.35);
}
.gate {
  position: absolute;
  display: grid;
  place-items: center;
  width: 72px;
  height: 42px;
  border-radius: 8px;
  font-weight: 900;
  color: #071014;
}
.gem {
  border-radius: 8px;
  transform: rotate(45deg);
}
.gem span {
  transform: rotate(-45deg);
}
.flow-card {
  position: absolute;
  left: 28px;
  right: 28px;
  top: 168px;
  min-height: 300px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 18px;
  background: rgba(9,9,11,0.72);
  color: white;
  text-align: center;
}
.flow-card h2 {
  margin: 0 0 14px;
  font-size: 26px;
  line-height: 1.05;
}
.flow-card p {
  margin: 0 0 18px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.45;
}
.flow-card button {
  min-width: 210px;
  min-height: 52px;
  border: 0;
  border-radius: 14px;
  background: var(--main);
  color: #071014;
  font-weight: 900;
}
.feedback {
  position: absolute;
  left: 50%;
  bottom: 72px;
  z-index: 20;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(15,23,42,0.86);
  color: white;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 900;
}
.tap-end-layer {
  position: absolute;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 32px;
  background: rgba(15, 23, 42, 0.74);
  backdrop-filter: blur(10px);
}
.tap-end-card {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 18px;
  background: #fff;
  color: #0f172a;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0,0,0,0.32);
}
.tap-end-card h2 {
  margin: 8px 0 0;
  font-size: 30px;
  line-height: 1;
}
.tap-end-card p {
  margin: 12px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 700;
}
.tap-score-box {
  margin-top: 18px;
  border-radius: 12px;
  background: #eff6ff;
  padding: 12px;
}
.tap-score-box strong {
  display: block;
  color: #2563eb;
  font-size: 42px;
  line-height: 1;
}
.tap-end-card button {
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 10px;
  font-weight: 900;
}
.tap-cta {
  margin-top: 18px;
  background: #2563eb;
  color: #fff;
}
.tap-replay {
  margin-top: 10px;
  border: 1px solid #bfdbfe !important;
  background: #eff6ff;
  color: #1d4ed8;
}
.animate-fadeIn { animation: fade-in 420ms ease both; }
.animate-popIn { animation: pop-in 360ms cubic-bezier(0.2, 1.3, 0.35, 1) both; }
.animate-bounce { animation: bounce 1.4s ease-in-out infinite; }
.animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
.animate-slideUp { animation: slide-up 420ms ease both; }
.animate-slideDown { animation: slide-down 420ms ease both; }
.animate-slideLeft { animation: slide-left 420ms ease both; }
.animate-slideRight { animation: slide-right 420ms ease both; }
.animate-shake { animation: shake 320ms ease-in-out both; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes pop-in { from { opacity: 0; transform: scale(.82); } to { opacity: 1; transform: scale(1); } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes pulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.2); } }
@keyframes slide-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-down { from { opacity: 0; transform: translateY(-28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slide-left { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slide-right { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }`;
}

function createManifest(project: PlayableProject) {
  return JSON.stringify(
    {
      name: project.name,
      templateId: project.templateId,
      duration: project.settings.duration,
      ctaText: project.settings.ctaText,
      ctaUrl: project.settings.ctaUrl,
      canvas: "360x640",
      generatedAt: new Date().toISOString(),
      disclaimer:
        "Learning MVP only. Real ad network deployment may require MRAID, network-specific specs, file size limits, orientation settings, and QA validation."
    },
    null,
    2
  );
}

function createReadmeExport(project: PlayableProject) {
  return `Playable Ads Studio Visual Export
=================================

Project: ${project.name}
Template: ${project.templateId}
Canvas: 360x640 portrait

How to test:
1. Unzip this package.
2. Open index.html in a browser.
3. Click through the designed scenes and test button actions.

Files:
- index.html: playable shell
- style.css: exported scene/object styling
- playable.js: local scene renderer and actions
- project.json: full editable project data
- assets/: uploaded local assets

Disclaimer:
This MVP export is for learning and local testing. Real ad network deployment may require additional MRAID, network-specific specifications, file size limits, orientation settings, and QA validation.`;
}

function createPlayableJs(project: PlayableProject) {
  const exportProject = JSON.stringify(buildExportProject(project));

  return `"use strict";

const PROJECT = ${exportProject};
const root = document.getElementById("playable");
const LOGIC = PROJECT.logicConfig || {};
let sceneIndex = 0;
let score = 0;
let timerId = null;
let mechanicTimerId = null;
let userInteracted = false;

function assetById(id) {
  return PROJECT.assets.find((asset) => asset.id === id);
}

function sceneById(id) {
  return PROJECT.scenes.find((scene) => scene.id === id);
}

function currentScene() {
  return PROJECT.scenes[sceneIndex] || PROJECT.scenes[0];
}

function roleForObject(objectId) {
  return (LOGIC.objectRoles || []).find((role) => role.objectId === objectId) || null;
}

function objectByRole(roleName) {
  const role = (LOGIC.objectRoles || []).find((item) => item.role === roleName);
  return role ? PROJECT.objects.find((object) => object.id === role.objectId) : null;
}

function actionsForObject(objectId, trigger) {
  return (LOGIC.actions || []).filter((action) => action.targetObjectId === objectId && (!trigger || action.trigger === trigger));
}

function actionsByTrigger(trigger) {
  return (LOGIC.actions || []).filter((action) => action.trigger === trigger);
}

function logicNumber(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function logicBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function roleNumber(role, key, fallback) {
  return logicNumber(role && role.settings ? role.settings[key] : undefined, fallback);
}

function roleBoolean(role, key, fallback) {
  return logicBoolean(role && role.settings ? role.settings[key] : undefined, fallback);
}

function roleString(role, key, fallback) {
  const value = role && role.settings ? role.settings[key] : undefined;
  return typeof value === "string" ? value : fallback;
}

function clearTimer() {
  if (timerId) {
    window.clearTimeout(timerId);
    window.clearInterval(timerId);
  }
  if (mechanicTimerId) {
    window.clearTimeout(mechanicTimerId);
    window.clearInterval(mechanicTimerId);
  }
  timerId = null;
  mechanicTimerId = null;
}

function setSceneById(sceneId) {
  const nextIndex = PROJECT.scenes.findIndex((scene) => scene.id === sceneId);
  if (nextIndex >= 0) {
    sceneIndex = nextIndex;
    renderScene();
  }
}

function setSceneByType(type) {
  const scene = PROJECT.scenes.find((item) => item.type === type);
  if (scene) setSceneById(scene.id);
}

function nextScene() {
  sceneIndex = Math.min(sceneIndex + 1, PROJECT.scenes.length - 1);
  renderScene();
}

function runAction(action) {
  userInteracted = true;
  playSceneStartAudio();
  if (!action || action.type === "none") return;
  if (action.type === "nextScene") {
    if (action.targetSceneId) {
      setSceneById(action.targetSceneId);
    } else {
      nextScene();
    }
  }
  if (action.type === "goToScene" && action.targetSceneId) setSceneById(action.targetSceneId);
  if (action.type === "startGame") {
    const gameplay = PROJECT.scenes.find((scene) => scene.type === "gameplay");
    if (gameplay) setSceneById(gameplay.id);
  }
  if (action.type === "showEndCard") {
    const endCard = PROJECT.scenes.find((scene) => scene.type === "endCard");
    if (endCard) setSceneById(endCard.id);
  }
  if (action.type === "openUrl") window.location.href = action.url || PROJECT.settings.ctaUrl || "#";
  if (action.type === "replay") {
    sceneIndex = 0;
    score = 0;
    renderScene();
  }
}

function runLogicAction(action) {
  userInteracted = true;
  if (!action) return;
  if (action.type === "addScore" || action.type === "addGems") {
    score += logicNumber(action.value, 1);
    const reached = LOGIC.score && LOGIC.score.enabled && score >= logicNumber(LOGIC.score.targetValue, 999999);
    if (reached) actionsByTrigger("onScoreReached").forEach(runLogicAction);
    return;
  }
  if (action.type === "subtractScore") {
    score = Math.max(0, score - logicNumber(action.value, 1));
    return;
  }
  if (action.type === "goToScene" && action.targetSceneId) {
    setSceneById(action.targetSceneId);
    return;
  }
  if (action.type === "nextScene") {
    nextScene();
    return;
  }
  if (action.type === "showEndCard") {
    setSceneByType("endCard");
    return;
  }
  if (action.type === "replay") {
    sceneIndex = 0;
    score = logicNumber(LOGIC.score && LOGIC.score.initialValue, 0);
    renderScene();
    return;
  }
  if (action.type === "openUrl") {
    window.location.href = action.value || PROJECT.settings.ctaUrl || "#";
  }
}

function runObjectActions(objectId, trigger) {
  const actions = actionsForObject(objectId, trigger);
  actions.forEach(runLogicAction);
  return actions.length > 0;
}

function objectAnimationClass(object) {
  return (object.animations || []).filter((animation) => animation !== "none").map((animation) => "animate-" + animation).join(" ");
}

function objectBaseStyle(object) {
  return [
    "left:" + object.x + "px",
    "top:" + object.y + "px",
    "width:" + object.width + "px",
    "height:" + object.height + "px",
    "opacity:" + object.opacity,
    "z-index:" + object.zIndex,
    "transform:rotate(" + object.rotation + "deg)"
  ].join(";");
}

function renderObject(object) {
  if (object.hidden) return null;
  const el = document.createElement("div");
  el.className = "object " + objectAnimationClass(object);
  el.style.cssText = objectBaseStyle(object);
  const props = object.props || {};

  if (object.type === "text") {
    el.textContent = props.text || "";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = props.align === "left" ? "flex-start" : props.align === "right" ? "flex-end" : "center";
    el.style.textAlign = props.align || "center";
    el.style.fontSize = (props.fontSize || 18) + "px";
    el.style.fontWeight = props.fontWeight || "700";
    el.style.color = props.color || "#fff";
    el.style.lineHeight = "1.05";
    el.style.textShadow = props.shadow ? "0 8px 18px rgba(0,0,0,.45)" : "none";
    if (props.strokeWidth) el.style.webkitTextStroke = props.strokeWidth + "px " + props.strokeColor;
    return el;
  }

  if (object.type === "image" || object.type === "animatedSprite" || object.type === "background") {
    const asset = props.assetId ? assetById(props.assetId) : null;
    const src = props.src || (asset && (asset.file || asset.dataUrl));
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = props.fit === "stretch" ? "fill" : props.fit || "contain";
      img.style.borderRadius = (props.borderRadius || 0) + "px";
      el.appendChild(img);
      return el;
    }
  }

  if (object.type === "video") {
    const asset = props.assetId ? assetById(props.assetId) : null;
    const src = props.src || (asset && (asset.file || asset.dataUrl));
    if (src) {
      const video = document.createElement("video");
      video.src = src;
      video.muted = props.muted !== false;
      video.loop = Boolean(props.loop);
      video.autoplay = props.autoplay !== false;
      video.controls = Boolean(props.controls);
      video.playsInline = true;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = props.fit === "stretch" ? "fill" : props.fit || "cover";
      video.addEventListener("loadedmetadata", () => {
        if (props.startTime > 0) video.currentTime = Math.min(props.startTime, video.duration || props.startTime);
      });
      video.addEventListener("timeupdate", () => {
        if (props.endTime > 0 && video.currentTime >= props.endTime) {
          if (props.loop) {
            video.currentTime = props.startTime || 0;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      });
      el.appendChild(video);
      return el;
    }
  }

  if (object.type === "button" || object.type === "ctaButton") {
    const button = document.createElement("button");
    button.textContent = props.label || "Button";
    button.style.background = props.backgroundColor || PROJECT.settings.mainColor;
    button.style.color = props.textColor || "#071014";
    button.style.borderRadius = (props.borderRadius || 12) + "px";
    button.addEventListener("click", () => {
      const handled = runObjectActions(object.id, "onClick");
      if (!handled) runAction(props.action || (object.actions && object.actions[0]));
    });
    el.appendChild(button);
    return el;
  }

  if (object.type === "shape" || object.type === "background") {
    el.style.background = props.fillColor || PROJECT.settings.mainColor;
    el.style.border = (props.strokeWidth || 0) + "px solid " + (props.strokeColor || "transparent");
    el.style.borderRadius = props.shape === "circle" ? "999px" : props.shape === "roundedRectangle" ? "18px" : "0";
    return el;
  }

  if (object.type === "audio") {
    el.className += " placeholder";
    el.textContent = "Audio";
    el.addEventListener("click", () => playAudioObject(object));
    return el;
  }

  el.className += " placeholder";
  el.textContent = object.type;
  return el;
}

function playAudioObject(object) {
  const props = object.props || {};
  const asset = props.assetId ? assetById(props.assetId) : null;
  const src = props.src || (asset && (asset.file || asset.dataUrl));
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = props.volume ?? 0.8;
  audio.loop = Boolean(props.loop);
  audio.play().catch(() => {});
}

function playSceneStartAudio() {
  if (!userInteracted) return;
  const scene = currentScene();
  PROJECT.objects
    .filter((object) => object.sceneId === scene.id && object.type === "audio" && object.props.playOnSceneStart)
    .forEach(playAudioObject);
}

function renderTemplateGameplay(scene) {
  if (scene.type !== "gameplay") return;
  const layer = document.createElement("div");
  layer.className = "mechanic-layer";

  function showFeedback(text) {
    const old = layer.querySelector(".feedback");
    if (old) old.remove();
    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.textContent = text;
    layer.appendChild(feedback);
    window.setTimeout(() => feedback.remove(), 900);
  }

  function centerOf(el) {
    return {
      x: Number.parseFloat(el.style.left || "0") + Number.parseFloat(el.style.width || "0") / 2,
      y: Number.parseFloat(el.style.top || "0") + Number.parseFloat(el.style.height || "0") / 2
    };
  }

  if (PROJECT.templateId === "tap-monster") {
    const targetObject = objectByRole("tapTarget");
    const targetRole = targetObject ? roleForObject(targetObject.id) : null;
    const scorePerTap = roleNumber(targetRole, "scorePerTap", logicNumber(LOGIC.settings && LOGIC.settings.scorePerTap, 1));
    const randomizeAfterTap = roleBoolean(targetRole, "randomizeAfterTap", logicBoolean(LOGIC.settings && LOGIC.settings.randomizeAfterTap, true));
    let remaining = logicNumber(LOGIC.timer && LOGIC.timer.duration, scene.duration || PROJECT.settings.duration || 30);
    const scoreHud = document.createElement("div");
    scoreHud.className = "tap-score";
    scoreHud.textContent = "Score " + score;
    const timerHud = document.createElement("div");
    timerHud.className = "tap-timer";
    timerHud.textContent = remaining + "s";
    const target = document.createElement("button");
    target.className = "tap-target";
    target.textContent = "TAP";
    target.style.width = (targetObject ? targetObject.width : 100) + "px";
    target.style.height = (targetObject ? targetObject.height : 100) + "px";
    if (targetObject && targetObject.props) {
      if (targetObject.type === "shape") {
        target.style.background = targetObject.props.fillColor || PROJECT.settings.mainColor;
        target.style.border = (targetObject.props.strokeWidth || 0) + "px solid " + (targetObject.props.strokeColor || "transparent");
        target.style.borderRadius = targetObject.props.shape === "circle" ? "999px" : targetObject.props.shape === "roundedRectangle" ? "18px" : "0";
      }
    }
    function moveTarget() {
      const area = roleString(targetRole, "randomArea", "safeArea");
      const width = targetObject ? targetObject.width : 100;
      const height = targetObject ? targetObject.height : 100;
      const bounds = area === "fullScreen"
        ? { left: 16, top: 52, right: 360 - width - 16, bottom: 640 - height - 32 }
        : { left: 32, top: 120, right: 360 - width - 32, bottom: 640 - height - 120 };
      target.style.left = bounds.left + Math.random() * Math.max(1, bounds.right - bounds.left) + "px";
      target.style.top = bounds.top + Math.random() * Math.max(1, bounds.bottom - bounds.top) + "px";
    }
    function updateTapScore(nextScore) {
      score = Math.max(0, nextScore);
      scoreHud.textContent = "Score " + score;
    }
    target.addEventListener("click", () => {
      const handled = targetObject ? runObjectActions(targetObject.id, "onTap") : false;
      if (!handled) updateTapScore(score + scorePerTap);
      scoreHud.textContent = "Score " + score;
      if (randomizeAfterTap) moveTarget();
      showFeedback("+" + scorePerTap);
    });
    moveTarget();
    layer.appendChild(scoreHud);
    layer.appendChild(timerHud);
    layer.appendChild(target);
    timerId = window.setInterval(() => {
      remaining -= 1;
      timerHud.textContent = Math.max(remaining, 0) + "s";
      if (remaining <= 0) {
        clearTimer();
        const timerActions = actionsByTrigger("onTimerEnd");
        if (timerActions.length > 0) {
          timerActions.forEach(runLogicAction);
        } else {
          setSceneByType("endCard");
        }
      }
    }, 1000);
    root.appendChild(layer);
    return;
  }

  const hud = document.createElement("div");
  hud.className = "hud";
  hud.textContent = "Score " + score;
  layer.appendChild(hud);
  const timerHud = document.createElement("div");
  timerHud.className = "tap-timer";
  let remaining = logicNumber(LOGIC.timer && LOGIC.timer.duration, scene.duration || PROJECT.settings.duration || 30);
  timerHud.textContent = remaining + "s";
  layer.appendChild(timerHud);

  function updateScore(nextScore) {
    score = Math.max(0, nextScore);
    hud.textContent = "Score " + score;
  }

  if (LOGIC.timer && LOGIC.timer.enabled) {
    timerId = window.setInterval(() => {
      remaining -= 1;
      timerHud.textContent = Math.max(remaining, 0) + "s";
      if (remaining <= 0) {
        clearTimer();
        const timerActions = actionsByTrigger("onTimerEnd");
        if (timerActions.length > 0) {
          timerActions.forEach(runLogicAction);
        } else {
          setSceneByType("endCard");
        }
      }
    }, 1000);
  }

  if (PROJECT.templateId === "gem-collector") {
    function spawnGem(index) {
      const gem = document.createElement("button");
      const value = logicNumber(LOGIC.settings && LOGIC.settings.gemValue, index % 3 === 0 ? 10 : 5);
      const respawn = logicBoolean(LOGIC.settings && LOGIC.settings.respawnOnTap, true);
      gem.className = "gem";
      gem.style.left = 42 + Math.random() * 250 + "px";
      gem.style.top = 150 + Math.random() * 330 + "px";
      gem.style.width = "34px";
      gem.style.height = "34px";
      gem.style.background = index % 3 === 0 ? PROJECT.settings.accentColor : PROJECT.settings.mainColor;
      const label = document.createElement("span");
      label.textContent = "+" + value;
      gem.appendChild(label);
      gem.addEventListener("click", () => {
        updateScore(score + value);
        showFeedback("+" + value + " gems");
        gem.remove();
        if (respawn) spawnGem(index + 1);
      });
      layer.appendChild(gem);
    }

    const gemCount = logicNumber(LOGIC.settings && LOGIC.settings.gemCount, 6);
    for (let index = 0; index < gemCount; index += 1) {
      spawnGem(index);
    }
  }

  if (PROJECT.templateId === "runner-gate") {
    const player = document.createElement("div");
    player.className = "runner-player";
    player.style.left = "155px";
    player.style.top = "500px";
    player.style.width = "50px";
    player.style.height = "50px";
    player.textContent = "RUN";
    const gates = [];

    function applyGate(gate, label) {
      if (!gates.includes(gate)) return;
      if (label === "x2") {
        updateScore(Math.max(2, score * 2));
      } else {
        updateScore(score + Number(label.replace("+", "")));
      }
      gates.splice(gates.indexOf(gate), 1);
      gate.remove();
      showFeedback(label + " gate");
    }

    function checkRunnerCollisions() {
      const playerCenter = centerOf(player);
      gates.slice().forEach((gate) => {
        const gateCenter = centerOf(gate);
        if (Math.abs(gateCenter.x - playerCenter.x) < 50 && Math.abs(gateCenter.y - playerCenter.y) < 92) {
          applyGate(gate, gate.textContent);
        }
      });
    }

    layer.addEventListener("pointermove", (event) => {
      if (!event.buttons) return;
      const rect = root.getBoundingClientRect();
      const x = Math.max(24, Math.min(310, event.clientX - rect.left - 25));
      player.style.left = x + "px";
      checkRunnerCollisions();
    });
    const gateValues = Array.isArray(LOGIC.settings && LOGIC.settings.gateValues)
      ? LOGIC.settings.gateValues.map(Number).filter(Number.isFinite)
      : [10, 2, -5];
    gateValues.forEach((value, index) => {
      const label = value === 2 ? "x2" : (value > 0 ? "+" : "") + value;
      const gate = document.createElement("div");
      gate.className = "gate";
      gate.textContent = label;
      gate.style.left = 40 + index * 105 + "px";
      gate.style.top = "420px";
      gate.style.background = value < 0 ? "#fb7185" : PROJECT.settings.accentColor;
      gate.addEventListener("click", () => applyGate(gate, label));
      gates.push(gate);
      layer.appendChild(gate);
    });
    layer.appendChild(player);
  }

  if (PROJECT.templateId === "merge-cannon") {
    let active = null;
    const cannons = [];
    let enemyHp = logicNumber(LOGIC.settings && LOGIC.settings.enemyHp, 3);
    const enemy = document.createElement("div");
    enemy.className = "tap-target";
    enemy.style.left = "250px";
    enemy.style.top = "170px";
    enemy.style.width = "58px";
    enemy.style.height = "58px";
    enemy.style.background = "#fb7185";
    enemy.textContent = "HP " + enemyHp;
    layer.appendChild(enemy);

    function updateCannonLabel(cannon) {
      cannon.textContent = "L" + cannon.dataset.level;
      const size = 52 + Number(cannon.dataset.level) * 6;
      cannon.style.width = size + "px";
      cannon.style.height = size + "px";
    }

    function mergeIfPossible(source) {
      const sourceCenter = centerOf(source);
      const sourceLevel = source.dataset.level;
      const target = cannons.find((cannon) => {
        if (cannon === source || cannon.dataset.level !== sourceLevel) return false;
        const targetCenter = centerOf(cannon);
        return Math.hypot(targetCenter.x - sourceCenter.x, targetCenter.y - sourceCenter.y) < 88;
      });

      if (!target) {
        showFeedback("Need same level");
        return;
      }

      target.dataset.level = String(Number(target.dataset.level) + 1);
      updateCannonLabel(target);
      cannons.splice(cannons.indexOf(source), 1);
      source.remove();
      updateScore(score + 10);
      showFeedback("Merged " + target.textContent);
    }

    [0, 1, 2].forEach((_, index) => {
      const cannon = document.createElement("button");
      cannon.className = "cannon";
      cannon.dataset.level = index === 2 ? "2" : "1";
      cannon.style.left = 82 + index * 78 + "px";
      cannon.style.top = "500px";
      updateCannonLabel(cannon);
      cannon.addEventListener("pointerdown", (event) => {
        active = {
          el: cannon,
          offsetX: event.offsetX,
          offsetY: event.offsetY
        };
        cannon.setPointerCapture(event.pointerId);
      });
      cannon.addEventListener("pointermove", (event) => {
        if (!active || active.el !== cannon) return;
        const rect = root.getBoundingClientRect();
        const x = Math.max(24, Math.min(306, event.clientX - rect.left - active.offsetX));
        const y = Math.max(140, Math.min(560, event.clientY - rect.top - active.offsetY));
        cannon.style.left = x + "px";
        cannon.style.top = y + "px";
      });
      cannon.addEventListener("pointerup", () => {
        if (active && active.el === cannon) {
          mergeIfPossible(cannon);
        }
        active = null;
      });
      cannons.push(cannon);
      layer.appendChild(cannon);
    });
    mechanicTimerId = window.setInterval(() => {
      const damage = logicNumber(LOGIC.settings && LOGIC.settings.cannonDamage, 1) * cannons.reduce((total, cannon) => total + Number(cannon.dataset.level || 1), 0);
      enemyHp -= damage;
      if (enemyHp <= 0) {
        updateScore(score + logicNumber(LOGIC.settings && LOGIC.settings.coinReward, 10));
        showFeedback("+ reward");
        enemyHp = logicNumber(LOGIC.settings && LOGIC.settings.enemyHp, 3);
      }
      enemy.textContent = "HP " + Math.max(0, Math.ceil(enemyHp));
      enemy.style.top = 150 + Math.random() * 130 + "px";
    }, Math.max(250, logicNumber(LOGIC.settings && LOGIC.settings.fireRate, 1.1) * 1000));
  }

  if (PROJECT.templateId === "simple-end-card" || PROJECT.templateId === "intro-cta") {
    const card = document.createElement("section");
    card.className = "flow-card";
    const headline = document.createElement("h2");
    headline.textContent = PROJECT.templateId === "simple-end-card" ? PROJECT.settings.endCardTitle : "Offer screen";
    const copy = document.createElement("p");
    copy.textContent = PROJECT.templateId === "simple-end-card"
      ? PROJECT.settings.endCardSubtitle
      : "This step checks the transition between intro promise, playable action, and CTA.";
    const button = document.createElement("button");
    button.textContent = PROJECT.templateId === "simple-end-card" ? PROJECT.settings.ctaText : "Continue to CTA";
    button.addEventListener("click", () => {
      if (PROJECT.templateId === "simple-end-card") {
        updateScore(score + 25);
        showFeedback("CTA tap recorded");
      } else {
        nextScene();
      }
    });
    card.appendChild(headline);
    card.appendChild(copy);
    card.appendChild(button);
    layer.appendChild(card);
  }

  root.appendChild(layer);
}

function renderTapMonsterEndCard(scene) {
  if (PROJECT.templateId !== "tap-monster" || scene.type !== "endCard") return;
  const titleObject = PROJECT.objects.find((object) => object.sceneId === scene.id && object.name.toLowerCase().includes("end card title"));
  const subtitleObject = PROJECT.objects.find((object) => object.sceneId === scene.id && object.name.toLowerCase().includes("end card subtitle"));
  const ctaObject = objectByRole("ctaButton");
  const replayObject = objectByRole("replayButton");

  const layer = document.createElement("div");
  layer.className = "tap-end-layer";
  const card = document.createElement("section");
  card.className = "tap-end-card animate-popIn";

  const eyebrow = document.createElement("div");
  eyebrow.style.cssText = "color:#2563eb;font-size:12px;font-weight:900;text-transform:uppercase";
  eyebrow.textContent = "Run complete";

  const headline = document.createElement("h2");
  headline.textContent = (titleObject && titleObject.props && titleObject.props.text) || (LOGIC.settings && LOGIC.settings.endCardTitle) || PROJECT.settings.endCardTitle || scene.title || "Great job!";

  const copy = document.createElement("p");
  copy.textContent = (subtitleObject && subtitleObject.props && subtitleObject.props.text) || (LOGIC.settings && LOGIC.settings.endCardSubtitle) || PROJECT.settings.endCardSubtitle || scene.subtitle || "You tapped the monster before time ran out.";

  const scoreBox = document.createElement("div");
  scoreBox.className = "tap-score-box";
  const scoreLabel = document.createElement("div");
  scoreLabel.style.cssText = "color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase";
  scoreLabel.textContent = "Final score";
  const scoreValue = document.createElement("strong");
  scoreValue.textContent = String(score);
  scoreBox.appendChild(scoreLabel);
  scoreBox.appendChild(scoreValue);

  const cta = document.createElement("button");
  cta.className = "tap-cta";
  cta.textContent = (ctaObject && ctaObject.props && ctaObject.props.label) || (LOGIC.settings && LOGIC.settings.ctaText) || PROJECT.settings.ctaText || "View Portfolio";
  cta.addEventListener("click", () => {
    window.location.href = (LOGIC.settings && LOGIC.settings.ctaUrl) || PROJECT.settings.ctaUrl || "#";
  });

  const replay = document.createElement("button");
  replay.className = "tap-replay";
  replay.textContent = (replayObject && replayObject.props && replayObject.props.label) || "Replay";
  replay.addEventListener("click", () => {
    const handled = replayObject ? runObjectActions(replayObject.id, "onClick") : false;
    if (!handled) {
      score = logicNumber(LOGIC.score && LOGIC.score.initialValue, 0);
      sceneIndex = 0;
      renderScene();
    }
  });

  card.appendChild(eyebrow);
  card.appendChild(headline);
  card.appendChild(copy);
  card.appendChild(scoreBox);
  card.appendChild(cta);
  card.appendChild(replay);
  layer.appendChild(card);
  root.appendChild(layer);
}

function renderScene() {
  clearTimer();
  const scene = currentScene();
  root.innerHTML = "";
  root.style.background = scene.backgroundColor || "#101014";
  root.style.backgroundImage = "none";
  if (scene.backgroundImageAssetId) {
    const bg = assetById(scene.backgroundImageAssetId);
    if (bg) {
      root.style.backgroundImage = "url(" + (bg.file || bg.dataUrl) + ")";
      root.style.backgroundSize = "cover";
      root.style.backgroundPosition = "center";
    }
  }
  renderTemplateGameplay(scene);

  const skipDesignedObjects =
    PROJECT.templateId === "tap-monster" && (scene.type === "gameplay" || scene.type === "endCard");

  if (!skipDesignedObjects) {
    PROJECT.objects
      .filter((object) => object.sceneId === scene.id)
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach((object) => {
        const el = renderObject(object);
        if (el) root.appendChild(el);
      });
  }

  renderTapMonsterEndCard(scene);

  if (scene.duration && scene.type !== "endCard" && !(scene.type === "gameplay" && LOGIC.timer && LOGIC.timer.enabled) && !(PROJECT.templateId === "tap-monster" && scene.type !== "endCard")) {
    timerId = window.setTimeout(nextScene, scene.duration * 1000);
  }
}

root.addEventListener("pointerdown", () => {
  userInteracted = true;
  playSceneStartAudio();
}, { once: true });

renderScene();`;
}

export async function exportProjectAsZip(project: PlayableProject) {
  const validation = validateProjectForExport(project);

  if (hasBlockingExportErrors(validation)) {
    throw new Error("Fix blocking export errors before generating a ZIP.");
  }

  const zip = new JSZip();
  zip.file("index.html", createIndexHtml(project));
  zip.file("playable.js", createPlayableJs(project));
  zip.file("style.css", createStyleCss(project));
  zip.file("manifest.json", createManifest(project));
  zip.file("project.json", JSON.stringify(buildExportProject(project), null, 2));
  zip.file("README_EXPORT.txt", createReadmeExport(project));

  const assetFolder = zip.folder("assets");
  project.assets.forEach((asset) => {
    const parsed = parseDataUrl(asset);
    assetFolder?.file(`${asset.id}.${parsed.extension}`, parsed.data, { base64: true });
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  const fileName = `${safeFileName(project.name) || "playable-export"}.zip`;
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);

  return { fileName, bytes: blob.size };
}
