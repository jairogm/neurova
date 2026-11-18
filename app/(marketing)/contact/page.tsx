import { getLocale } from "next-intl/server";

export const metadata = { title: "Contact · NEUROVA" };

export default async function ContactPage() {
  const es = (await getLocale()) === "es";
  return (
    <main className="marketing-article">
      <h1 className="text-4xl font-bold">{es ? "Contacta con NEUROVA" : "Contact NEUROVA"}</h1>
      <h2 className="mt-10 text-xl font-semibold">{es ? "Consultas sobre el producto y soporte" : "Product questions and support"}</h2>
      <a className="mt-2 inline-block underline" href="mailto:support@neurova.app">support@neurova.app</a>
      <h2 className="mt-8 text-xl font-semibold">{es ? "Privacidad y datos personales" : "Privacy and personal data"}</h2>
      <a className="mt-2 inline-block underline" href="mailto:privacy@neurova.app">privacy@neurova.app</a>
    </main>
  );
}
