import { Target, Users, Award, Lightbulb, Clock, Globe, ShieldCheck } from "lucide-react";

const pillars = [
  {
    step: "ETAPA 01",
    icon: Target,
    title: "Identificar o problema",
    desc: "80% das falhas em mangueiras acontecem antes do uso — na especificação ou na montagem. Começamos pelo diagnóstico técnico em campo.",
  },
  {
    step: "ETAPA 02",
    icon: Lightbulb,
    title: "Apresentar a solução",
    desc: "Equipamentos, mangueiras, bombas e insumos selecionados para cada setor de aplicação e desafio técnico.",
  },
  {
    step: "ETAPA 03",
    icon: Award,
    title: "Garantir qualidade",
    desc: "Testes e certificações em todas as soluções, com a confiabilidade dos maiores fabricantes globais.",
  },
  {
    step: "ETAPA 04",
    icon: Users,
    title: "Capacitar pessoas",
    desc: "Hub de conhecimento técnico: treinamentos certificados na Comex10 e dentro de empresas parceiras.",
  },
];

const badges = [
  { icon: Clock, title: "+20 anos", sub: "de experiência" },
  { icon: Globe, title: "Marcas líderes", sub: "globais" },
  { icon: ShieldCheck, title: "Soluções que", sub: "geram confiança" },
];

export function About() {
  return (
    <section id="quem-somos" className="py-16 md:py-24 relative scroll-mt-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-30"
          style={{ background: "var(--gradient-primary)" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/40 mb-5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-primary">
                Quem Somos
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5">
              Referência técnica em{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                soluções hidráulicas.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Mais do que fornecer, entregamos{" "}
              <strong className="text-foreground">segurança</strong>,{" "}
              <strong className="text-foreground">eficiência</strong> e{" "}
              <strong className="text-foreground">performance</strong> para o seu negócio.
            </p>
            <div className="flex flex-wrap gap-3">
              {badges.map((b) => (
                <div
                  key={b.title}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-primary/30 bg-primary/5"
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

          <div className="lg:col-span-6">
            <div
              className="p-6 md:p-8 rounded-2xl border border-primary/20"
              style={{ background: "var(--gradient-surface)", boxShadow: "var(--shadow-elegant)" }}
            >
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                A <strong className="text-foreground">Comex10</strong> do Brasil é
                referência técnica em soluções hidráulicas. Mais do que vender máquinas
                e mangueiras, entregamos diagnóstico, projetos, equipamentos
                certificados e capacitação técnica para garantir que a sua operação
                continue funcionando com segurança e eficiência.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Atuamos lado a lado com as principais marcas líderes mundiais,
                oferecendo soluções completas e personalizadas para resolver, de fato,
                as necessidades do seu negócio.
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group relative p-6 rounded-xl border border-border bg-surface hover:border-primary/50 transition-all hover:-translate-y-1"
              style={{ background: "var(--gradient-surface)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/15 border border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <p.icon className="text-primary group-hover:text-primary-foreground" size={22} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-primary/60">
                    {p.step.split(" ")[0]}
                  </div>
                  <div className="font-display text-3xl font-bold text-primary/40 leading-none">
                    {p.step.split(" ")[1]}
                  </div>
                </div>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              <div className="mt-4 h-0.5 w-10 bg-primary/40 rounded-full transition-all group-hover:w-20 group-hover:bg-primary" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
