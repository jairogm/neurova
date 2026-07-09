import type { OutputData } from "@editorjs/editorjs";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Warning from "@editorjs/warning";
import Delimiter from "@editorjs/delimiter";
import Header from "@editorjs/header";
import Underline from "@editorjs/underline";
// @ts-expect-error - Package lacks proper type definitions
import AlignmentTune from "editorjs-text-alignment-blocktune";

// Flatten EditorJS output into plain text (mirrors plainTextOf in convex/medical_history_notes.ts).
export function editorPlainText(data: OutputData): string {
  return (data.blocks || [])
    .map((block) => {
      const blockData = (block.data ?? {}) as { text?: string; items?: unknown[] };
      if (typeof blockData.text === "string") return blockData.text;
      if (Array.isArray(blockData.items)) {
        return blockData.items
          .map((item) => (typeof item === "string" ? item : ((item as { content?: string })?.content ?? "")))
          .join(" ");
      }
      return "";
    })
    .join("\n")
    .replace(/<[^>]+>/g, " ");
}

// Type assertion needed due to incompatible type definitions in @editorjs/header
// The Header class requires 'config' to be non-optional in its constructor,
// while EditorJS expects it to be optional. This is a known issue with the package.
export const EDITOR_TOOLS = {
  header: {
    class: Header,
    inlineToolbar: true,
    tunes: ['alignmentTune'],
  },
  list: {
    class: List,
    inlineToolbar: true,
    tunes: ['alignmentTune'],
  },
  image: Image,
  warning: Warning,
  delimiter: Delimiter,
  underline: Underline,
  alignmentTune: {
    class: AlignmentTune,
    config: {
      default: "left",
      blocks: {
        header: 'center',
        list: 'left'
      }
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

