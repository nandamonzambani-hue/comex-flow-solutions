import {
  Mountain,
  Droplets,
  Sprout,
  Factory,
  Ship,
  Utensils,
  Snowflake,
  Waves,
  Flame,
  Cog,
} from "lucide-react";
import { Reveal } from "./Reveal";

const accents = [
  "var(--brand-uniflex-ink)",
  "var(--brand-zec-ink)",
  "var(--brand-next-ink)",
  "var(--brand-marzocchi-ink)",
  "var(--brand-held-ink)",
  "var(--brand-transfluid-ink)",
];

const segments = [
  { icon: Mountain, title: "Mineração", desc: "Mangueiras de alta resistência à abrasão e equipamentos para reduzir paradas em frota pesada." },
  { icon: Droplets, title: "Óleo & Gás", desc: "Soluções para alta pressão e temperatura, conformes às normas do setor com rastreabilidade total." },
  { icon: Sprout, title: "Agro & Florestal", desc: "Mangueiras e crimpagem para implementos agrícolas, colheitadeiras e maquinário florestal." },
  { icon: Factory, title: "Indústria", desc: "Manutenção, retrofit e novos projetos em prensas, injetoras e linhas hidráulicas industriais." },
  { icon: Ship, title: "Náutica", desc: "Sistemas hidráulicos e mangueiras certificadas para aplicações navais e portuárias." },
  { icon: Utensils, title: "Alimentício", desc: "Soluções com materiais compatíveis para a indústria de alimentos e bebidas." },
  { icon: Snowflake, title: "Refrigeração", desc: "Mangueiras técnicas para sistemas de refrigeração industrial e comercial." },
  { icon: Waves, title: "Água & Irrigação", desc: "Condução de água em sistemas prediais, irrigação e infraestrutura." },
  { icon: Flame, title: "Gás CNG", desc: "Mangueiras e conexões para gás natural veicular e aplicações de alta pressão." },
  { icon: Cog, title: "Lubrificação", desc: "Sistemas de lubrificação centralizada e mangueiras para óleos e graxas." },
];

export function Segments() {
  return (
    <section id="segmentos" className="scroll-mt-24 py-16 md:py-24 lg:min-h-svh lg:flex lg:items-center bg-surface/40 border-y border-border">
      <div className="w-full mx-auto max-w-7xl px-4 md:px-8">
        <Reveal from="left" className="max-w-2xl mb-14">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Segmentos de atuação
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Soluções pensadas para o seu setor.
          </h2>
          <div className="brand-rule w-40 mb-4" />
          <p className="text-lg text-muted-foreground">
            Cada operação tem desafios únicos. Selecionamos equipamentos, mangueiras
            e insumos para o seu segmento.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {segments.map((s, i) => {
            const accent = accents[i % accents.length];
            return (
            <Reveal key={s.title} from="up" delay={i * 55}>
            <a
              href="#produtos"
              className="group lift-card accent-wash relative h-full overflow-hidden rounded-xl border border-border bg-surface p-5 block"
              style={{
                background: "var(--gradient-surface)",
                borderColor: `color-mix(in oklab, ${accent} 25%, transparent)`,
                ["--card-accent" as string]: accent,
              }}
            >
              <div
                className="relative z-10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`,
                  borderColor: `color-mix(in oklab, ${accent} 35%, transparent)`,
                  color: accent,
                }}
              >
                <s.icon size={22} />
              </div>
              <h3 className="relative z-10 font-display text-base sm:text-lg font-semibold mb-1.5">{s.title}</h3>
              <p className="relative z-10 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              <div
                className="relative z-10 mt-3 h-0.5 w-8 rounded-full transition-all duration-500 group-hover:w-16"
                style={{ backgroundColor: accent }}
              />
            </a>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
