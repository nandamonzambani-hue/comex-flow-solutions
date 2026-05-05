import { Search, Settings, FlaskConical, Truck, Headphones, FileCheck } from "lucide-react";
import bgService from "@/assets/oficina-movel.jpg";

const services = [
  { icon: Search, title: "Diagnóstico técnico", desc: "Análise da sua operação para identificar pontos críticos antes da falha." },
  { icon: Settings, title: "Projeto & Especificação", desc: "Dimensionamento de mangueiras, terminais e equipamentos sob medida." },
  { icon: FlaskConical, title: "Testes & Certificação", desc: "Validação em bancada com rastreabilidade e laudo técnico." },
  { icon: Truck, title: "Oficina do futuro", desc: "Demonstração móvel de soluções e atendimento on-site." },
  { icon: Headphones, title: "Suporte contínuo", desc: "Equipe técnica disponível para tirar sua operação do papel." },
  { icon: FileCheck, title: "Compliance & Normas", desc: "Atendimento às normas de segurança e qualidade do seu setor." },
];

export function Services() {
  return (
    <section
      id="servicos"
      className="relative py-24 md:py-32 border-y border-border overflow-hidden"
      style={{ backgroundColor: "oklch(0.12 0.02 250)" }}
    >
      {/* Translucent service photo background for depth */}
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
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight text-white">
            Soluções técnicas do diagnóstico à entrega.
          </h2>
          <p className="text-lg text-neutral-300">
            Apoiamos sua operação em todas as etapas — da identificação do problema
            à solução aplicada em campo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
      </div>
    </section>
  );
}
