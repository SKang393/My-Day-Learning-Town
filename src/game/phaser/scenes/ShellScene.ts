import Phaser from "phaser";

export class ShellScene extends Phaser.Scene {
  constructor() {
    super("ShellScene");
  }

  preload(): void {
    this.load.image("learning-town-background", "/assets/generated/current/imagegen-start-town-scene.png");
  }

  create(): void {
    this.scale.on("resize", this.drawTown, this);
    this.drawTown();
  }

  private drawTown(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    this.children.removeAll(true);
    const background = this.add.image(width / 2, height / 2, "learning-town-background");
    const scale = Math.max(width / background.width, height / background.height);
    background.setScale(scale);
  }
}

export function startPhaser(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: "phaser-stage",
    backgroundColor: "#f8f1da",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    scene: [ShellScene],
  });
}
