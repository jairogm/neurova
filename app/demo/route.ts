import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const embedded = new URL(request.url).searchParams.get("embed") === "1";
  const source = await readFile(join(process.cwd(), "NEUROVA.dc.html"), "utf8");
  const html = source
    .replace("<head>", "<head>\n<title>NEUROVA Interactive Product Demo</title>")
    .replace('src="./support.js"', 'src="/dc-runtime"')
    .replace(
      "</body>",
      embedded ? '</body>' : '<a href="/" aria-label="Back to the NEUROVA website" style="position:fixed;right:16px;bottom:16px;z-index:9999;padding:9px 13px;border:1px solid rgba(255,255,255,.24);border-radius:10px;background:#0D2933;color:#EAFBF8;text-decoration:none;font:700 12px Plus Jakarta Sans,sans-serif;box-shadow:0 10px 30px rgba(8,29,37,.22)">← Back to site</a>\n</body>',
    );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
