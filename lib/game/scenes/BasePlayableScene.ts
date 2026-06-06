import type { AssetUsage, PlayableProject, SceneType } from "@/types/project";
import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from "@/lib/game/phaserConfig";

export const previewCenter = {
  x: PREVIEW_WIDTH / 2,
  y: PREVIEW_HEIGHT / 2
};

export function hexToNumber(hex: string, fallback = 0x23d3ee) {
  const normalized = hex.replace("#", "");
  const parsed = Number.parseInt(normalized, 16);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getScene(project: PlayableProject, type: SceneType) {
  return project.scenes.find((scene) => scene.type === type);
}

export function getAssetByUsage(project: PlayableProject, usage: AssetUsage) {
  return project.assets.find((asset) => asset.usage === usage);
}

export function preloadPlayableAssets(scene: any, project: PlayableProject) {
  project.assets.forEach((asset) => {
    if (asset.type === "image") {
      scene.load.image(asset.id, asset.dataUrl);
    }
  });
}

export function addPlayableBackground(scene: any, Phaser: any, project: PlayableProject) {
  const backgroundAsset = getAssetByUsage(project, "background");

  if (backgroundAsset && scene.textures.exists(backgroundAsset.id)) {
    scene.add.image(previewCenter.x, previewCenter.y, backgroundAsset.id).setDisplaySize(PREVIEW_WIDTH, PREVIEW_HEIGHT);
    scene.add.rectangle(previewCenter.x, previewCenter.y, PREVIEW_WIDTH, PREVIEW_HEIGHT, 0x09090b, 0.36);
    return;
  }

  const styleColors = {
    midnightGrid: [0x09090b, 0x111827],
    sunsetArena: [0x1f1024, 0x4f1d2b],
    forestArcade: [0x071a16, 0x123323],
    cleanStudio: [0x101014, 0x25252d]
  } as const;
  const [topColor, bottomColor] = styleColors[project.settings.backgroundStyle];
  scene.add.rectangle(previewCenter.x, previewCenter.y, PREVIEW_WIDTH, PREVIEW_HEIGHT, bottomColor);
  scene.add.rectangle(previewCenter.x, 135, PREVIEW_WIDTH, 270, topColor, 0.86);

  const graphics = scene.add.graphics();
  graphics.lineStyle(1, hexToNumber(project.settings.mainColor), 0.13);
  for (let x = 0; x <= PREVIEW_WIDTH; x += 36) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, PREVIEW_HEIGHT);
  }
  for (let y = 0; y <= PREVIEW_HEIGHT; y += 36) {
    graphics.moveTo(0, y);
    graphics.lineTo(PREVIEW_WIDTH, y);
  }
  graphics.strokePath();

  scene.add.rectangle(previewCenter.x, 72, 280, 88, 0xffffff, 0.035).setStrokeStyle(1, 0xffffff, 0.08);
}

export function addTitle(scene: any, project: PlayableProject, subtitle: string) {
  scene.add
    .text(previewCenter.x, 30, project.settings.title, {
      fontFamily: "Arial",
      fontSize: "17px",
      fontStyle: "700",
      color: "#ffffff"
    })
    .setOrigin(0.5, 0);

  scene.add
    .text(previewCenter.x, 56, subtitle, {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#a8adb7"
    })
    .setOrigin(0.5, 0);
}

export function addHud(scene: any, project: PlayableProject) {
  const scoreText = scene.add.text(18, 92, "Score 0", {
    fontFamily: "Arial",
    fontSize: "15px",
    fontStyle: "700",
    color: "#ffffff"
  });
  const timerText = scene.add.text(PREVIEW_WIDTH - 18, 92, `${project.settings.duration}s`, {
    fontFamily: "Arial",
    fontSize: "15px",
    fontStyle: "700",
    color: "#ffffff"
  });
  timerText.setOrigin(1, 0);

  return { scoreText, timerText };
}

export function addCtaButton(scene: any, project: PlayableProject, y = 455) {
  const button = scene.add
    .rectangle(previewCenter.x, y, 230, 56, hexToNumber(project.settings.mainColor), 1)
    .setInteractive({ useHandCursor: true })
    .setStrokeStyle(2, 0xffffff, 0.16);
  const label = scene.add
    .text(previewCenter.x, y, project.settings.ctaText || "Learn More", {
      fontFamily: "Arial",
      fontSize: "18px",
      fontStyle: "900",
      color: "#071014"
    })
    .setOrigin(0.5);

  button.on("pointerdown", () => {
    if (typeof window !== "undefined" && project.settings.ctaUrl) {
      window.location.href = project.settings.ctaUrl;
    }
  });

  return { button, label };
}

export function addEndCard(scene: any, project: PlayableProject, score: number) {
  scene.add.rectangle(previewCenter.x, previewCenter.y, 300, 360, 0x09090b, 0.84).setStrokeStyle(1, 0xffffff, 0.15);
  scene.add
    .text(previewCenter.x, 210, project.settings.endCardTitle, {
      fontFamily: "Arial",
      fontSize: "28px",
      fontStyle: "900",
      align: "center",
      color: "#ffffff",
      wordWrap: { width: 270 }
    })
    .setOrigin(0.5);
  scene.add
    .text(previewCenter.x, 270, `Score ${score} / ${project.settings.targetScore}`, {
      fontFamily: "Arial",
      fontSize: "17px",
      fontStyle: "700",
      color: "#d4d4d8"
    })
    .setOrigin(0.5);
  scene.add
    .text(previewCenter.x, 322, project.settings.endCardSubtitle, {
      fontFamily: "Arial",
      fontSize: "14px",
      align: "center",
      color: "#a8adb7",
      wordWrap: { width: 250 }
    })
    .setOrigin(0.5);
  addCtaButton(scene, project, 420);
}

export function createPreviewTimer(
  scene: any,
  project: PlayableProject,
  timerText: any,
  onComplete: () => void
) {
  let remaining = project.settings.duration;
  timerText.setText(`${remaining}s`);

  scene.time.addEvent({
    delay: 1000,
    loop: true,
    callback: () => {
      remaining -= 1;
      timerText.setText(`${Math.max(remaining, 0)}s`);

      if (remaining <= 0) {
        onComplete();
      }
    }
  });
}

export function difficultySpeed(project: PlayableProject) {
  if (project.settings.difficulty === "hard") {
    return 1.35;
  }

  if (project.settings.difficulty === "easy") {
    return 0.82;
  }

  return 1;
}

export function addUsageImage(
  scene: any,
  project: PlayableProject,
  usage: AssetUsage,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const asset = getAssetByUsage(project, usage);

  if (!asset || !scene.textures.exists(asset.id)) {
    return null;
  }

  return scene.add.image(x, y, asset.id).setDisplaySize(width, height);
}
