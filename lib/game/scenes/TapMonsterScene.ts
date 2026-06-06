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

export function createTapMonsterScene(Phaser: any, project: PlayableProject) {
  return class TapMonsterScene extends Phaser.Scene {
    private monster: any;
    private label: any;
    private score = 0;
    private ended = false;
    private scoreText: any;

    constructor() {
      super("TapMonsterScene");
    }

    preload() {
      preloadPlayableAssets(this, project);
    }

    create() {
      // Tap Monster has the smallest learning surface: one target, one score, one timer.
      addPlayableBackground(this, Phaser, project);
      addTitle(this, project, "Tap the monster as it jumps around.");
      const hud = addHud(this, project);
      this.scoreText = hud.scoreText;
      this.createMonster();
      createPreviewTimer(this, project, hud.timerText, () => this.showEndCard());
    }

    private createMonster() {
      // Uploaded enemy art can replace the generated monster circle.
      const x = PREVIEW_WIDTH / 2;
      const y = PREVIEW_HEIGHT / 2;
      this.monster =
        addUsageImage(this, project, "enemy", x, y, 92, 92) ??
        this.add
          .circle(x, y, 44, hexToNumber(project.settings.mainColor))
          .setStrokeStyle(4, hexToNumber(project.settings.accentColor), 0.85);
      this.monster.setInteractive({ useHandCursor: true });
      this.label = this.add
        .text(x, y, "TAP", {
          fontFamily: "Arial",
          fontSize: "18px",
          fontStyle: "900",
          color: "#071014"
        })
        .setOrigin(0.5);

      // A tap increments score and moves the target somewhere new.
      this.monster.on("pointerdown", () => {
        if (this.ended) {
          return;
        }

        this.score += 1;
        this.scoreText.setText(`Score ${this.score}`);
        this.jumpMonster();
      });
    }

    private jumpMonster() {
      // Tweens animate object properties. Here both the shape and label move together.
      const x = Phaser.Math.Between(58, PREVIEW_WIDTH - 58);
      const y = Phaser.Math.Between(150, PREVIEW_HEIGHT - 150);
      this.tweens.add({
        targets: [this.monster, this.label],
        x,
        y,
        scale: { from: 0.8, to: 1 },
        duration: 190,
        ease: "Back.Out"
      });
    }

    private showEndCard() {
      // The shared timer reaches zero and switches the scene into end-card mode.
      if (this.ended) {
        return;
      }

      this.ended = true;
      addEndCard(this, project, this.score);
    }
  };
}
