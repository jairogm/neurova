export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Display names for the language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
};
