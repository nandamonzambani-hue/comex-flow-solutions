import { useState } from "react";
import { Cog, Droplet, Activity, Package, Download, ArrowRight, Settings } from "lucide-react";
import imgBancada from "@/assets/produtos/bancada-teste.jpg";
import imgCorte from "@/assets/produtos/corte.png";
import imgLimpeza from "@/assets/produtos/limpeza.png";
import imgTransfluid from "@/assets/produtos/transfluid.jpg";
import imgMarzocchi1 from "@/assets/produtos/marzocchi-bomba-1.png";
import imgMarzocchi2 from "@/assets/produtos/marzocchi-bomba-2.png";
import imgMarzocchi3 from "@/assets/produtos/marzocchi-bomba-3.png";
import imgZec1 from "@/assets/produtos/zec-mangueira-1.png";
import imgZec2 from "@/assets/produtos/zec-mangueira-2.png";
import imgZec3 from "@/assets/produtos/zec-mangueira-3.png";
import imgZecJpg from "@/assets/produtos/zec-mangueira.jpg";
import imgNext from "@/assets/produtos/next-mangueira.png";
import imgHeldBancada from "@/assets/produtos/held-bancada.png";
import imgLacre from "@/assets/produtos/insumos-lacre.png";
import imgCabos from "@/assets/produtos/insumos-cabos.png";

type Item = {
  name: string;
  desc: string;
  image: string;
  catalog?: string;
  brand?: string;
};

type Category = {
  id: string;
  icon: typeof Cog;
  title: string;
  brands: string;
  desc: string;
  items: Item[];
};

const uniflexItems: Item[] = [
  {
    name: "Uniflex — Máquinas de Corte",
    brand: "Uniflex",
    desc: "Corte preciso de mangueiras com produtividade e acabamento.",
    image: imgCorte,
    catalog: "/catalogos/Catalogo_Uniflex.pdf",
  },
  {
    name: "Uniflex — Bancadas de Testes",
    brand: "Uniflex",
    desc: "Validação de pressão, segurança e conformidade.",
    image: imgBancada,
    catalog: "/catalogos/Catalogo_Uniflex.pdf",
  },
  {
    name: "Uniflex — Periféricos",
    brand: "Uniflex",
    desc: "Periféricos e acessórios para padronização da montagem.",
    image: imgLimpeza,
    catalog: "/catalogos/Catalogo_Uniflex.pdf",
  },
];

const transfluidHeldItems: Item[] = [
  {
    name: "Transfluid — Equipamentos",
    brand: "Transfluid",
    desc: "Corte, conformação e preparação de tubos e sistemas de fluido.",
    image: imgTransfluid,
  },
  {
    name: "Held — Bancada de Testes",
    brand: "Held",
    desc: "Bancadas alemãs para teste e qualificação de componentes.",
    image: imgHeldBancada,
  },
];

