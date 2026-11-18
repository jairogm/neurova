"use server";
import { put } from "@vercel/blob";

export async function sendInquiry(_previous: string, form: FormData) {
  const read = (name: string) => String(form.get(name) ?? "").trim();
  const name = read("name"), email = read("email"), message = read("message");
  if (read("website")) return "sent";
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !message || message.length > 3000) return "invalid";
  const received = new Date().toISOString();
  try {
    await put(`contact/${received.slice(0,10)}/${crypto.randomUUID()}.json`, JSON.stringify({ received,name,email,message }), { access: "private", contentType: "application/json" });
    return "sent";
  } catch {
    return "failed";
  }
}
