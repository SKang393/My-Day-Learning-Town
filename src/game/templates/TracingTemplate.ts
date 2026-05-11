import { BaseTemplate } from "./BaseTemplate";

export class TracingTemplate extends BaseTemplate {
  mount(): void {
    this.context.root.innerHTML = `<section class="game-card"><h2>Tracing</h2><p>This reusable template will use bold visible paths paired with clear images.</p></section>`;
  }
}
