"use client";
import { useActionState, useState } from "react";
import { sendInquiry } from "./actions";

export function ContactForm({ es }: { es: boolean }) {
  const [status, action, pending] = useActionState(sendInquiry, "");
  const [fields, setFields] = useState({ name:"",email:"",message:"" });
  const input = "mt-1 block w-full rounded-lg border border-[#abc6ca] bg-white p-3 font-normal";
  if (status === "sent") return <p role="status" className="mt-6 rounded-xl bg-[#dcefe8] p-5">{es ? "Recibimos tu mensaje. Gracias por escribirnos." : "We received your message. Thanks for getting in touch."}</p>;
  return <form action={action} className="mt-6 grid gap-5 rounded-2xl border border-[#cfdddf] bg-white p-6">
    <label>{es?"Nombre":"Name"}<input name="name" required maxLength={120} autoComplete="name" className={input} value={fields.name} onChange={e=>setFields({...fields,name:e.target.value})}/></label>
    <label>{es?"Correo electrónico":"Email"}<input name="email" required type="email" maxLength={254} autoComplete="email" className={input} value={fields.email} onChange={e=>setFields({...fields,email:e.target.value})}/></label>
    <label>{es?"Mensaje":"Message"}<textarea name="message" required maxLength={3000} rows={5} className={input} value={fields.message} onChange={e=>setFields({...fields,message:e.target.value})}/></label>
    <input name="website" tabIndex={-1} autoComplete="off" hidden />
    <p className="text-sm">{es?"Para proteger la privacidad, omite los datos de pacientes.":"For privacy, leave patient details out of your message."}</p>
    {status && <p role="alert">{status==="invalid"?(es?"Revisa los campos del formulario.":"Please check the form fields."):(es?"No pudimos recibir el mensaje. Inténtalo de nuevo o usa el correo de soporte.":"Your message didn’t go through. Try again or use the support email below.")}</p>}
    <button disabled={pending} className="justify-self-start rounded-lg bg-[#0b7693] px-5 py-3 font-bold text-white">{pending?(es?"Enviando…":"Sending…"):(es?"Enviar mensaje":"Send message")}</button>
  </form>;
}
