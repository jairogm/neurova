import spanish from "@/messages/workspace-es.json";

const englishText = (text: string) => text;
const spanishText = (text: string) =>
  Object.prototype.hasOwnProperty.call(spanish, text) ? spanish[text as keyof typeof spanish] : text;

/** Translate interface copy. Patient-entered text must pass through unchanged. */
export function workspaceText(locale: string) {
  return locale === "es" ? spanishText : englishText;
}
