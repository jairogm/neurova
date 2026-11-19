import { createElement } from "react";
import { DraftReview, NoteToolbar, PaymentStatus } from "@/components/ClinicalControls";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const source = await readFile(join(process.cwd(), "NEUROVA.dc.html"), "utf8");
  // The demo runtime binds HTML attributes; its controls use the same
  // component markup as the authenticated React workspace.
  const { renderToStaticMarkup } = await import("react-dom/server");
  const review = renderToStaticMarkup(createElement(DraftReview, { draft: "{{ aiDraft }}" }))
    .replace(/<textarea([^>]*)>[^<]*<\/textarea>/, '<textarea$1 value="{{ aiDraft }}" onInput="{{ editAi }}"></textarea>')
    .replace('data-action="approve"', 'onClick="{{ approveAi }}"')
    .replace('data-action="discard"', 'onClick="{{ resetAi }}"');
  const payment = renderToStaticMarkup(createElement(PaymentStatus, { value: "{{ se.pay }}", demo: true }))
    .replace("<select ", '<select value="{{ se.pay }}" onChange="{{ se.setPayment }}" ');
  const toolbar = renderToStaticMarkup(createElement(NoteToolbar, { children: null })).replace("</div>", "");
  const html = source
    .replace("<!-- NOTE_TOOLBAR -->", toolbar)
    .replace("<!-- DRAFT_REVIEW -->", review)
    .replace("<!-- PAYMENT_STATUS -->", payment)
    .replace("<head>", "<head>\n<title>NEUROVA Interactive Product Demo</title>\n<link rel='icon' href='/icon.svg' type='image/svg+xml'>")
    .replace('src="./support.js"', 'src="/dc-runtime"')
    .replace(
      "</body>",
      '<a href="/" aria-label="Back to the NEUROVA website" style="position:fixed;right:16px;bottom:16px;z-index:9999;padding:9px 13px;border:1px solid rgba(255,255,255,.24);border-radius:10px;background:#0D2933;color:#EAFBF8;text-decoration:none;font:700 12px Plus Jakarta Sans,sans-serif;box-shadow:0 10px 30px rgba(8,29,37,.22)">← Back to site</a>\n</body>',
    );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
