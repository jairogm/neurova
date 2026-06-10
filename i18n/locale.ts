"use server";

import { cookies } from "next/headers";
import { defaultLocale, Locale, locales } from "./config";

// Persisted in a cookie. Name is read by `i18n/request.ts` on every request.
const COOKIE_NAME = "NEUROVA_LOCALE";

export async function getUserLocale(): Promise<Locale> {
  const stored = (await cookies()).get(COOKIE_NAME)?.value;
  return locales.includes(stored as Locale) ? (stored as Locale) : defaultLocale;
}

export async function setUserLocale(locale: Locale): Promise<void> {
  (await cookies()).set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
