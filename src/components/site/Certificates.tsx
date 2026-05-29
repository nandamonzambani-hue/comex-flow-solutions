import { ShieldCheck, FileBadge, Award, MessageCircle } from "lucide-react";

const certs = [
  {
    icon: Award,
    brand: "Marzocchi",
    title: "Certificado de Qualidade",
    desc: "Conformidade ISO e certificação técnica das bombas e motores hidráulicos.",
  },
  {
    icon: ShieldCheck,
    brand: "ZEC",
    title: "Conformidade Técnica",
    desc: "Atendimento a normas EN, SAE e ISO para mangueiras de alta performance.",
  },
  {
    icon: FileBadge,
    brand: "Uniflex",
    title: "Certificação de Equipamentos",
    desc: "Equipamentos certificados conforme padrões europeus de segurança e qualidade.",
  },
  {
    icon: ShieldCheck,
    brand: "Held",
    title: "Calibração e Rastreabilidade",
    desc: "Bancadas com calibração rastreável para ensaios e laudos técnicos.",
  },
];

export function Certificates() {
  return (
    <section id="certificados" className="scroll-mt-24 py-16 md:py-28 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Certificados
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Conformidade e qualidade garantidas.
          </h2>
          <p className="text-lg text-muted-foreground">
            Documentação técnica e certificados de conformidade dos nossos fornecedores
            globais — disponíveis sob solicitação para sua área de qualidade.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {certs.map((c) => (
            <div
              key={c.brand + c.title}
              className="p-6 rounded-xl border border-border bg-white hover:border-primary/40 transition-all hover:-translate-y-1 flex flex-col"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <c.icon className="text-primary" size={22} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                {c.brand}
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{c.desc}</p>
              <a
                href={`https://wa.me/5511914900404?text=${encodeURIComponent(
                  `Olá! Gostaria de solicitar o certificado ${c.title} — ${c.brand}.`,
                )}`}
                target="_blank"
                rel="noopener"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <MessageCircle size={14} /> Solicitar certificado
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
