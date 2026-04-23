import { useState } from "react";
import { Cog, Waves, Droplet, Activity, Package, Download } from "lucide-react";

type Category = {
  id: string;
  icon: typeof Cog;
  title: string;
  brands: string;
  desc: string;
  items: { name: string; note?: string; href?: string }[];
};

const categories: Category[] = [
  {
    id: "equipamentos",
    icon: Cog,
    title: "Equipamentos",
    brands: "Uniflex • Transfluid • Held",
    desc: "Crimpadoras, máquinas de corte, decapadoras e equipamentos de dobra para a fabricação completa de mangueiras.",
    items: [
      { name: "Crimpadoras Uniflex", note: "Linha completa para baixa, média e alta pressão", href: "/catalogos/Catalogo_Uniflex.pdf" },
      { name: "Máquinas de corte Uniflex", note: "Precisão e segurança em corte de mangueiras" },
      { name: "Soluções Transfluid", note: "Dobra, conformação e processamento de tubos" },
      { name: "Equipamentos Held", note: "Tecnologia para terminais e acoplamentos" },
    ],
  },
  {
    id: "mangueiras",
    icon: Waves,
    title: "Mangueiras",
    brands: "ZEC • Next",
    desc: "Linha completa de mangueiras hidráulicas e industriais para todos os setores de aplicação.",
    items: [
      { name: "ZEC — Linha hidráulica", note: "Catálogo América Latina disponível", href: "/catalogos/ZEC_Catalogo_America_Latina.pdf" },
      { name: "ZEC — Mineração", note: "Resistência extrema à abrasão" },
      { name: "ZEC — Petróleo & Gás", note: "Alta pressão e temperatura" },
      { name: "Next — Industrial", note: "Aplicações específicas e customizadas" },
    ],
  },
  {
    id: "bombas",
    icon: Droplet,
    title: "Bombas",
    brands: "Marzocchi",
    desc: "Bombas de engrenagem italianas Marzocchi: precisão, durabilidade e a tradição de quem faz bombas hidráulicas há décadas.",
    items: [
      { name: "Bombas de engrenagem", note: "Linhas GHP, ALP, ELI e outras", href: "/catalogos/Company_Profile_Marzocchi.pdf" },
      { name: "Motores hidráulicos", note: "Alto rendimento e baixa emissão de ruído" },
      { name: "Soluções customizadas", note: "Especificação técnica sob projeto" },
    ],
  },
  {
    id: "testes",
    icon: Activity,
    title: "Testes & Certificações",
    brands: "Uniflex • Held",
    desc: "Bancadas e equipamentos de teste para garantir a integridade e a vida útil das mangueiras antes da operação.",
    items: [
      { name: "Bancadas de teste de impulso" },
      { name: "Bancadas de pressão estática" },
      { name: "Equipamentos de rastreabilidade" },
      { name: "Suporte técnico em certificação" },
    ],
  },
  {
    id: "insumos",
    icon: Package,
    title: "Insumos COMEX 10",
    brands: "COMEX 10",
    desc: "Linha própria de insumos: lacres de segurança, cabos de proteção e acessórios essenciais para sua operação.",
    items: [
      { name: "Lacres de segurança COMEX 10" },
      { name: "Cabos de proteção" },
      { name: "Acessórios de montagem" },
      { name: "Identificação e rastreabilidade" },
    ],
  },
];

export function Products() {
  const [active, setActive] = useState(categories[0].id);
  const current = categories.find((c) => c.id === active)!;

  return (
    <section id="produtos" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Produtos & Marcas
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Toda a cadeia de fluidos em um só lugar.
          </h2>
          <p className="text-lg text-muted-foreground">
            Equipamentos, mangueiras, bombas, testes e insumos das marcas líderes globais —
            organizados por categoria para você encontrar a solução certa.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar nav */}
          <div className="lg:col-span-4">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {categories.map((cat) => {
                const isActive = cat.id === active;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActive(cat.id)}
                    className={`flex-shrink-0 lg:flex-shrink lg:w-full text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface hover:border-border/60 hover:bg-surface/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-background text-primary"
                        }`}
                      >
                        <cat.icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-semibold text-base">{cat.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{cat.brands}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content panel */}
          <div className="lg:col-span-8">
            <div
              className="p-8 md:p-10 rounded-2xl border border-border h-full"
              style={{ background: "var(--gradient-surface)", boxShadow: "var(--shadow-elegant)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                    {current.brands}
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl font-bold">{current.title}</h3>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4 mb-8 max-w-2xl">
                {current.desc}
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {current.items.map((item) => (
                  <div
                    key={item.name}
                    className="p-4 rounded-lg bg-background/50 border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="font-semibold text-sm mb-1">{item.name}</div>
                    {item.note && (
                      <div className="text-xs text-muted-foreground mb-2">{item.note}</div>
                    )}
                    {item.href && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-glow"
                      >
                        <Download size={12} /> Catálogo PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
