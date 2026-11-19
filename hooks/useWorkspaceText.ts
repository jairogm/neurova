import { useLocale } from "next-intl";
import { workspaceText } from "@/i18n/workspace";

export function useWorkspaceText() {
  return workspaceText(useLocale());
}
