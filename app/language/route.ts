import { NextResponse } from "next/server";
import { setUserLocale } from "@/i18n/locale";

export async function POST(request: Request) {
  const locale = (await request.formData()).get("locale");
  if (locale !== "en" && locale !== "es") {
    return new Response("Unsupported language", { status: 400 });
  }
  await setUserLocale(locale);
  const referer = request.headers.get("referer") ?? "";
  const path = ["/about", "/contact", "/privacy", "/terms", "/baa", "/dpa"].find(
    (publicPath) => referer.split("?")[0] === new URL(publicPath, request.url).href,
  );
  return NextResponse.redirect(new URL(path ?? "/", request.url), 303);
}
