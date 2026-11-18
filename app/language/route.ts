import { NextResponse } from "next/server";
import { setUserLocale } from "@/i18n/locale";

export async function POST(request: Request) {
  const locale = (await request.formData()).get("locale");
  if (locale !== "en" && locale !== "es") {
    return new Response("Unsupported language", { status: 400 });
  }
  await setUserLocale(locale);
  return NextResponse.redirect(new URL("/", request.url), 303);
}
