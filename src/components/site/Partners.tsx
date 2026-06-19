import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

type Partner = {
  name: string;
  country: string;
  tagline: string;
  logo: string;
  href: string;
  maxH?: string;
};

const partners: Partner[] = [
  { name: "Uniflex", country: "Alemanha", tagline: "Líder mundial em máquinas para crimpagem", logo: logoUniflex, href: "https://www.uniflex.de/", maxH: "max-h-14" },
  { name: "ZEC", country: "Itália", tagline: "Excelência em conexões — The Original. Better. Direct.", logo: logoZec, href: "https://zecspa.com/", maxH: "max-h-14" },
  { name: "Next Powertech", country: "Itália", tagline: "Sistemas hidráulicos avançados", logo: logoNext, href: "https://www.powertechhoses.com/our-products", maxH: "max-h-12" },
  { name: "Marzocchi Pompe", country: "Itália", tagline: "Bombas e motores de alta performance", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/", maxH: "max-h-14" },
  { name: "Transfluid", country: "Alemanha", tagline: "Soluções completas para mangueiras e conexões", logo: logoTransfluid, href: "https://www.transfluid.de/", maxH: "max-h-16" },
  { name: "Gebr. Held", country: "Alemanha", tagline: "Ferramentas hidráulicas para fundição e precisão", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm", maxH: "max-h-14" },
];

export function Partners() {
  return (
    <section id="parceiros" className="scroll-mt-24 py-16 md:py-28 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Tecnologia global. Aplicação técnica local.
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Marcas líderes globais.
          </h2>
          <p className="text-lg text-muted-foreground">
            <strong className="text-foreground">Comex10</strong>, o elo estratégico das
            referências globais no Brasil em hidráulica e cadeia de fluidos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener nofollow"
              title={`${p.name} — ${p.country}`}
              className="group flex flex-col rounded-xl border border-neutral-200 bg-white hover:border-primary hover:shadow-lg transition-all p-6"
            >
              <div className="h-20 flex items-center justify-center mb-4">
                <img
                  src={p.logo}
                  alt={`Logo ${p.name}`}
                  className={`${p.maxH ?? "max-h-14"} w-auto object-contain`}
                />
              </div>
              <div className="text-center">
                <div className="text-[10px] text-primary/70 uppercase tracking-[0.2em] font-bold mb-1">
                  {p.country}
                </div>
                <h3 className="font-display text-base font-semibold text-neutral-900 mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{p.tagline}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary">
            Qualidade ao alcance de todos.
          </p>
        </div>
      </div>
    </section>
  );
}
