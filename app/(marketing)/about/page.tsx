import Image from "next/image";
import { getLocale } from "next-intl/server";

export const metadata = { title: "Our story · NEUROVA" };

export default async function AboutPage() {
  const es = (await getLocale()) === "es";
  const team = [
    ["Liz", es ? "Terapeuta y cofundadora" : "Therapist and co-founder"],
    ["Jhon", es ? "Ingeniero de software y cofundador" : "Software engineer and co-founder"],
    ["Marco Aurelio", es ? "Bulldog francés de Liz" : "Liz’s French bulldog"],
    ["Luna Maria", es ? "Labrador de Jhon" : "Jhon’s Labrador"],
  ];
  return <main>
    <div className="marketing-article" style={{ minHeight: 0, paddingBottom: 0 }}>
    <h1 className="font-bold">{es ? "Nuestra historia" : "Our story"}</h1>
    <p className="mt-7 text-xl">{es ? "En 2023, dos amigos se pusieron a hablar de lo que pasaba entre una consulta y la siguiente." : "In 2023, two friends got talking about what happens between therapy sessions."}</p>
    <p className="mt-5">{es ? "Liz, terapeuta, le contó a Jhon cuánto costaban las herramientas para llevar su consulta. Incluso después de pagarlas, algo tan cotidiano como buscar la nota anterior o revisar un pago le tomaba demasiados pasos." : "Liz, a therapist, told Jhon how expensive it was to run her practice with the tools available. Even after paying for them, finding the last session note or checking a payment took more steps than it should."}</p>
    <p className="mt-5">{es ? "Jhon, ingeniero de software, le preguntó cómo lo haría ella. Liz fue describiendo su jornada y Jhon empezó a construir. Desde entonces trabajan así: Liz aporta la experiencia de la consulta y Jhon la convierte en herramientas que otros terapeutas también puedan usar y pagar." : "Jhon, a software engineer, asked how she would do it. Liz walked him through her day, and Jhon started building. They’ve been working that way ever since: Liz brings the experience of running a practice, and Jhon turns it into tools that other therapists can use and afford."}</p>
    </div>
    <section className="mx-auto max-w-[1120px] px-5 pb-16 sm:px-8">
    <h2 id="team" className="scroll-mt-24 mb-4 mt-12 text-2xl font-bold">{es ? "Nuestro equipo" : "Meet the team"}</h2>
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {team.map(([name, role]) => (
        <article key={name} className="overflow-hidden rounded-2xl border border-[#d0e3e4] bg-white">
          <Image src={`/team/${name.toLowerCase().replaceAll(" ", "-")}-blue.webp`} alt="" width={600} height={600} sizes="(min-width: 1024px) 245px, (min-width: 640px) 200px, 42vw" className="mx-auto block h-auto w-full max-w-[200px] p-2" />
          <div className="px-4 pb-4">
            <h3 className="text-xl font-bold">{name}</h3>
            <p>{role}</p>
          </div>
        </article>
      ))}
    </div>
    </section>
  </main>;
}
