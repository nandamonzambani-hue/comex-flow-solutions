import logoUniflexAsset from "@/assets/logos/uniflex-white.png.asset.json";
import logoTransfluidAsset from "@/assets/logos/transfluid.png.asset.json";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeldAsset from "@/assets/logos/held.png.asset.json";
import logoNextAsset from "@/assets/logos/next-powertech.png.asset.json";

type P = { name: string; country: string; logo: string; href: string; h?: string };

const row1: P[] = [
  // Uniflex processado: branco com fundo transparente.
  { name: "Uniflex", country: "Alemanha", logo: logoUniflexAsset.url, href: "https://www.uniflex.de/", h: "h-14 md:h-16" },
  { name: "ZEC", country: "Itália", logo: logoZec, href: "https://zecspa.com/", h: "h-14 md:h-16" },
  // Aumentar Next para ficar proporcional aos demais.
  { name: "Next Powertech", country: "Itália", logo: logoNextAsset.url, href: "https://www.powertechhoses.com/our-products", h: "h-20 md:h-24" },
];

const row2: P[] = [
  { name: "Marzocchi", country: "Itália", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/", h: "h-14 md:h-16" },
  // Aumentar Transfluid para o "T" ficar legível.
  { name: "Transfluid", country: "Alemanha", logo: logoTransfluidAsset.url, href: "https://www.transfluid.de/", h: "h-24 md:h-28" },
  // Aumentar Held para ficar proporcional aos demais.
  { name: "Held", country: "Alemanha", logo: logoHeldAsset.url, href: "https://held-test-stands.de/downloads.htm", h: "h-20 md:h-24" },
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
