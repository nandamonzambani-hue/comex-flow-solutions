import { Headphones, Package, FlaskConical, ShieldCheck, ArrowRight } from "lucide-react";
import bgService from "@/assets/oficina-movel.jpg";

const services = [
  {
    icon: Headphones,
    title: "Suporte Técnico Especializado",
    desc: "Diagnóstico em campo e atendimento técnico com especialistas em cadeia de fluidos.",
  },
  {
    icon: Package,
    title: "Reposição de Peças",
    desc: "Fornecimento ágil de peças originais e componentes para manter sua operação ativa.",
  },
  {
    icon: FlaskConical,
    title: "Testes",
    desc: "Validação em bancada com rastreabilidade, laudos técnicos e conformidade normativa.",
  },
  {
    icon: ShieldCheck,
    title: "Adequação / Implementação NR12",
    desc: "Projeto e execução de adequações de segurança em máquinas conforme a NR12.",
  },
];

export function Services() {
  return (
    <section
      id="servicos"
      className="relative py-16 md:py-28 border-y border-border overflow-hidden"
      style={{ backgroundColor: "oklch(0.12 0.02 250)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={bgService}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-15"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.10 0.02 250 / 0.85) 0%, oklch(0.14 0.03 250 / 0.75) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Serviços
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight text-white">
            Soluções técnicas do diagnóstico à entrega.
          </h2>
          <p className="text-lg text-neutral-300">
            Apoiamos sua operação em todas as etapas — da identificação do problema
            à solução aplicada em campo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <s.icon size={22} className="text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-white">{s.title}</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 p-6 rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-sm">
          <div>
            <h3 className="font-display text-xl font-semibold text-white">
              Aumente a produtividade da sua operação
            </h3>
            <p className="text-sm text-neutral-300 mt-1">
              Fale com um especialista e receba uma proposta sob medida.
            </p>
          </div>
          <a
            href="https://wa.me/5511914900404"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-primary-foreground transition-all hover:scale-105"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            Solicite agora <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
