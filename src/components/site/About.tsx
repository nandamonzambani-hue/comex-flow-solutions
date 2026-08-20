import { Target, Users, Award, Lightbulb, Clock, Globe, ShieldCheck } from "lucide-react";

const pillars = [
  {
    step: "01",
    icon: Target,
    title: "Identificar o problema",
    desc: "Entendemos sua operação e mapeamos causas e riscos.",
    accent: "var(--brand-uniflex)",
    accentInk: "var(--brand-uniflex-ink)",
  },
  {
    step: "02",
    icon: Lightbulb,
    title: "Especificar a solução",
    desc: "Projetamos a solução ideal com precisão técnica.",
    accent: "var(--brand-zec)",
    accentInk: "var(--brand-zec-ink)",
  },
  {
    step: "03",
    icon: Award,
    title: "Validar com testes",
    desc: "Testes, qualidade e rastreabilidade em cada etapa.",
    accent: "var(--brand-held)",
    accentInk: "var(--brand-held-ink)",
  },
  {
    step: "04",
    icon: Users,
    title: "Capacitar a operação",
    desc: "Treinamentos práticos para performance contínua em campo.",
    accent: "var(--brand-next)",
    accentInk: "var(--brand-next-ink)",
  },
];

const badges = [
  { icon: Clock, title: "+20 anos", sub: "de experiência" },
  { icon: Globe, title: "Marcas líderes", sub: "globais" },
  { icon: ShieldCheck, title: "Soluções que", sub: "geram confiança" },
];

export function About() {
  return (
    <section
      id="quem-somos"
      className="scroll-mt-24 py-16 md:py-28 lg:min-h-svh lg:flex lg:items-center"
    >
      <div className="w-full mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Quem Somos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Referência técnica em soluções hidráulicas.
          </h2>
          <p className="text-lg text-muted-foreground">
            Mais do que fornecer, entregamos{" "}
            <strong className="text-foreground font-semibold">segurança</strong>,{" "}
            <strong className="text-foreground font-semibold">eficiência</strong> e{" "}
            <strong className="text-foreground font-semibold">performance</strong> para o seu
            negócio.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 mb-12">
          {/* Badges */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {badges.map((b) => (
              <div
                key={b.title}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0">
                  <b.icon size={20} />
                </div>
                <div className="text-sm leading-tight">
                  <div className="font-display font-semibold text-foreground">{b.title}</div>
                  <div className="text-muted-foreground">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Manifesto */}
          <div className="lg:col-span-8">
            <div className="p-6 md:p-8 rounded-2xl border border-border h-full bg-card">
              <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">
                Manifesto
              </div>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                A <strong className="text-foreground font-semibold">Comex10</strong> do Brasil é
                referência técnica em soluções hidráulicas. Mais do que vender máquinas e
                mangueiras, entregamos diagnóstico, projetos, equipamentos certificados e
                capacitação técnica para garantir que a sua operação continue funcionando com
                segurança e eficiência.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Atuamos lado a lado com as principais{" "}
                <strong className="text-foreground font-semibold">marcas líderes mundiais</strong>,
                oferecendo soluções completas e personalizadas para resolver, de fato, as
                necessidades do seu negócio.
              </p>
            </div>
          </div>
        </div>

        {/* Etapas */}
        <div className="mb-6">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Nossa jornada • 4 etapas
          </span>
          <h3 className="font-display text-2xl md:text-3xl font-bold mt-2">
            Nossa jornada técnica ao seu lado
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group p-6 rounded-xl border bg-card transition-all hover:shadow-md flex flex-col"
              style={{ borderColor: `color-mix(in oklab, ${p.accent} 28%, transparent)` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${p.accent} 14%, transparent)`,
                    color: p.accentInk,
                  }}
                >
                  <p.icon size={20} />
                </div>
                <div className="text-right">
                  <div
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: p.accentInk }}
                  >
                    Etapa
                  </div>
                  <div
                    className="font-display text-3xl font-bold leading-none"
                    style={{ color: p.accentInk }}
                  >
                    {p.step}
                  </div>
                </div>
              </div>
              <h4 className="font-display text-lg font-semibold mb-2">{p.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
