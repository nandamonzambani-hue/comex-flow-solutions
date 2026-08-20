import { Target, Users, Award, Lightbulb, Clock, Globe, ShieldCheck } from "lucide-react";

const pillars = [
  {
    step: "01",
    icon: Target,
    title: "Identificar o problema",
    desc: "Entendemos sua operação e mapeamos causas e riscos.",
  },
  {
    step: "02",
    icon: Lightbulb,
    title: "Especificar a solução",
    desc: "Projetamos a solução ideal com precisão técnica.",
  },
  {
    step: "03",
    icon: Award,
    title: "Validar com testes",
    desc: "Testes, qualidade e rastreabilidade em cada etapa.",
  },
  {
    step: "04",
    icon: Users,
    title: "Capacitar a operação",
    desc: "Treinamentos práticos para performance contínua em campo.",
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
      className="py-20 md:py-28 lg:min-h-svh lg:flex lg:items-center relative scroll-mt-24 overflow-hidden bg-background text-foreground"
    >
      {/* Technical background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-0 -left-32 w-[520px] h-[520px] bg-blue-600/20 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 -right-32 w-[520px] h-[520px] bg-cyan-500/15 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-12 mb-14">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center space-x-3 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-sm backdrop-blur-md w-fit mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary font-display">
                Quem Somos
              </span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
              <span className="text-foreground block">Referência técnica em </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-accent drop-shadow-[0_0_18px_rgba(56,140,255,0.25)]">
                soluções hidráulicas.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-7 font-light max-w-xl">
              Mais do que fornecer, entregamos{" "}
              <strong className="text-foreground font-semibold">segurança</strong>,{" "}
              <strong className="text-foreground font-semibold">eficiência</strong> e{" "}
              <strong className="text-foreground font-semibold">performance</strong> para o seu negócio.
            </p>
            <div className="flex flex-wrap gap-3">
              {badges.map((b) => (
                <div
                  key={b.title}
                  className="flex items-center gap-2.5 px-4 py-2.5 border border-primary/40 bg-card backdrop-blur-xl"
                >
                  <b.icon size={18} className="text-primary" />
                  <div className="text-xs leading-tight">
                    <div className="font-semibold text-foreground">{b.title}</div>
                    <div className="text-muted-foreground">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-25 blur-xl" />
            <div className="relative p-7 md:p-9 bg-card backdrop-blur-2xl border border-border overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary/40" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary/40" />

              <div className="text-[10px] font-body tracking-[0.3em] text-primary mb-4">
                COMEX10 // MANIFESTO
              </div>
              <p className="text-base text-muted-foreground leading-relaxed mb-4 font-light">
                A <strong className="text-foreground font-semibold">Comex10</strong> do Brasil é
                referência técnica em soluções hidráulicas. Mais do que vender máquinas e
                mangueiras, entregamos diagnóstico, projetos, equipamentos certificados e
                capacitação técnica para garantir que a sua operação continue funcionando
                com segurança e eficiência.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed font-light">
                Atuamos lado a lado com as principais{" "}
                <strong className="text-foreground font-semibold">marcas líderes mundiais</strong>,
                oferecendo soluções completas e personalizadas para resolver, de fato, as
                necessidades do seu negócio.
              </p>
            </div>
          </div>
        </div>

        {/* Pillars / Etapas */}
        <div className="mb-8">
          <div className="text-[10px] font-display tracking-[0.3em] text-primary mb-2">
            NOSSA_JORNADA // 4_ETAPAS
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Nossa jornada técnica ao seu lado
          </h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group relative p-6 bg-card backdrop-blur-xl border border-border hover:border-primary/40 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 text-foreground flex items-center justify-center shadow-[0_0_20px_rgba(56,140,255,0.25)]">
                  <p.icon size={22} strokeWidth={2.2} />
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-display tracking-[0.25em] text-primary">
                    ETAPA
                  </div>
                  <div className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-accent leading-none">
                    {p.step}
                  </div>
                </div>
              </div>
              <h3 className="font-display text-lg font-bold mb-2 text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              <div className="mt-4 h-0.5 w-10 bg-primary/20 transition-all group-hover:w-20 group-hover:shadow-[0_0_10px_rgba(56,140,255,0.25)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
