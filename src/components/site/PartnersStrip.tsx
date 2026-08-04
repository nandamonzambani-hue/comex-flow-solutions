import { partnerBrands } from "./partnersData";

export function PartnersStrip() {
  const row1 = partnerBrands.slice(0, 3);
  const row2 = partnerBrands.slice(3);

  return (
    <div className="bg-white border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-10">
        <div className="text-center mb-5">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary">
            Distribuidor oficial · Marcas líderes globais
          </span>
        </div>
        <div className="space-y-3">
          {[row1, row2].map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-3 md:gap-4">
              {row.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener nofollow"
                  title={`${p.name} — ${p.country}`}
                  className="flex items-center justify-center px-6 py-4 rounded-xl border border-neutral-200 hover:border-primary hover:shadow-md transition-all min-h-[96px] md:min-h-[112px]"
                  style={{ backgroundColor: p.tileBg }}
                >
                  <img
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    className={`${p.h} w-auto max-w-full object-contain`}
                  />
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
