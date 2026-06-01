import { Wrench, Droplet, Cog, ShieldCheck, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Droplet,
    title: "Mangueiras & Conexões",
    desc: "ZEC e Next Powertech para condução de fluidos em todas as pressões.",
    href: "#produtos",
  },
  {
    icon: Cog,
    title: "Bombas & Motores",
    desc: "Linha Marzocchi de bombas de engrenagem e motores hidráulicos.",
    href: "#produtos",
  },
  {
    icon: Wrench,
    title: "Equipamentos & Bancadas",
    desc: "Uniflex, Transfluid e Held para montagem, corte e ensaios.",
    href: "#produtos",
  },
  {
    icon: ShieldCheck,
    title: "Serviços & Treinamentos",
    desc: "Suporte técnico, adequação NR12 e capacitação especializada.",
    href: "#servicos",
  },
];

export function Solutions() {
  return (
    <section id="solucoes" className="scroll-mt-24 py-16 md:py-24 bg-white border-y border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Soluções Comex10
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight text-neutral-900">
            Cadeia completa de fluidos, do projeto à operação.
          </h2>
          <p className="text-lg text-neutral-600">
            Quatro frentes integradas para garantir performance, segurança e
            continuidade operacional em indústria, agro, mineração e óleo & gás.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <a
              key={p.title}
              href={p.href}
              className="group p-6 rounded-xl border border-neutral-200 bg-white hover:border-primary/50 hover:shadow-md transition-all hover:-translate-y-1 flex flex-col"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <p.icon className="text-primary" size={22} />
              </div>
              <h3 className="font-display text-lg font-bold text-neutral-900 mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed flex-1">
                {p.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2 transition-all">
                Ver detalhes <ArrowRight size={14} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
