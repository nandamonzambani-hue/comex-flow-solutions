import { Search, Settings, FlaskConical, Truck, Headphones, FileCheck } from "lucide-react";

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
    <section id="servicos" className="py-24 md:py-32 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Serviços
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Consultoria do diagnóstico à entrega.
          </h2>
          <p className="text-lg text-muted-foreground">
            Acompanhamos sua operação em todas as etapas — do problema identificado à
            solução em campo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-xl border border-border bg-background hover:border-primary/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <s.icon size={22} className="text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
