import Image from "next/image";
import { getLocale } from "next-intl/server";

export const metadata = { title: "Our story · NEUROVA" };

export default async function AboutPage() {
  const es = (await getLocale()) === "es";
  const team = [
    ["Liz", es ? "Terapeuta y cofundadora" : "Therapist and co-founder"],
    ["Jhon", es ? "Ingeniero de software y cofundador" : "Software engineer and co-founder"],
    ["Maroc Aurelio", es ? "Bulldog francés de Liz" : "Liz’s French bulldog"],
    ["Luna Maria", es ? "Labrador de Jhon" : "Jhon’s Labrador"],
  ];
  return <main className="marketing-article">
    <h1 className="font-bold">{es ? "Nuestra historia" : "Our story"}</h1>
    <p className="mt-7 text-xl">{es ? "En 2023, dos amigos se pusieron a hablar de lo que pasaba entre una consulta y la siguiente." : "In 2023, two friends got talking about what happens between therapy sessions."}</p>
    <p className="mt-5">{es ? "Liz, terapeuta, le contó a Jhon cuánto costaban las herramientas para llevar su consulta. Incluso después de pagarlas, algo tan cotidiano como buscar la nota anterior o revisar un pago le tomaba demasiados pasos." : "Liz, a therapist, told Jhon how expensive it was to run her practice with the tools available. Even after paying for them, finding the last session note or checking a payment took more steps than it should."}</p>
    <p className="mt-5">{es ? "Jhon, ingeniero de software, le preguntó cómo lo haría ella. Liz fue describiendo su jornada y Jhon empezó a construir. Desde entonces trabajan así: Liz aporta la experiencia de la consulta y Jhon la convierte en herramientas que otros terapeutas también puedan usar y pagar." : "Jhon, a software engineer, asked how she would do it. Liz walked him through her day, and Jhon started building. They’ve been working that way ever since: Liz brings the experience of running a practice, and Jhon turns it into tools that other therapists can use and afford."}</p>
    <h2 id="team" className="scroll-mt-24 mb-4 mt-12 text-2xl font-bold">{es ? "Nuestro equipo" : "Meet the team"}</h2>
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        <filter id="team-portrait-blue" colorInterpolationFilters="sRGB">
          {/* Map the mint accent to a tint of brand blue while preserving neutral ink. */}
          <feColorMatrix type="matrix" values="1.3 -.3 0 0 0  .26 .74 0 0 0  0 1 0 0 0  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
    <div className="grid gap-4 sm:grid-cols-2">
      {team.map(([name, role]) => (
        <article key={name} className="overflow-hidden rounded-2xl border border-[#d0e3e4] bg-white">
          <Image src={`/team/${name.toLowerCase().replaceAll(" ", "-")}.webp`} alt="" width={600} height={600} sizes="(max-width: 640px) 90vw, 355px" style={{ filter: "url(#team-portrait-blue)" }} className="block h-auto w-full" />
          <div className="p-5">
            <h3 className="text-xl font-bold">{name}</h3>
            <p>{role}</p>
          </div>
        </article>
      ))}
    </div>
  </main>;
}
