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

interface CannonUnit {
  body: any;
  label: any;
  level: number;
}

interface EnemyUnit {
  body: any;
  label: any;
  hp: number;
}

export function createMergeCannonScene(Phaser: any, project: PlayableProject) {
  return class MergeCannonScene extends Phaser.Scene {
    private cannons: CannonUnit[] = [];
    private enemies: EnemyUnit[] = [];
    private score = 0;
    private ended = false;
    private scoreText: any;
    private activeCannon: CannonUnit | null = null;
    private mergeHint: any;

    constructor() {
      super("MergeCannonScene");
    }

    preload() {
      preloadPlayableAssets(this, project);
    }

    create() {
      // Phaser scenes are built in create(): background first, then UI, then game objects.
      addPlayableBackground(this, Phaser, project);
      addTitle(this, project, "Drag matching cannons together. They fire automatically.");
      const hud = addHud(this, project);
      this.scoreText = hud.scoreText;
      this.add.rectangle(PREVIEW_WIDTH / 2, 528, 320, 128, 0xffffff, 0.07).setStrokeStyle(1, 0xffffff, 0.1);
      this.createCannon(95, 530, 1);
      this.createCannon(180, 530, 1);
      this.createCannon(265, 530, 2);
      this.mergeHint = this.add
        .text(PREVIEW_WIDTH / 2, 604, "Drag L1 onto L1 to merge", {
          fontFamily: "Arial",
          fontSize: "12px",
          fontStyle: "700",
          color: "#dbeafe"
        })
        .setOrigin(0.5);

      // Drag events are the core player input for this template.
      this.input.on("dragstart", (_pointer: any, body: any) => {
        const cannon = this.cannons.find((item) => item.body === body);

        if (!cannon || this.ended) {
          return;
        }

        this.activeCannon = cannon;
        cannon.body.setDepth(30);
        cannon.label.setDepth(31);
      });

      this.input.on("drag", (_pointer: any, body: any, dragX: number, dragY: number) => {
        const cannon = this.cannons.find((item) => item.body === body);

        if (!cannon || this.ended) {
          return;
        }

        this.activeCannon = cannon;
        cannon.body.setPosition(Phaser.Math.Clamp(dragX, 34, PREVIEW_WIDTH - 34), Phaser.Math.Clamp(dragY, 150, 585));
        cannon.label.setPosition(cannon.body.x, cannon.body.y);
      });

      this.input.on("dragend", (_pointer: any, body: any) => {
        const cannon = this.cannons.find((item) => item.body === body);
        this.activeCannon = this.activeCannon ?? cannon ?? null;
        this.tryMergeActiveCannon();
        if (cannon && this.cannons.includes(cannon)) {
          cannon.body.setDepth(1);
          cannon.label.setDepth(2);
        }
        this.activeCannon = null;
      });

      // Repeating timer events keep spawning enemies and firing cannons without player taps.
      this.time.addEvent({
        delay: Math.round(1050 / difficultySpeed(project)),
        loop: true,
        callback: () => {
          if (!this.ended) {
            this.spawnEnemy();
          }
        }
      });
      this.time.addEvent({
        delay: 430,
        loop: true,
        callback: () => {
          if (!this.ended) {
            this.fireCannons();
          }
        }
      });
      createPreviewTimer(this, project, hud.timerText, () => this.showEndCard());
    }

    update() {
      if (this.ended) {
        return;
      }

      // update() runs every frame. Here it only moves active enemies downward.
      this.enemies.forEach((enemy) => {
        enemy.body.y += 0.72 * difficultySpeed(project);
        enemy.label.setPosition(enemy.body.x, enemy.body.y);
      });

      this.enemies = this.enemies.filter((enemy) => {
        if (enemy.body.y > PREVIEW_HEIGHT + 30) {
          enemy.body.destroy();
          enemy.label.destroy();
          return false;
        }

        return true;
      });
    }

    private createCannon(x: number, y: number, level: number) {
      // Uploaded player art can replace the generated cannon circle.
      const uploadedBody = addUsageImage(this, project, "player", x, y, 52 + level * 8, 52 + level * 8);
      const body =
        uploadedBody ??
        this.add
          .circle(x, y, 24 + level * 3, hexToNumber(project.settings.mainColor))
          .setStrokeStyle(3, hexToNumber(project.settings.accentColor), 0.72);
      body.setInteractive({ draggable: true, useHandCursor: true });
      const label = this.add
        .text(x, y, `L${level}`, {
          fontFamily: "Arial",
          fontSize: "14px",
          fontStyle: "900",
          color: "#071014"
        })
        .setOrigin(0.5);
      this.input.setDraggable(body);
      this.cannons.push({ body, label, level });
    }

    private tryMergeActiveCannon() {
      // Merging is just a distance check plus a same-level check.
      if (!this.activeCannon) {
        return;
      }

      const source = this.activeCannon;
      const match = this.cannons
        .filter((cannon) => cannon !== source && cannon.level === source.level)
        .sort(
          (a, b) =>
            Phaser.Math.Distance.Between(a.body.x, a.body.y, source.body.x, source.body.y) -
            Phaser.Math.Distance.Between(b.body.x, b.body.y, source.body.x, source.body.y)
        )[0];

      const mergeDistance = match
        ? Phaser.Math.Distance.Between(match.body.x, match.body.y, source.body.x, source.body.y)
        : Number.POSITIVE_INFINITY;

      if (!match || mergeDistance > 86) {
        this.showMergeFeedback(source.body.x, source.body.y - 46, "Need same level", 0xfbbf24);
        return;
      }

      source.body.setPosition(match.body.x, match.body.y);
      source.label.setPosition(match.body.x, match.body.y);
      match.level += 1;
      if (typeof match.body.setRadius === "function") {
        match.body.setRadius(24 + match.level * 3);
      } else {
        match.body.setDisplaySize(52 + match.level * 8, 52 + match.level * 8);
      }
      match.label.setText(`L${match.level}`);
      match.label.setPosition(match.body.x, match.body.y);
      source.body.destroy();
      source.label.destroy();
      this.cannons = this.cannons.filter((cannon) => cannon !== source);
      this.score += 10;
      this.scoreText.setText(`Score ${this.score}`);
      this.showMergeFeedback(match.body.x, match.body.y - 48, `Merged L${match.level}`, hexToNumber(project.settings.accentColor));
      this.tweens.add({
        targets: [match.body, match.label],
        scale: { from: 1.2, to: 1 },
        duration: 180,
        ease: "Back.Out"
      });
      this.mergeHint?.setText("Nice merge. Higher levels hit harder.");
    }

    private showMergeFeedback(x: number, y: number, text: string, color: number) {
      const bubble = this.add
        .rectangle(x, y, Math.max(104, text.length * 8), 26, color, 0.88)
        .setStrokeStyle(1, 0xffffff, 0.24)
        .setDepth(79);
      const feedback = this.add
        .text(x, y, text, {
          fontFamily: "Arial",
          fontSize: "13px",
          fontStyle: "900",
          color: "#ffffff"
        })
        .setOrigin(0.5)
        .setDepth(80);

      this.tweens.add({
        targets: [feedback, bubble],
        y: y - 24,
        alpha: 0,
        duration: 720,
        ease: "Quad.Out",
        onComplete: () => {
          feedback.destroy();
          bubble.destroy();
        }
      });
    }

    private spawnEnemy() {
      // Enemies use simple HP so beginners can see how score rewards are triggered.
      const x = Phaser.Math.Between(42, PREVIEW_WIDTH - 42);
      const hp = project.settings.difficulty === "hard" ? 5 : project.settings.difficulty === "easy" ? 2 : 3;
      const uploadedBody = addUsageImage(this, project, "enemy", x, 126, 42, 42);
      const body =
        uploadedBody ?? this.add.circle(x, 126, 19, 0xfb7185).setStrokeStyle(2, 0xffffff, 0.15);
      const label = this.add
        .text(x, 126, String(hp), {
          fontFamily: "Arial",
          fontSize: "13px",
          fontStyle: "900",
          color: "#ffffff"
        })
        .setOrigin(0.5);
      this.enemies.push({ body, label, hp });
    }

    private fireCannons() {
      // Each cannon targets the closest enemy above it, then draws a short fading beam.
      this.cannons.forEach((cannon) => {
        const target = this.enemies
          .filter((enemy) => enemy.body.y < cannon.body.y)
          .sort(
            (a, b) =>
              Phaser.Math.Distance.Between(cannon.body.x, cannon.body.y, a.body.x, a.body.y) -
              Phaser.Math.Distance.Between(cannon.body.x, cannon.body.y, b.body.x, b.body.y)
          )[0];

        if (!target) {
          return;
        }

        const beam = this.add
          .line(0, 0, cannon.body.x, cannon.body.y - 18, target.body.x, target.body.y + 18, hexToNumber(project.settings.accentColor), 0.75)
          .setOrigin(0, 0);
        this.tweens.add({ targets: beam, alpha: 0, duration: 160, onComplete: () => beam.destroy() });
        target.hp -= cannon.level;
        target.label.setText(String(Math.max(0, target.hp)));

        if (target.hp <= 0) {
          target.body.destroy();
          target.label.destroy();
          this.enemies = this.enemies.filter((enemy) => enemy !== target);
          this.score += 5;
          this.scoreText.setText(`Score ${this.score}`);
        }
      });
    }

    private showEndCard() {
      // The timer calls this once to stop gameplay and show the CTA screen.
      if (this.ended) {
        return;
      }

      this.ended = true;
      addEndCard(this, project, this.score);
    }
  };
}
