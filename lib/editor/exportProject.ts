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

    return {
      ...asset,
      file: `assets/${asset.id}.${parsed.extension}`
    };
  });

  return {
    ...project,
    assets
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
let sceneIndex = 0;
let score = 0;
let timerId = null;
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

function clearTimer() {
  if (timerId) window.clearTimeout(timerId);
  timerId = null;
}

function setSceneById(sceneId) {
  const nextIndex = PROJECT.scenes.findIndex((scene) => scene.id === sceneId);
  if (nextIndex >= 0) {
    sceneIndex = nextIndex;
    renderScene();
  }
}

function nextScene() {
  sceneIndex = Math.min(sceneIndex + 1, PROJECT.scenes.length - 1);
  renderScene();
}

function runAction(action) {
  userInteracted = true;
  playSceneStartAudio();
  if (!action || action.type === "none") return;
  if (action.type === "nextScene" && action.targetSceneId) setSceneById(action.targetSceneId);
  if (action.type === "startGame") {
    const gameplay = PROJECT.scenes.find((scene) => scene.type === "gameplay");
    if (gameplay) setSceneById(gameplay.id);
  }
  if (action.type === "openUrl") window.location.href = action.url || PROJECT.settings.ctaUrl || "#";
  if (action.type === "replay") {
    sceneIndex = 0;
    score = 0;
    renderScene();
  }
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
    const src = props.src || (asset && asset.dataUrl);
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

  if (object.type === "button" || object.type === "ctaButton") {
    const button = document.createElement("button");
    button.textContent = props.label || "Button";
    button.style.background = props.backgroundColor || PROJECT.settings.mainColor;
    button.style.color = props.textColor || "#071014";
    button.style.borderRadius = (props.borderRadius || 12) + "px";
    button.addEventListener("click", () => runAction(props.action || (object.actions && object.actions[0])));
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
  const src = props.src || (asset && asset.dataUrl);
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
  const hud = document.createElement("div");
  hud.className = "hud";
  hud.textContent = "Score " + score;
  layer.appendChild(hud);

  function updateScore(nextScore) {
    score = Math.max(0, nextScore);
    hud.textContent = "Score " + score;
  }

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
    const target = document.createElement("button");
    target.className = "tap-target";
    target.textContent = "TAP";
    target.style.left = "130px";
    target.style.top = "280px";
    target.style.width = "100px";
    target.style.height = "100px";
    target.addEventListener("click", () => {
      updateScore(score + 1);
      target.style.left = 40 + Math.random() * 220 + "px";
      target.style.top = 140 + Math.random() * 330 + "px";
      showFeedback("+1 tap");
    });
    layer.appendChild(target);
  }

  if (PROJECT.templateId === "gem-collector") {
    function spawnGem(index) {
      const gem = document.createElement("button");
      const value = index % 3 === 0 ? 10 : 5;
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
        spawnGem(index + 1);
      });
      layer.appendChild(gem);
    }

    for (let index = 0; index < 6; index += 1) {
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
      if (label === "+10") updateScore(score + 10);
      if (label === "x2") updateScore(Math.max(2, score * 2));
      if (label === "-5") updateScore(score - 5);
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
    ["+10", "x2", "-5"].forEach((label, index) => {
      const gate = document.createElement("div");
      gate.className = "gate";
      gate.textContent = label;
      gate.style.left = 40 + index * 105 + "px";
      gate.style.top = "420px";
      gate.style.background = label.startsWith("-") ? "#fb7185" : PROJECT.settings.accentColor;
      gate.addEventListener("click", () => applyGate(gate, label));
      gates.push(gate);
      layer.appendChild(gate);
    });
    layer.appendChild(player);
  }

  if (PROJECT.templateId === "merge-cannon") {
    let active = null;
    const cannons = [];

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

function renderScene() {
  clearTimer();
  const scene = currentScene();
  root.innerHTML = "";
  root.style.background = scene.backgroundColor || "#101014";
  root.style.backgroundImage = "none";
  if (scene.backgroundImageAssetId) {
    const bg = assetById(scene.backgroundImageAssetId);
    if (bg) {
      root.style.backgroundImage = "url(" + bg.dataUrl + ")";
      root.style.backgroundSize = "cover";
      root.style.backgroundPosition = "center";
    }
  }
  renderTemplateGameplay(scene);

  PROJECT.objects
    .filter((object) => object.sceneId === scene.id)
    .sort((a, b) => a.zIndex - b.zIndex)
    .forEach((object) => {
      const el = renderObject(object);
      if (el) root.appendChild(el);
    });

  if (scene.duration && scene.type !== "endCard") {
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
