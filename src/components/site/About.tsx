import { Target, Users, Award, Lightbulb } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Identificar o problema",
    desc: "80% das falhas em mangueiras acontecem antes do uso — na especificação ou na montagem. Começamos pelo diagnóstico técnico em campo.",
  },
  {
    icon: Lightbulb,
    title: "Apresentar a solução",
    desc: "Equipamentos, mangueiras, bombas e insumos selecionados para cada setor de aplicação e desafio técnico.",
  },
  {
    icon: Award,
    title: "Garantir qualidade",
    desc: "Testes e certificações em todas as soluções, com a confiabilidade dos maiores fabricantes globais.",
  },
  {
    icon: Users,
    title: "Capacitar pessoas",
    desc: "Hub de conhecimento técnico: treinamentos certificados na COMEX 10 e dentro de empresas parceiras.",
  },
];

export function About() {
  return (
    <section id="quem-somos" className="py-24 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">
              Quem somos
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6 leading-tight">
              Mais que fornecedora.
              <br />
              <span className="text-primary">Seu parceiro técnico</span> em sistemas de fluidos.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg text-muted-foreground leading-relaxed">
              A COMEX 10 do Brasil é referência técnica em soluções hidráulicas.
              Não vendemos apenas máquinas e mangueiras — entregamos diagnóstico,
              projeto, equipamentos certificados e capacitação técnica para que sua
              operação não pare. Trabalhamos lado a lado com as marcas líderes
              mundiais para resolver, de fato, o problema do seu negócio.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group p-6 rounded-xl border border-border bg-surface hover:border-primary/40 transition-all hover:-translate-y-1"
              style={{ background: "var(--gradient-surface)" }}
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <p.icon className="text-primary" size={22} />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
