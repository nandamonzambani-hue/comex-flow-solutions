import heroBg from "@/assets/hero-bg-v2.png.asset.json";
import { partnerBrands } from "./partnersData";

const partners = partnerBrands;

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#050B18] text-white min-h-[100svh] flex flex-col"
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg.url}
          alt="Técnico Comex10 operando máquina de crimpagem Uniflex em galpão industrial"
          className="absolute inset-0 w-full h-full object-cover object-[70%_center] sm:object-center"
          loading="eager"
          decoding="async"
        />
        {/* Gradient overlays — background visível, texto legível */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B18]/92 via-[#050B18]/55 to-[#050B18]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B18]/90 via-transparent to-[#050B18]/40" />
      </div>

      {/* Ambient blue glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/25 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] flex-1 grid-rows-[auto_auto] content-between gap-4 px-4 pb-4 pt-24 sm:px-6 sm:pb-5 sm:pt-28 md:px-8 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto] lg:gap-3 lg:pb-4 lg:pt-[5.75rem] xl:pt-24">
        <div className="grid min-h-0 items-center gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {/* LEFT — text over image */}
          <div className="flex min-h-0 flex-col justify-center">
            <div className="mb-3 inline-flex w-fit items-center gap-2.5 rounded-full border border-blue-400/50 bg-blue-900/50 px-4 py-1.5 backdrop-blur-md lg:mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] font-bold text-white font-display">
                Especialistas em cadeia de fluidos
              </span>
            </div>

            <h1 className="font-display text-[2rem] font-extrabold leading-[1.03] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[clamp(2.75rem,4.8vw,3.75rem)] xl:text-[4rem]">
              Sua operação
              <br />
              não pode parar.
            </h1>

            <h2 className="mt-3 font-display text-lg font-bold leading-[1.15] tracking-tight sm:text-2xl md:text-3xl lg:text-[clamp(1.35rem,2.4vw,1.85rem)] xl:text-[2.125rem]">
              <span className="text-white">
                A <span className="text-blue-400">Comex10</span> mantém sua cadeia de fluidos{" "}
              </span>
              <span className="text-blue-400">em movimento.</span>
            </h2>

            <div className="mt-4 flex flex-wrap gap-3 lg:mt-5">
              <a
                href="#produtos"
                className="cta-pulse inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-display font-bold text-primary-foreground shadow-[0_0_25px_rgba(56,140,255,0.35)]"
              >
                Ver soluções
              </a>
              <a
                href="https://wa.me/5511914900404"
                target="_blank"
                rel="noopener nofollow"
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-display font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 hover:border-white/70"
              >
                Falar com especialista
              </a>
            </div>
          </div>

          {/* RIGHT — hexagon seal */}
          <div className="relative hidden lg:flex items-center justify-end">
            <div className="relative float-soft">
              <div className="absolute -inset-6 bg-cyan-400/25 blur-2xl rounded-full animate-pulse" />
              <div
                className="relative w-40 h-44 xl:w-48 xl:h-52 flex items-center justify-center"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  background:
                    "linear-gradient(160deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.9) 100%)",
                  boxShadow:
                    "0 0 40px rgba(34,211,238,0.35), inset 0 0 25px rgba(34,211,238,0.2)",
                }}
              >
                <div className="text-center px-3">
                  <div className="font-display text-base xl:text-lg font-black text-white leading-tight tracking-tight">
                    TECNOLOGIA
                  </div>
                  <div className="font-display text-base xl:text-lg font-black text-white leading-tight tracking-tight mb-1.5">
                    ALEMÃ
                  </div>
                  <div className="text-[9px] font-display tracking-[0.25em] text-cyan-300">
                    DE ALTA
                  </div>
                  <div className="text-[9px] font-display tracking-[0.25em] text-cyan-300 mb-1.5">
                    PERFORMANCE
                  </div>
                  <svg
                    viewBox="0 0 5 3"
                    className="w-7 h-4 mx-auto rounded-[2px] overflow-hidden"
                    aria-label="Alemanha"
                  >
                    <rect width="5" height="1" y="0" fill="#000" />
                    <rect width="5" height="1" y="1" fill="#D00" />
                    <rect width="5" height="1" y="2" fill="#FFCE00" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner logo grid */}
        <div className="relative z-10 shrink-0">
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 overflow-hidden">
            {partners.map((p, i) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener nofollow"
                title={p.name}
                style={{ ["--card-accent" as string]: p.accent }}
                className={`group relative flex min-w-0 flex-col items-center justify-center px-2 py-2.5 text-center transition-all duration-300 hover:bg-muted lg:min-h-[5.75rem] lg:py-2 border-border ${
                  i % 2 === 1 ? "border-l sm:border-l-0" : ""
                } ${i >= 2 ? "border-t sm:border-t-0" : ""} ${
                  i % 3 !== 0 ? "sm:border-l" : ""
                } ${i >= 3 ? "sm:border-t lg:border-t-0" : ""} ${
                  i !== 0 ? "lg:border-l" : "lg:border-l-0"
                }`}
              >
                <div className="mb-1.5 flex h-8 w-full items-center justify-center px-1 sm:h-9 lg:h-10">
                  <img
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-400 group-hover:scale-x-100"
                  style={{ backgroundColor: p.accent }}
                />
                {p.official && (
                  <span className="mb-1 text-[8px] font-display font-bold uppercase tracking-[0.16em] text-primary border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded-sm">
                    Distribuidor oficial
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
