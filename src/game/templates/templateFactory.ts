import type { GameContent } from "../contentTypes";
import type { MiniGameTemplate, TemplateContext } from "./BaseTemplate";
import { ChooseOneOfThreeTemplate } from "./ChooseOneOfThreeTemplate";
import { DragIntoSlotsTemplate } from "./DragIntoSlotsTemplate";
import { DragMatchTemplate } from "./DragMatchTemplate";
import { DragSequenceTemplate } from "./DragSequenceTemplate";
import { SortBinsTemplate } from "./SortBinsTemplate";
import { TracingTemplate } from "./TracingTemplate";

export function createTemplate(content: GameContent, context: Omit<TemplateContext, "content">): MiniGameTemplate {
  const fullContext = { ...context, content };
  switch (content.template) {
    case "choose-1-of-3":
      return new ChooseOneOfThreeTemplate(fullContext);
    case "drag-match":
      return new DragMatchTemplate(fullContext);
    case "drag-into-slots":
      return new DragIntoSlotsTemplate(fullContext);
    case "drag-sequence":
      return new DragSequenceTemplate(fullContext);
    case "tracing":
      return new TracingTemplate(fullContext);
    case "sort-bins":
      return new SortBinsTemplate(fullContext);
  }
}
