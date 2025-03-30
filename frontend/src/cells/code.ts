import { Cell } from "./base";
import { sendCodeExecutionRequest } from "@/utils";
import { renderOutput } from "@/notebook/render";
import { EditorView } from "codemirror";
import { useNotebookStore } from "@/store";

export class CodeCell extends Cell {
  private editorView: EditorView | null = null;

  constructor(element: HTMLElement) {
    super(element);
    this.initEditor();
  }

  private initEditor() {
    const inputArea = this.element.querySelector(".input-area") as HTMLElement;
    if (!inputArea) {
      return;
    }

    const editorDom = inputArea.querySelector(".cm-editor");
    if (editorDom) {
      this.editorView = EditorView.findFromDOM(editorDom as HTMLElement);
    }
  }

  async execute() {
    if (!this.editorView) {
      return;
    }

    const code = this.editorView.state.doc.toString();

    const outputArea = this.element.querySelector(
      ".output-area",
    ) as HTMLElement;
    if (!outputArea) {
      return;
    }

    outputArea.innerHTML = "<pre>Running...</pre>";
    try {
      const result = await sendCodeExecutionRequest(code);

      const cellContainer = this.element.closest(".cell-container");
      if (cellContainer && cellContainer.id.startsWith("cell-")) {
        const cellId = cellContainer.id.replace("cell-", "");
        useNotebookStore.getState().updateOutputCell(cellId, result);
      }
      outputArea.innerHTML = renderOutput(result);
    } catch (error) {
      outputArea.innerHTML = "<pre>Error executing code.</pre>";
    }
  }
}
