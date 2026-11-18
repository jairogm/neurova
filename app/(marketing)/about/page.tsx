import Link from "next/link";
import { getLocale } from "next-intl/server";

export const metadata = { title: "About · NEUROVA" };

export default async function AboutPage() {
  const es = (await getLocale()) === "es";
  return (
    <main className="marketing-article">
      <h1 className="text-4xl font-bold">{es ? "Acerca de NEUROVA" : "About NEUROVA"}</h1>
      <p className="mt-6 text-xl leading-relaxed">{es ? "NEUROVA reúne la agenda, las notas clínicas y los pagos de quienes trabajan en consulta de salud mental." : "NEUROVA brings scheduling, clinical notes, and session payments together for mental health practitioners."}</p>
      <p className="my-6 leading-relaxed">{es ? "Antes de una sesión, consulta el historial del paciente. Después, registra los acuerdos y actualiza el estado del pago. Puedes recorrer este flujo con pacientes ficticios en la demo." : "Before a session, open the patient’s timeline to revisit your last conversation. Afterward, record what you agreed and update the payment status. Try that workflow with fictional patients in the demo."}</p>
      <Link href="/demo" className="font-semibold underline">{es ? "Explorar la demo" : "Explore the demo"} →</Link>
    </main>
  );
}