const categories: Category[] = [
  {
    id: "equipamentos",
    icon: Settings,
    title: "Equipamentos",
    brands: "Uniflex • Transfluid • Held",
    desc: "Equipamentos industriais para preparação, montagem, corte, testes e suporte operacional em linhas hidráulicas.",
    items: [...uniflexItems, ...transfluidHeldItems],
  },
  {
    id: "mangueiras",
    icon: Droplet,
    title: "Mangueiras",
    brands: "ZEC • Next Powertech",
    desc: "Mangueiras técnicas e soluções associadas para aplicações hidráulicas, industriais e de alta exigência.",
    items: [
      {
        name: "ZEC — Mangueiras Hidráulicas",
        brand: "ZEC",
        desc: "Alta performance para condução de fluidos em ambientes industriais e móveis.",
        image: imgZec1,
        catalog: "/catalogos/ZEC_Catalogo_America_Latina.pdf",
      },
      {
        name: "ZEC — Linhas Especiais",
        brand: "ZEC",
        desc: "Séries especiais para pressão, temperatura e resistência específicas.",
        image: imgZec2,
        catalog: "/catalogos/ZEC_Catalogo_America_Latina.pdf",
      },
      {
        name: "ZEC — Industriais",
        brand: "ZEC",
        desc: "Soluções para indústria, química e aplicações severas.",
        image: imgZec3,
        catalog: "/catalogos/ZEC_Catalogo_America_Latina.pdf",
      },
      {
        name: "Next Powertech — Mangueiras",
        brand: "Next Powertech",
        desc: "Portfólio para reposição, montagem e atendimento técnico especializado.",
        image: imgNext,
      },
    ],
  },
  {
    id: "bombas-engrenagens",
    icon: Cog,
    title: "Bombas de Engrenagens",
    brands: "Marzocchi",
    desc: "Linha Marzocchi para sistemas hidráulicos que exigem precisão, durabilidade e eficiência volumétrica.",
    items: [
      {
        name: "Marzocchi — Bombas ELIKA",
        brand: "Marzocchi",
        desc: "Tecnologia helicoidal ELIKA para operação silenciosa e maior eficiência energética.",
        image: imgMarzocchi3,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Marzocchi — Bombas de Engrenagens",
        brand: "Marzocchi",
        desc: "Bombas em alumínio e ferro fundido para sistemas hidráulicos robustos.",
        image: imgMarzocchi2,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Marzocchi — Motores Hidráulicos",
        brand: "Marzocchi",
        desc: "Motores de engrenagem para acionamento, tração e transmissão de potência.",
        image: imgMarzocchi1,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
    ],
  },
  {
    id: "testes",
    icon: Activity,
    title: "Testes",
    brands: "Uniflex • Held",
    desc: "Equipamentos de teste para validação, segurança operacional e controle de qualidade em mangueiras e sistemas hidráulicos.",
    items: [
      {
        name: "Uniflex — Bancada de Testes",
        brand: "Uniflex",
        desc: "Bancada para testes de pressão e controle de qualidade em mangueiras montadas.",
        image: imgBancada,
        catalog: "/catalogos/Catalogo_Uniflex.pdf",
      },
      {
        name: "Held — Impulse Test",
        brand: "Held",
        desc: "Solução para testes de impulso, fadiga e ciclagem conforme normas técnicas internacionais.",
        image: imgHeldBancada,
      },
    ],
  },
  {
    id: "insumos",
    icon: Package,
    title: "Insumos",
    brands: "Comex10",
    desc: "Itens próprios Comex10 para identificação, segurança e suporte à montagem de mangueiras.",
    items: [
      {
        name: "Lacres",
        brand: "Comex10",
        desc: "Lacres para identificação, rastreabilidade e segurança na operação.",
        image: imgLacre,
      },
      {
        name: "Cabos de Segurança",
        brand: "Comex10",
        desc: "Cabos de segurança para proteção operacional e prevenção de riscos em campo.",
        image: imgCabos,
      },
    ],
  },
];

// ZEC application color blocks
const zecBlocks = [
  {
    label: "Hidráulica / Oleodinâmica",
    color: "#F4C430",
    fg: "#1a1a1a",
    image: imgZec1,
  },
  {
    label: "Alta Pressão",
    color: "#DC2626",
    fg: "#ffffff",
    image: imgZec2,
  },
  {
    label: "Indústria",
    color: "#2563EB",
    fg: "#ffffff",
    image: imgZec3,
  },
  {
    label: "Água / Irrigação / Agro",
    color: "#16A34A",
    fg: "#ffffff",
    image: imgZecJpg,
  },
];

function ItemCard({ item }: { item: Item }) {
  return (
    <article className="group rounded-xl bg-background/60 border border-border hover:border-primary/40 transition-all overflow-hidden flex flex-col">
      <div className="aspect-[4/3] overflow-hidden bg-background">
        <img
          src={item.image}
          alt={`${item.name} — ${item.brand ?? "Comex10"}`}
          loading="lazy"
          width={800}
          height={600}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {item.brand && (
          <div className="text-[10px] font-bold tracking-widest uppercase text-primary mb-1">
            {item.brand}
          </div>
        )}
        <h4 className="font-display font-semibold text-sm mb-1.5 leading-snug">{item.name}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">{item.desc}</p>
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border/50">
          {item.catalog ? (
            <a
              href={item.catalog}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-glow transition-colors"
            >
              <Download size={12} /> Catálogo PDF
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">Sob consulta</span>
          )}
          <a
            href="https://wa.me/5511914900404"
            target="_blank"
            rel="noopener"
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Solicite agora <ArrowRight size={11} />
          </a>
        </div>
      </div>
    </article>
  );
}

export function Products() {
  const [active, setActive] = useState(categories[0].id);
  const current = categories.find((c) => c.id === active)!;

  return (
    <section id="produtos" className="scroll-mt-24 py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Produtos & Marcas
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Toda a cadeia de fluidos em um só lugar.
          </h2>
          <p className="text-lg text-muted-foreground">
            Bombas, motores, bancadas e insumos das marcas líderes globais —
            organizados por categoria para você encontrar a solução certa.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar nav */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {categories.map((cat) => {
                const isActive = cat.id === active;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActive(cat.id)}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all ${
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
              className="p-6 md:p-8 rounded-2xl border border-border h-full"
              style={{ background: "var(--gradient-surface)", boxShadow: "var(--shadow-elegant)" }}
            >
              <div className="mb-6">
                <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                  {current.brands}
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold">{current.title}</h3>
                <p className="text-muted-foreground leading-relaxed mt-3 max-w-2xl">
                  {current.desc}
                </p>
              </div>

              {/* Mangueiras (ZEC) special intro + colored blocks */}
              {current.id === "mangueiras" && (
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    A linha <strong className="text-foreground">ZEC</strong> cobre todo o
                    espectro de aplicações em condução de fluidos — de baixa a altíssima
                    pressão, na indústria, no agro e em sistemas hidráulicos móveis. Cada
                    família é identificada por cor para facilitar a especificação técnica.
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {zecBlocks.map((b) => (
                      <div
                        key={b.label}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                      >
                        <img
                          src={b.image}
                          alt={`ZEC ${b.label}`}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                        <div
                          className="absolute inset-0 mix-blend-multiply opacity-80"
                          style={{ backgroundColor: b.color }}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-3" style={{ color: b.fg }}>
                          <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                            ZEC
                          </div>
                          <div className="text-sm font-display font-bold leading-tight">
                            {b.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipamentos: Uniflex top row + Transfluid/Held centered below */}
              {current.id === "equipamentos" ? (
                <>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">
                    Linha Uniflex
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    {uniflexItems.map((item) => (
                      <ItemCard key={item.name} item={item} />
                    ))}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">
                    Transfluid & Held
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {transfluidHeldItems.map((item) => (
                      <ItemCard key={item.name} item={item} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {current.items.map((item) => (
                    <ItemCard key={item.name} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
