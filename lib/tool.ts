import type EditorJS from "@editorjs/editorjs";
import type { EditorConfig, OutputData } from "@editorjs/editorjs";

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

/**
 * Instantiate EditorJS in the browser.
 *
 * Both the editor core and the block plugins read `window` at module scope, so
 * they must never land in the server module graph — a "use client" component is
 * still evaluated on the server during SSR. Loading them through dynamic
 * `import()` from inside an effect keeps evaluation client-side.
 *
 * `tools` defaults to EDITOR_TOOLS and can be overridden per call site.
 */
export async function createEditor(config: Omit<EditorConfig, "tools"> & Pick<Partial<EditorConfig>, "tools">): Promise<EditorJS> {
  const [{ default: EditorJSClass }, { EDITOR_TOOLS }] = await Promise.all([
    import("@editorjs/editorjs"),
    import("./editor-tools"),
  ]);
  const spanish = document.documentElement.lang === "es";
  return new EditorJSClass({
    tools: EDITOR_TOOLS,
    i18n: spanish ? { messages: {
      ui: {
        blockTunes: { toggler: { "Click to tune": "Opciones del bloque", "or drag to move": "o arrastra para mover" } },
        inlineToolbar: { converter: { "Convert to": "Convertir en" } },
        toolbar: { toolbox: { Add: "Añadir" } },
        popover: { Filter: "Filtrar", "Nothing found": "Sin resultados" },
      },
      toolNames: { Text: "Texto", Heading: "Encabezado", List: "Lista", Warning: "Advertencia", Image: "Imagen", Delimiter: "Separador", Bold: "Negrita", Italic: "Cursiva", Link: "Enlace", Underline: "Subrayado", "Unordered List": "Lista con viñetas", "Ordered List": "Lista numerada", Checklist: "Lista de tareas" },
      tools: { link: { "Add a link": "Añadir un enlace" }, warning: { Title: "Título", Message: "Mensaje" } },
      blockTunes: { delete: { Delete: "Eliminar", "Click to delete": "Confirmar eliminación" }, moveUp: { "Move up": "Subir" }, moveDown: { "Move down": "Bajar" } },
    } } : undefined,
    ...config,
  });
}

/** Tear an editor down safely — destroy() throws if called before it is ready. */
export function destroyEditor(editor: EditorJS | null | undefined): void {
  if (!editor?.destroy) return;
  Promise.resolve(editor.isReady)
    .then(() => editor.destroy())
    .catch(() => {});
}
