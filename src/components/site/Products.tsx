import { useState } from "react";
import { Cog, Waves, Droplet, Activity, Package, Download, ArrowRight } from "lucide-react";
import imgCrimpadora from "@/assets/produtos/crimpadora.jpg";
import imgCorte from "@/assets/produtos/corte.png";
import imgBancada from "@/assets/produtos/bancada-teste.jpg";
import imgLimpeza from "@/assets/produtos/limpeza.png";
import imgDescasque from "@/assets/produtos/descasque.png";
import imgMarzocchi1 from "@/assets/produtos/marzocchi-bomba-1.png";
import imgMarzocchi2 from "@/assets/produtos/marzocchi-bomba-2.png";
import imgMarzocchi3 from "@/assets/produtos/marzocchi-bomba-3.png";
import imgZec1 from "@/assets/produtos/zec-mangueira-1.png";
import imgZec2 from "@/assets/produtos/zec-mangueira-2.png";
import imgZec3 from "@/assets/produtos/zec-mangueira-3.png";
import imgInsumos from "@/assets/produtos/comex-insumos.jpg";
import imgTransfluid from "@/assets/produtos/transfluid.jpg";

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

const categories: Category[] = [
  {
    id: "equipamentos",
    icon: Cog,
    title: "Equipamentos",
    brands: "Uniflex • Transfluid • Held",
    desc: "Linha completa de máquinas para produção de mangueiras: crimpadoras, máquinas de corte, decapadoras, bancadas de teste e equipamentos de limpeza.",
    items: [
      {
        name: "Crimpadoras Uniflex",
        brand: "Uniflex",
        desc: "Linha HM 2xx, 3xx, 4xx e 6xx para produção. S3, S4, S6 e S8/S10 para lojas. Versões disponíveis em português e com NR-12.",
        image: imgCrimpadora,
        catalog: "/catalogos/Catalogo_Uniflex.pdf",
      },
      {
        name: "Máquinas de Corte Uniflex",
        brand: "Uniflex",
        desc: "Manuais (EM6) e pneumáticas (EM6P, EM8P, EM120) para corte preciso de mangueiras hidráulicas e industriais.",
        image: imgCorte,
        catalog: "/catalogos/Catalogo_Uniflex.pdf",
      },
      {
        name: "Decapadoras (Skiving)",
        brand: "Uniflex",
        desc: "USM10 e linha completa de equipamentos de descasque para preparação de mangueiras antes da crimpagem.",
        image: imgDescasque,
        catalog: "/catalogos/Catalogo_Uniflex.pdf",
      },
      {
        name: "Equipamentos de Limpeza",
        brand: "Uniflex",
        desc: "RG10 e soluções para limpeza interna de mangueiras, removendo resíduos antes da montagem do terminal.",
        image: imgLimpeza,
        catalog: "/catalogos/Catalogo_Uniflex.pdf",
      },
      {
        name: "Soluções Transfluid",
        brand: "Transfluid",
        desc: "Dobra, conformação e processamento de tubos rígidos. Tecnologia italiana para a indústria pesada.",
        image: imgTransfluid,
      },
    ],
  },
  {
    id: "mangueiras",
    icon: Waves,
    title: "Mangueiras",
    brands: "ZEC • Next",
    desc: "Linha completa de mangueiras hidráulicas e industriais ZEC, organizada por segmento de aplicação.",
    items: [
      {
        name: "ZEC — Linha Hidráulica",
        brand: "ZEC",
        desc: "Mangueiras de alta pressão para sistemas hidráulicos. Catálogo completo América Latina disponível.",
        image: imgZec1,
        catalog: "/catalogos/ZEC_Catalogo_America_Latina.pdf",
      },
      {
        name: "ZEC — Mineração",
        brand: "ZEC",
        desc: "Resistência extrema à abrasão e impactos para o ambiente mais hostil da indústria.",
        image: imgZec2,
        catalog: "/catalogos/ZEC_Catalogo_America_Latina.pdf",
      },
      {
        name: "ZEC — Petróleo & Gás",
        brand: "ZEC",
        desc: "Alta pressão, alta temperatura e resistência química para aplicações offshore e onshore.",
        image: imgZec3,
        catalog: "/catalogos/ZEC_Catalogo_America_Latina.pdf",
      },
      {
        name: "Next — Industrial",
        brand: "Next",
        desc: "Mangueiras industriais para aplicações específicas e customizadas conforme projeto.",
        image: imgZec1,
      },
    ],
  },
  {
    id: "bombas",
    icon: Droplet,
    title: "Bombas",
    brands: "Marzocchi",
    desc: "Bombas de engrenagem italianas Marzocchi: precisão, durabilidade e tradição em hidráulica de alta performance.",
    items: [
      {
        name: "Marzocchi ELIKA",
        brand: "Marzocchi",
        desc: "Tecnologia de baixo ruído com engrenagens helicoidais. Eficiência superior x bombas tradicionais.",
        image: imgMarzocchi1,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
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
        desc: "Bombas e motores Gr. 2-3-4 em ferro fundido para aplicações severas de alta pressão.",
        image: imgMarzocchi3,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
      {
        name: "Micropumps 0,25–0,5 cm³/rev",
        brand: "Marzocchi",
        desc: "Micro bombas de precisão para aplicações que exigem dosagem exata em baixos volumes.",
        image: imgMarzocchi1,
        catalog: "/catalogos/Company_Profile_Marzocchi.pdf",
      },
    ],
  },
  {
    id: "testes",
    icon: Activity,
    title: "Testes & Certificações",
    brands: "Uniflex • Held",
    desc: "Bancadas e equipamentos de teste para garantir a integridade e a vida útil das mangueiras antes da operação.",
    items: [
      {
        name: "Bancada de Testes P160",
        brand: "Uniflex",
        desc: "Bancada para teste de pressão estática e validação de mangueiras montadas.",
        image: imgBancada,
        catalog: "/catalogos/Catalogo_Uniflex.pdf",
      },
      {
        name: "Bancadas de Impulso",
        brand: "Uniflex",
        desc: "Testes de fadiga e ciclagem para qualificação e certificação de mangueiras.",
        image: imgBancada,
      },
      {
        name: "Equipamentos de Marking",
        brand: "Uniflex",
        desc: "Identificação e rastreabilidade de mangueiras conforme normas internacionais.",
        image: imgBancada,
      },
      {
        name: "Pin Prick Tools",
        brand: "Uniflex",
        desc: "Ferramentas de perfuração da capa para mangueiras com fluidos voláteis.",
        image: imgBancada,
      },
    ],
  },
  {
    id: "insumos",
    icon: Package,
    title: "Insumos COMEX 10",
    brands: "COMEX 10",
    desc: "Linha própria de insumos: lacres de segurança, cabos de proteção e acessórios essenciais para sua operação.",
    items: [
      {
        name: "Lacres de Segurança COMEX 10",
        brand: "COMEX 10",
        desc: "Lacres metálicos para identificação e segurança de equipamentos e cargas.",
        image: imgInsumos,
      },
      {
        name: "Cabos de Proteção",
        brand: "COMEX 10",
        desc: "Cabos de aço revestidos para proteção e contenção de mangueiras hidráulicas.",
        image: imgInsumos,
      },
      {
        name: "Acessórios de Montagem",
        brand: "COMEX 10",
        desc: "Linha completa de acessórios para montagem segura e rastreável.",
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
                          href="#contato"
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
