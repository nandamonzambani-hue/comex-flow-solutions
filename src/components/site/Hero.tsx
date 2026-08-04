import heroBg from "@/assets/hero-bg.png.asset.json";
import { partnerBrands } from "./partnersData";

const partners = partnerBrands;


export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-[#050B18] text-white">
      {/* Full-bleed background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg.url}
          alt="Técnico Comex10 operando máquina de crimpagem Uniflex"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Lighter overlays — background more visible, text still readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B18]/85 via-[#050B18]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B18]/85 via-transparent to-transparent" />
      </div>

      {/* Ambient blue glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/25 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 blur-[180px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 md:px-8 pt-32 md:pt-36 pb-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100svh-220px)]">
          {/* LEFT — text over image */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-3 bg-blue-900/50 border border-blue-400/50 px-5 py-2 rounded-full backdrop-blur-md w-fit mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.28em] font-bold text-white font-mono">
                Especialistas em cadeia de fluidos
              </span>
            </div>

            <h1 className="font-display font-extrabold leading-[1.02] tracking-tight text-white text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem]">
              Sua operação
              <br />
              não pode parar.
            </h1>

            <h2 className="mt-6 font-display font-bold leading-[1.1] tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-[2.25rem]">
              <span className="text-white">
                A <span className="text-blue-400">Comex10</span> mantém sua cadeia de fluidos{" "}
              </span>
              <span className="text-blue-400">em movimento.</span>
            </h2>

            <p className="mt-8 text-base md:text-lg text-slate-200/90 max-w-md leading-relaxed font-light">
              Soluções completas para máxima confiabilidade, desempenho e continuidade da sua
              operação.
            </p>
          </div>

          {/* RIGHT — hexagon seal */}
          <div className="relative hidden lg:flex items-end justify-end min-h-[500px]">
            <div className="relative">
              <div className="absolute -inset-6 bg-cyan-400/25 blur-2xl rounded-full" />
              <div
                className="relative w-48 h-52 md:w-56 md:h-60 flex items-center justify-center"
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
                  <div className="font-display text-lg md:text-xl font-black text-white leading-tight tracking-tight">
                    TECNOLOGIA
                  </div>
                  <div className="font-display text-lg md:text-xl font-black text-white leading-tight tracking-tight mb-2">
                    ALEMÃ
                  </div>
                  <div className="text-[10px] font-mono tracking-[0.25em] text-cyan-300">
                    DE ALTA
                  </div>
                  <div className="text-[10px] font-mono tracking-[0.25em] text-cyan-300 mb-2">
                    PERFORMANCE
                  </div>
                  <svg viewBox="0 0 5 3" className="w-8 h-5 mx-auto rounded-[2px] overflow-hidden" aria-label="Alemanha">
                    <rect width="5" height="1" y="0" fill="#000" />
                    <rect width="5" height="1" y="1" fill="#D00" />
                    <rect width="5" height="1" y="2" fill="#FFCE00" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners strip — logos em cores originais sobre tile branco */}
        <div className="mt-12 md:mt-16 relative z-10">
          <div className="bg-[#0A1526]/90 backdrop-blur-xl border border-white/10 rounded-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {partners.map((p, i) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener nofollow"
                title={p.name}
                className={`group flex flex-col items-center justify-start text-center px-4 py-6 hover:bg-white/5 transition-colors ${
                  i !== 0 ? "md:border-l border-white/10" : ""
                }`}
              >
                <div className={`w-full h-20 rounded-md ${p.tile} flex items-center justify-center mb-3 px-3 shadow-[0_0_0_1px_rgba(255,255,255,0.15)]`}>
                  <img
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    className={`${p.h} w-auto max-w-full object-contain`}
                  />
                </div>
                {p.official && (
                  <span className="mb-2 text-[9px] font-mono uppercase tracking-[0.18em] text-cyan-300 border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 rounded-sm">
                    Distribuidor oficial
                  </span>
                )}
                <p className="text-xs text-slate-300 leading-snug max-w-[190px]">
                  {p.tagline}
                </p>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
