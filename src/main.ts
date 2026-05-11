import { startPhaser } from "./game/phaser/scenes/ShellScene";
import { AppShell } from "./game/ui/AppShell";
import "./styles.css";

startPhaser();
const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Missing app root");

new AppShell(root).showSplash();
