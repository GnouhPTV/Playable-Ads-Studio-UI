import type { PlayableProject } from "@/types/project";
import {
  addEndCard,
  addHud,
  addPlayableBackground,
  addTitle,
  addUsageImage,
  createPreviewTimer,
  difficultySpeed,
  hexToNumber,
  preloadPlayableAssets
} from "@/lib/game/scenes/BasePlayableScene";
import { PREVIEW_HEIGHT, PREVIEW_WIDTH } from "@/lib/game/phaserConfig";

interface GateUnit {
  group: any;
  label: string;
}

export function createRunnerGateScene(Phaser: any, project: PlayableProject) {
  return class RunnerGateScene extends Phaser.Scene {
    private player: any;
    private gates: GateUnit[] = [];
    private gems: any[] = [];
    private score = 0;
    private ended = false;
    private scoreText: any;

    constructor() {
      super("RunnerGateScene");
    }

    preload() {
      preloadPlayableAssets(this, project);
    }

    create() {
      // The runner preview is a tiny lane game: background, HUD, lanes, then player.
      addPlayableBackground(this, Phaser, project);
      addTitle(this, project, "Drag left and right. Gates change your score.");
      const hud = addHud(this, project);
      this.scoreText = hud.scoreText;
      this.addLaneLines();
      this.player =
        addUsageImage(this, project, "player", PREVIEW_WIDTH / 2, 520, 58, 58) ??
        this.add
          .circle(PREVIEW_WIDTH / 2, 520, 25, hexToNumber(project.settings.mainColor))
          .setStrokeStyle(3, hexToNumber(project.settings.accentColor), 0.8);

      // Pointer movement updates only the X position, which keeps the game beginner-friendly.
      this.input.on("pointermove", (pointer: any) => {
        if (!pointer.isDown || this.ended) {
          return;
        }

        this.player.x = Phaser.Math.Clamp(pointer.x, 34, PREVIEW_WIDTH - 34);
      });

      // Two timers create the running illusion: gates and gems fall toward the player.
      this.time.addEvent({
        delay: Math.round(980 / difficultySpeed(project)),
        loop: true,
        callback: () => {
          if (!this.ended) {
            this.spawnGate();
          }
        }
      });
      this.time.addEvent({
        delay: 760,
        loop: true,
        callback: () => {
          if (!this.ended) {
            this.spawnGem();
          }
        }
      });
      createPreviewTimer(this, project, hud.timerText, () => this.showEndCard());
    }

    update() {
      if (this.ended) {
        return;
      }

      // update() moves objects, then checks collisions, then removes old objects.
      const speed = 2.4 * difficultySpeed(project);
      this.gates.forEach((gate) => {
        gate.group.y += speed;
      });
      this.gems.forEach((gem) => {
        gem.y += speed + 0.6;
      });

      this.checkGateCollisions();
      this.checkGemCollisions();
      this.cleanup();
    }

    private addLaneLines() {
      // Lane lines are visual guidance; they do not affect collision logic.
      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0xffffff, 0.12);
      [90, 180, 270].forEach((x) => {
        graphics.moveTo(x, 120);
        graphics.lineTo(x, PREVIEW_HEIGHT);
      });
      graphics.strokePath();
    }

    private spawnGate() {
      // Gate labels are the rule system: add points, multiply points, or subtract points.
      const labels = ["+10", "x2", "-5"];
      const label = labels[Phaser.Math.Between(0, labels.length - 1)];
      const x = [82, 180, 278][Phaser.Math.Between(0, 2)];
      const positive = !label.startsWith("-");
      const box = this.add.rectangle(0, 0, 76, 44, positive ? hexToNumber(project.settings.mainColor) : 0xfb7185);
      const text = this.add
        .text(0, 0, label, {
          fontFamily: "Arial",
          fontSize: "18px",
          fontStyle: "900",
          color: "#071014"
        })
        .setOrigin(0.5);
      const group = this.add.container(x, 128, [box, text]);
      this.gates.push({ group, label });
    }

    private spawnGem() {
      const gem = this.add.circle(Phaser.Math.Between(42, PREVIEW_WIDTH - 42), 100, 10, hexToNumber(project.settings.accentColor));
      this.gems.push(gem);
    }

    private checkGateCollisions() {
      // This simple rectangle-style overlap teaches the core idea behind collision checks.
      this.gates = this.gates.filter((gate) => {
        const hit =
          Math.abs(gate.group.x - this.player.x) < 46 &&
          Math.abs(gate.group.y - this.player.y) < 32;

        if (!hit) {
          return true;
        }

        if (gate.label === "+10") {
          this.score += 10;
        } else if (gate.label === "x2") {
          this.score = Math.max(2, this.score * 2);
        } else {
          this.score = Math.max(0, this.score - 5);
        }

        this.scoreText.setText(`Score ${this.score}`);
        gate.group.destroy();
        return false;
      });
    }

    private checkGemCollisions() {
      this.gems = this.gems.filter((gem) => {
        const hit = Phaser.Math.Distance.Between(gem.x, gem.y, this.player.x, this.player.y) < 30;

        if (!hit) {
          return true;
        }

        this.score += 3;
        this.scoreText.setText(`Score ${this.score}`);
        gem.destroy();
        return false;
      });
    }

    private cleanup() {
      this.gates = this.gates.filter((gate) => {
        if (gate.group.y > PREVIEW_HEIGHT + 60) {
          gate.group.destroy();
          return false;
        }

        return true;
      });
      this.gems = this.gems.filter((gem) => {
        if (gem.y > PREVIEW_HEIGHT + 40) {
          gem.destroy();
          return false;
        }

        return true;
      });
    }

    private showEndCard() {
      // The end card pauses scoring and presents the CTA.
      if (this.ended) {
        return;
      }

      this.ended = true;
      addEndCard(this, project, this.score);
    }
  };
}
