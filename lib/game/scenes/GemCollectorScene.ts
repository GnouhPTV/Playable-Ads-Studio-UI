import type { PlayableProject } from "@/types/project";
import {
  addEndCard,
  addHud,
  addPlayableBackground,
  addTitle,
  addUsageImage,
  createPreviewTimer,
  hexToNumber,
  preloadPlayableAssets
} from "@/lib/game/scenes/BasePlayableScene";
import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from "@/lib/game/phaserConfig";

interface GemUnit {
  body: any;
  value: number;
}

export function createGemCollectorScene(Phaser: any, project: PlayableProject) {
  return class GemCollectorScene extends Phaser.Scene {
    private gems: GemUnit[] = [];
    private score = 0;
    private ended = false;
    private scoreText: any;

    constructor() {
      super("GemCollectorScene");
    }

    preload() {
      preloadPlayableAssets(this, project);
    }

    create() {
      addPlayableBackground(this, Phaser, project);
      addTitle(this, project, "Tap glowing gems before the timer ends.");
      const hud = addHud(this, project);
      this.scoreText = hud.scoreText;

      this.add
        .text(PREVIEW_WIDTH / 2, 584, "Bonus gems respawn after every tap", {
          fontFamily: "Arial",
          fontSize: "12px",
          fontStyle: "700",
          color: "#dbeafe"
        })
        .setOrigin(0.5);

      for (let index = 0; index < 6; index += 1) {
        this.spawnGem(index < 2 ? 10 : 5);
      }

      this.time.addEvent({
        delay: 1250,
        loop: true,
        callback: () => {
          if (!this.ended && this.gems.length < 8) {
            this.spawnGem(5);
          }
        }
      });

      createPreviewTimer(this, project, hud.timerText, () => this.showEndCard());
    }

    private spawnGem(value: number) {
      const x = Phaser.Math.Between(48, PREVIEW_WIDTH - 48);
      const y = Phaser.Math.Between(148, PREVIEW_HEIGHT - 118);
      const uploadedBody = addUsageImage(this, project, "prop", x, y, 36, 36);
      const body =
        uploadedBody ??
        this.add
          .polygon(x, y, [0, -18, 16, 0, 0, 18, -16, 0], hexToNumber(project.settings.accentColor), 0.96)
          .setStrokeStyle(2, 0xffffff, 0.42);

      body.setInteractive({ useHandCursor: true });
      this.tweens.add({
        targets: body,
        scale: { from: 0.86, to: 1.08 },
        yoyo: true,
        repeat: -1,
        duration: Phaser.Math.Between(520, 760),
        ease: "Sine.InOut"
      });

      const gem: GemUnit = { body, value };
      body.on("pointerdown", () => this.collectGem(gem));
      this.gems.push(gem);
    }

    private collectGem(gem: GemUnit) {
      if (this.ended || !this.gems.includes(gem)) {
        return;
      }

      this.score += gem.value;
      this.scoreText.setText(`Score ${this.score}`);
      this.showFloatingScore(gem.body.x, gem.body.y, `+${gem.value}`);
      this.gems = this.gems.filter((item) => item !== gem);
      this.tweens.killTweensOf(gem.body);
      this.tweens.add({
        targets: gem.body,
        scale: 1.6,
        alpha: 0,
        duration: 180,
        ease: "Quad.Out",
        onComplete: () => {
          gem.body.destroy();
          if (!this.ended) {
            this.spawnGem(Phaser.Math.Between(0, 4) === 0 ? 10 : 5);
          }
        }
      });
    }

    private showFloatingScore(x: number, y: number, text: string) {
      const feedback = this.add
        .text(x, y - 22, text, {
          fontFamily: "Arial",
          fontSize: "16px",
          fontStyle: "900",
          color: "#ffffff"
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: feedback,
        y: y - 58,
        alpha: 0,
        duration: 620,
        ease: "Quad.Out",
        onComplete: () => feedback.destroy()
      });
    }

    private showEndCard() {
      if (this.ended) {
        return;
      }

      this.ended = true;
      this.gems.forEach((gem) => gem.body.destroy());
      this.gems = [];
      addEndCard(this, project, this.score);
    }
  };
}
