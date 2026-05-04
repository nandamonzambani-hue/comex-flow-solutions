import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";

const items = [
  { name: "Uniflex", country: "Alemanha", logo: logoUniflex, href: "https://www.uniflex.de/" },
  { name: "Transfluid", country: "Alemanha", logo: logoTransfluid, href: "https://www.transfluid.de/" },
  { name: "ZEC", country: "Itália", logo: logoZec, href: "https://www.zecitaly.com/" },
  { name: "Held", country: "Alemanha", href: "#" },
  { name: "Marzocchi", country: "Itália", href: "https://www.marzocchipompe.com/" },
  { name: "Next", country: "Brasil", href: "#" },
];

export function PartnersStrip() {
  return (
    <div className="bg-white border-b border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500">
          Parceiros estratégicos
        </span>
        {items.map((p) => (
          <a
            key={p.name}
            href={p.href}
            target={p.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener"
            className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
            aria-label={`${p.name} — ${p.country}`}
          >
            {p.logo ? (
              <img
                src={p.logo}
                alt={`Logo ${p.name}`}
                className="h-7 md:h-8 w-auto object-contain grayscale hover:grayscale-0 transition"
              />
            ) : (
              <span className="font-display text-sm font-bold tracking-tight text-neutral-700">
                {p.name}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
