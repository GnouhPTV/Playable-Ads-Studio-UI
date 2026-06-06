export const PREVIEW_WIDTH = 360;
export const PREVIEW_HEIGHT = 640;

export function createPhaserConfig(Phaser: any, parent: HTMLElement, scene: any) {
  return {
    type: Phaser.AUTO,
    parent,
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    backgroundColor: "#09090b",
    scene: [scene],
    input: {
      activePointers: 3
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: PREVIEW_WIDTH,
      height: PREVIEW_HEIGHT
    },
    render: {
      antialias: true,
      pixelArt: false
    }
  };
}
