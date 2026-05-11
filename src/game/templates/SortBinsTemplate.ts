import { BaseTemplate } from "./BaseTemplate";

export class SortBinsTemplate extends BaseTemplate {
  mount(): void {
    this.context.root.innerHTML = `<section class="game-card"><h2>Sort Into Bins</h2><p>This reusable template will sort familiar objects into two or three high-contrast bins.</p></section>`;
  }
}
