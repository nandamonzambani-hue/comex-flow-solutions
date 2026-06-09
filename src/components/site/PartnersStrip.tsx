import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

type P = { name: string; country: string; logo: string; href: string; h?: string };

const row1: P[] = [
  { name: "Uniflex", country: "Alemanha", logo: logoUniflex, href: "https://www.uniflex.de/", h: "h-14 md:h-16" },
  { name: "ZEC", country: "Itália", logo: logoZec, href: "https://zecspa.com/", h: "h-14 md:h-16" },
  { name: "Next Powertech", country: "Itália", logo: logoNext, href: "https://www.powertechhoses.com/our-products", h: "h-12 md:h-14" },
];

const row2: P[] = [
  { name: "Marzocchi", country: "Itália", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/", h: "h-14 md:h-16" },
  { name: "Transfluid", country: "Alemanha", logo: logoTransfluid, href: "https://www.transfluid.de/", h: "h-20 md:h-24" },
  { name: "Held", country: "Alemanha", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm", h: "h-14 md:h-16" },
];

function Tile({ p }: { p: P }) {
  return (
    <a
      href={p.href}
      target="_blank"
      rel="noopener nofollow"
      title={`${p.name} — ${p.country}`}
      className="flex items-center justify-center px-6 py-4 rounded-xl bg-white border border-neutral-200 hover:border-primary hover:shadow-md transition-all group min-h-[96px] md:min-h-[112px]"
    >
      <img
        src={p.logo}
        alt={`Logo ${p.name}`}
        className={`${p.h ?? "h-14"} w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity`}
      />
    </a>
  );
}

export function PartnersStrip() {
  return (
    <div className="bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-10">
        <div className="text-center mb-5">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary">
            Parceiros estratégicos · Marcas líderes globais
          </span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {row1.map((p) => <Tile key={p.name} p={p} />)}
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {row2.map((p) => <Tile key={p.name} p={p} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
