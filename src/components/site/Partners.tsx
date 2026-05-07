import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

type Partner = {
  name: string;
  country: string;
  logo: string;
  href: string;
  maxH?: string;
};

// Order: Uniflex, ZEC, Next (Powertech), Marzocchi, Transfluid, Held
const partners: Partner[] = [
  { name: "Uniflex", country: "Alemanha", logo: logoUniflex, href: "https://www.uniflex.de/", maxH: "max-h-10" },
  { name: "ZEC", country: "Itália", logo: logoZec, href: "https://zecspa.com/", maxH: "max-h-10" },
  { name: "Next Powertech", country: "Itália", logo: logoNext, href: "https://www.powertechhoses.com/our-products", maxH: "max-h-8" },
  { name: "Marzocchi", country: "Itália", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/", maxH: "max-h-10" },
  { name: "Transfluid", country: "Alemanha", logo: logoTransfluid, href: "https://www.transfluid.de/", maxH: "max-h-12" },
  { name: "Held", country: "Alemanha", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm", maxH: "max-h-10" },
];

export function Partners() {
  return (
    <section id="parceiros" className="py-24 md:py-32 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Parceiros estratégicos
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Marcas líderes globais.
          </h2>
          <p className="text-lg text-muted-foreground">
            Trabalhamos com os fabricantes mais respeitados do mundo em hidráulica e
            cadeia de fluidos.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener nofollow"
              title={`${p.name} — ${p.country}`}
              className="aspect-[4/3] flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white hover:border-primary transition-all group p-4"
            >
              <img
                src={p.logo}
                alt={`Logo ${p.name}`}
                className={`${p.maxH ?? "max-h-12"} w-auto object-contain`}
              />
              <div className="text-[10px] text-primary/70 mt-2 uppercase tracking-wider font-semibold">
                {p.country}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
