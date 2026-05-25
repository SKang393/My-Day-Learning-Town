import { startPhaser } from "./game/phaser/scenes/ShellScene";
import { AppShell } from "./game/ui/AppShell";
import { resolveAssetPath } from "./game/systems/assetPath";
import "./styles.css";

document.documentElement.style.setProperty(
  "--town-background-image",
  `url("${resolveAssetPath("/assets/generated/current/home-town-background.png")}")`,
);

if (window.location.protocol !== "file:") {
  startPhaser();
}
const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing app root");

new AppShell(root).showSplash();
