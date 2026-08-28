import { Wrench, Droplet, Cog, ShieldCheck, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

const pillars = [
  {
    icon: Droplet,
    title: "Mangueiras & Conexões",
    desc: "ZEC e Next Powertech para condução de fluidos em todas as pressões.",
    href: "#produtos",
    accent: "var(--brand-zec-ink)",
  },
  {
    icon: Cog,
    title: "Bombas & Motores",
    desc: "Linha Marzocchi de bombas de engrenagem e motores hidráulicos.",
    href: "#produtos",
    accent: "var(--brand-marzocchi-ink)",
  },
  {
    icon: Wrench,
    title: "Equipamentos & Bancadas",
    desc: "Uniflex, Transfluid e Held para montagem, corte e ensaios.",
    href: "#produtos",
    accent: "var(--brand-held-ink)",
  },
  {
    icon: ShieldCheck,
    title: "Serviços & Treinamentos",
    desc: "Suporte técnico, adequação NR12 e capacitação especializada.",
    href: "#servicos",
    accent: "var(--brand-next-ink)",
  },
];

export function Solutions() {
  return (
    <section id="solucoes" className="scroll-mt-24 py-16 md:py-24 bg-white border-y border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Reveal from="left" className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Soluções Comex10
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight text-neutral-900">
            Cadeia completa de fluidos, do projeto à operação.
          </h2>
          <div className="brand-rule w-48 mb-4" />
          <p className="text-lg text-neutral-600">
            Quatro frentes integradas para garantir performance, segurança e
            continuidade operacional em indústria, agro, mineração e óleo & gás.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p, i) => (
            <Reveal key={p.title} from="up" delay={i * 90}>
            <a
              href={p.href}
              className="group lift-card accent-top accent-wash relative overflow-hidden h-full p-6 pt-7 rounded-xl border bg-white flex flex-col"
              style={{
                borderColor: `color-mix(in oklab, ${p.accent} 28%, transparent)`,
                ["--card-accent" as string]: p.accent,
              }}
            >
              <div
                className="relative z-10 w-12 h-12 rounded-lg border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                style={{
                  backgroundColor: `color-mix(in oklab, ${p.accent} 12%, transparent)`,
                  borderColor: `color-mix(in oklab, ${p.accent} 30%, transparent)`,
                  color: p.accent,
                }}
              >
                <p.icon size={22} />
              </div>
              <h3 className="relative z-10 font-display text-lg font-bold text-neutral-900 mb-2">
                {p.title}
              </h3>
              <p className="relative z-10 text-sm text-neutral-600 leading-relaxed flex-1">
                {p.desc}
              </p>
              <span
                className="relative z-10 mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-3"
                style={{ color: p.accent }}
              >
                Ver detalhes <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
