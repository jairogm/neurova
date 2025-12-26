import List from "@editorjs/list";
import Image from "@editorjs/image";
import Warning from "@editorjs/warning";
import Delimiter from "@editorjs/delimiter";
import Header from "@editorjs/header";
import Underline from "@editorjs/underline";
// @ts-expect-error - Package lacks proper type definitions
import AlignmentTune from "editorjs-text-alignment-blocktune";

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

