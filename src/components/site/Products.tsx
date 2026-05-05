import { useState } from "react";
import { Cog, Droplet, Activity, Package, Download, ArrowRight, Wind, Zap } from "lucide-react";
import imgBancada from "@/assets/produtos/bancada-teste.jpg";
import imgMarzocchi1 from "@/assets/produtos/marzocchi-bomba-1.png";
import imgMarzocchi2 from "@/assets/produtos/marzocchi-bomba-2.png";
import imgMarzocchi3 from "@/assets/produtos/marzocchi-bomba-3.png";
import imgInsumos from "@/assets/produtos/insumos-certificacoes.jpg";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

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
  brandLogo?: string;
};

const categories: Category[] = [
  {
    id: "microbombas",
    icon: Droplet,
    title: "Microbombas",
    brands: "Next • Marzocchi",
    brandLogo: logoNext,
    desc: "Microbombas de precisão para aplicações que exigem dosagem exata e controle fino de baixos volumes.",
    items: [
      {
        name: "Microbombas Next",
        brand: "Next",
        desc: "Linha Microbombas Next para dosagem industrial — alta repetibilidade e durabilidade.",
        image: imgMarzocchi1,
      },
      {
        name: "Marzocchi Micropumps 0,25–0,5 cm³/rev",
        brand: "Marzocchi",
        desc: "Microbombas italianas de engrenagem para sistemas de alta precisão.",
        image: imgMarzocchi2,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Linha de baixo volume Next",
        brand: "Next",
        desc: "Soluções customizadas em microvazão para máquinas e equipamentos especiais.",
        image: imgMarzocchi3,
      },
      {
        name: "Acessórios para microbombas",
        brand: "Next",
        desc: "Conexões, válvulas e periféricos para integração em projetos de dosagem.",
        image: imgMarzocchi1,
      },
    ],
  },
  {
    id: "bombas",
    icon: Cog,
    title: "Bombas",
    brands: "Marzocchi",
    desc: "Bombas de engrenagem italianas Marzocchi: precisão, durabilidade e tradição em hidráulica de alta performance.",
    items: [
      {
        name: "Série ALP — Alumínio",
        brand: "Marzocchi",
        desc: "Bombas de engrenagem em alumínio, leves e de alta eficiência volumétrica.",
        image: imgMarzocchi2,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "FCIP & FCIM — Ferro Fundido",
        brand: "Marzocchi",
        desc: "Bombas Gr. 2-3-4 em ferro fundido para aplicações severas de alta pressão.",
        image: imgMarzocchi3,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Bombas de pistão",
        brand: "Marzocchi",
        desc: "Soluções de pistão axial para alta pressão e variação de vazão.",
        image: imgMarzocchi1,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Bombas industriais sob projeto",
        brand: "Marzocchi",
        desc: "Especificação técnica e dimensionamento conforme sua aplicação.",
        image: imgMarzocchi2,
      },
    ],
  },
  {
    id: "bombas-helicas",
    icon: Wind,
    title: "Bombas Hélicas",
    brands: "Marzocchi ELIKA",
    desc: "Tecnologia de baixo ruído com engrenagens helicoidais — eficiência superior em comparação às bombas tradicionais.",
    items: [
      {
        name: "Marzocchi ELIKA",
        brand: "Marzocchi",
        desc: "Engrenagens helicoidais para operação silenciosa e maior vida útil.",
        image: imgMarzocchi1,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "ELIKA Série E",
        brand: "Marzocchi",
        desc: "Linha premium para máquinas que exigem baixo ruído e alta eficiência energética.",
        image: imgMarzocchi2,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Aplicações Mobile",
        brand: "Marzocchi",
        desc: "Bombas hélicas para máquinas agrícolas, florestais e de construção.",
        image: imgMarzocchi3,
      },
      {
        name: "Aplicações Industriais",
        brand: "Marzocchi",
        desc: "Soluções para prensas, injetoras e centros de usinagem.",
        image: imgMarzocchi1,
      },
    ],
  },
  {
    id: "motores",
    icon: Zap,
    title: "Motores Hidráulicos",
    brands: "Marzocchi",
    desc: "Motores hidráulicos de engrenagem para tração, acionamento e transmissão de potência em equipamentos pesados.",
    items: [
      {
        name: "Motores Gr. 2",
        brand: "Marzocchi",
        desc: "Motores compactos de engrenagem para aplicações de média potência.",
        image: imgMarzocchi3,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Motores Gr. 3",
        brand: "Marzocchi",
        desc: "Motores robustos para transmissão de potência em maquinário industrial.",
        image: imgMarzocchi1,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Motores Gr. 4",
        brand: "Marzocchi",
        desc: "Alta potência e durabilidade para mineração, agro pesado e siderurgia.",
        image: imgMarzocchi2,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Motores reversíveis",
        brand: "Marzocchi",
        desc: "Soluções bidirecionais para sistemas de tração e movimentação.",
        image: imgMarzocchi3,
      },
    ],
  },
  {
    id: "bancadas",
    icon: Activity,
    title: "Bancadas de Testes",
    brands: "Held • Uniflex",
    brandLogo: logoHeld,
    desc: "Bancadas de teste e impulso Gebr. Held (Alemanha) para validação, certificação e qualificação de mangueiras hidráulicas.",
    items: [
      {
        name: "Held — Bancadas de Impulso",
        brand: "Held",
        desc: "Equipamentos alemães para testes de fadiga, ciclagem e qualificação conforme normas internacionais.",
        image: imgBancada,
      },
      {
        name: "Held — Bancadas de Pressão Estática",
        brand: "Held",
        desc: "Validação de pressão de trabalho e ruptura para mangueiras montadas.",
        image: imgBancada,
      },
      {
        name: "Uniflex P160",
        brand: "Uniflex",
        desc: "Bancada compacta para teste de pressão estática em produção.",
        image: imgBancada,
        catalog: "/catalogos/Catalogo_Uniflex.pdf",
      },
      {
        name: "Equipamentos de Marking & Pin Prick",
        brand: "Uniflex",
        desc: "Identificação, rastreabilidade e perfuração de capa para fluidos voláteis.",
        image: imgBancada,
      },
    ],
  },
  {
    id: "insumos",
    icon: Package,
    title: "Insumos & Certificações",
    brands: "COMEX 10",
    desc: "Linha própria de insumos e certificações que garantem rastreabilidade, segurança e conformidade da sua operação.",
    items: [
      {
        name: "Lacres de Segurança COMEX 10",
        brand: "COMEX 10",
        desc: "Lacres metálicos para identificação, rastreabilidade e segurança de mangueiras e equipamentos.",
        image: imgInsumos,
      },
      {
        name: "Certificações & Laudos Técnicos",
        brand: "COMEX 10",
        desc: "Emissão de laudos e certificados técnicos com rastreabilidade total para auditorias e compliance.",
        image: imgInsumos,
      },
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
            Bombas, motores, bancadas e insumos das marcas líderes globais —
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
              className="p-6 md:p-8 rounded-2xl border border-border h-full"
              style={{ background: "var(--gradient-surface)", boxShadow: "var(--shadow-elegant)" }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-primary mb-1">
                    {current.brands}
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl font-bold">{current.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mt-3 max-w-2xl">
                    {current.desc}
                  </p>
                </div>
                {current.brandLogo && (
                  <div className="hidden sm:flex flex-shrink-0 items-center justify-center bg-white rounded-lg p-3 border border-border h-16 w-32">
                    <img
                      src={current.brandLogo}
                      alt={`Logo ${current.title}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {current.items.map((item) => (
                  <article
                    key={item.name}
                    className="group rounded-xl bg-background/60 border border-border hover:border-primary/40 transition-all overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-background">
                      <img
                        src={item.image}
                        alt={`${item.name} — ${item.brand ?? "COMEX 10"}`}
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
                      <h4 className="font-display font-semibold text-sm mb-1.5 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
                        {item.desc}
                      </p>
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
                          Consultar <ArrowRight size={11} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
