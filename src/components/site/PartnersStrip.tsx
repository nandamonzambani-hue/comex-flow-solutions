import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

const items = [
  { name: "Uniflex", country: "Alemanha", logo: logoUniflex, href: "https://www.uniflex.de/" },
  { name: "ZEC", country: "Itália", logo: logoZec, href: "https://zecspa.com/" },
  { name: "Next Powertech", country: "Itália", logo: logoNext, href: "https://www.powertechhoses.com/our-products" },
  { name: "Marzocchi", country: "Itália", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/" },
  { name: "Transfluid", country: "Alemanha", logo: logoTransfluid, href: "https://www.transfluid.de/" },
  { name: "Held", country: "Alemanha", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm" },
];

export function PartnersStrip() {
  return (
    <div className="bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-6">
        <div className="text-center mb-4">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary">
            Parceiros estratégicos · Marcas líderes globais
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:gap-x-14">
          {items.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener nofollow"
              title={`${p.name} — ${p.country}`}
              className="flex items-center group transition-transform hover:scale-110"
            >
              <img
                src={p.logo}
                alt={`Logo ${p.name}`}
                className="h-9 md:h-11 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
