import type { PlayableProject } from "@/types/project";
import {
  addHud,
  addPlayableBackground,
  addTitle,
  createPreviewTimer,
  hexToNumber,
  preloadPlayableAssets
} from "@/lib/game/scenes/BasePlayableScene";
import { PREVIEW_WIDTH } from "@/lib/game/phaserConfig";

type FlowStep = "intro" | "offer" | "end";

export function createCtaFlowScene(Phaser: any, project: PlayableProject) {
  return class CtaFlowScene extends Phaser.Scene {
    private step: FlowStep = project.templateId === "simple-end-card" ? "end" : "intro";
    private score = 0;
    private scoreText: any;
    private screenGroup: any;

    constructor() {
      super("CtaFlowScene");
    }

    preload() {
      preloadPlayableAssets(this, project);
    }

    create() {
      addPlayableBackground(this, Phaser, project);
      addTitle(this, project, "Tap the buttons to test scene flow and CTA clarity.");
      const hud = addHud(this, project);
      this.scoreText = hud.scoreText;
      this.renderStep();
      createPreviewTimer(this, project, hud.timerText, () => this.showEndStep());
    }

    private renderStep() {
      this.screenGroup?.destroy(true);
      this.screenGroup = this.add.container(0, 0);

      if (this.step === "intro") {
        this.renderIntroStep();
        return;
      }

      if (this.step === "offer") {
        this.renderOfferStep();
        return;
      }

      this.renderEndStep();
    }

    private renderIntroStep() {
      this.addPanel(185, 300, 300, 310, 0xffffff, 0.08);
      this.addText(project.settings.introTitle, 180, 215, 28, "#ffffff", 270);
      this.addText(project.settings.introSubtitle, 180, 292, 14, "#cbd5e1", 250);
      this.addButton(180, 430, project.settings.playButtonText || "Play", () => {
        this.score += 10;
        this.scoreText.setText(`Score ${this.score}`);
        this.step = "offer";
        this.renderStep();
      });
    }

    private renderOfferStep() {
      this.addPanel(180, 312, 304, 352, 0xffffff, 0.08);
      this.addText("One clear promise", 180, 184, 25, "#ffffff", 270);
      this.addText("Preview scene transitions, offer copy, and CTA timing without leaving the local simulator.", 180, 252, 14, "#cbd5e1", 252);

      [
        ["Fast hook", project.settings.mainColor],
        ["Simple action", project.settings.accentColor],
        ["Clear reward", "#fbbf24"]
      ].forEach(([label, color], index) => {
        const y = 328 + index * 48;
        const pill = this.add
          .rectangle(180, y, 214, 34, hexToNumber(color), 0.92)
          .setStrokeStyle(1, 0xffffff, 0.18);
        const text = this.add
          .text(180, y, label, {
            fontFamily: "Arial",
            fontSize: "13px",
            fontStyle: "900",
            color: "#071014"
          })
          .setOrigin(0.5);
        this.screenGroup.add([pill, text]);
      });

      this.addButton(180, 512, "Show CTA", () => this.showEndStep());
    }

    private showEndStep() {
      if (this.step === "end") {
        return;
      }

      this.step = "end";
      this.renderStep();
    }

    private renderEndStep() {
      this.addPanel(180, 322, 306, 390, 0x09090b, 0.76);
      this.addText(project.settings.endCardTitle, 180, 200, 28, "#ffffff", 270);
      this.addText(project.settings.endCardSubtitle, 180, 274, 14, "#cbd5e1", 252);

      const mockImage = this.add
        .rectangle(180, 348, 104, 82, hexToNumber(project.settings.mainColor), 0.22)
        .setStrokeStyle(2, hexToNumber(project.settings.accentColor), 0.8);
      const mockLabel = this.add
        .text(180, 348, "Preview", {
          fontFamily: "Arial",
          fontSize: "14px",
          fontStyle: "900",
          color: "#ffffff"
        })
        .setOrigin(0.5);
      this.screenGroup.add([mockImage, mockLabel]);

      this.addButton(180, 462, project.settings.ctaText || "Learn More", () => {
        this.score += 25;
        this.scoreText.setText(`Score ${this.score}`);
        this.showFeedback("CTA tap recorded");
      });
    }

    private addPanel(x: number, y: number, width: number, height: number, color: number, alpha: number) {
      const panel = this.add
        .rectangle(x, y, width, height, color, alpha)
        .setStrokeStyle(1, 0xffffff, 0.18);
      this.screenGroup.add(panel);
    }

    private addText(text: string, x: number, y: number, fontSize: number, color: string, width: number) {
      const label = this.add
        .text(x, y, text, {
          fontFamily: "Arial",
          fontSize: `${fontSize}px`,
          fontStyle: fontSize >= 24 ? "900" : "700",
          align: "center",
          color,
          wordWrap: { width }
        })
        .setOrigin(0.5);
      this.screenGroup.add(label);
    }

    private addButton(x: number, y: number, label: string, onClick: () => void) {
      const button = this.add
        .rectangle(x, y, 224, 54, hexToNumber(project.settings.mainColor), 1)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0xffffff, 0.18);
      const text = this.add
        .text(x, y, label, {
          fontFamily: "Arial",
          fontSize: "17px",
          fontStyle: "900",
          color: "#071014"
        })
        .setOrigin(0.5);

      button.on("pointerdown", onClick);
      this.screenGroup.add([button, text]);
    }

    private showFeedback(text: string) {
      const feedback = this.add
        .text(PREVIEW_WIDTH / 2, 552, text, {
          fontFamily: "Arial",
          fontSize: "13px",
          fontStyle: "900",
          color: "#ffffff"
        })
        .setOrigin(0.5);
      this.tweens.add({
        targets: feedback,
        y: 522,
        alpha: 0,
        duration: 720,
        ease: "Quad.Out",
        onComplete: () => feedback.destroy()
      });
    }
  };
}
