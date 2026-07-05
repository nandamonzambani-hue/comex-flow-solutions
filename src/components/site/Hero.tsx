import heroBg from "@/assets/hero-bg.png.asset.json";
import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

const partners = [
  { name: "Uniflex", logo: logoUniflex, href: "https://www.uniflex.de/", tagline: "Líder mundial em máquinas para crimpagem", h: "h-12" },
  { name: "ZEC", logo: logoZec, href: "https://zecspa.com/", tagline: "Excelência em conexões", h: "h-12" },
  { name: "Transfluid", logo: logoTransfluid, href: "https://www.transfluid.de/", tagline: "Soluções completas para mangueiras e conexões", h: "h-14" },
  { name: "Marzocchi", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/", tagline: "Bombas e motores de alta performance", h: "h-12" },
  { name: "Next Powertech", logo: logoNext, href: "https://www.powertechhoses.com/our-products", tagline: "Sistemas hidráulicos avançados", h: "h-10" },
  { name: "Gebr. Held", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm", tagline: "Ferramentas para fundição e precisão", h: "h-12" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#020617] text-white pt-24 md:pt-28"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg.url}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/70 to-[#020617]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-8 min-h-[calc(100svh-110px)] flex flex-col">
        <div className="flex-1 grid lg:grid-cols-12 gap-10 items-center py-10 md:py-16">
          {/* Left column — copy */}
          <div className="lg:col-span-7 flex flex-col space-y-7">
            <div className="inline-flex items-center space-x-3 bg-blue-900/40 border border-blue-400/50 px-5 py-2 rounded-full backdrop-blur-md w-fit">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.28em] font-bold text-white font-mono">
                Especialistas em cadeia de fluidos
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-[1.02] tracking-tight">
              <span className="text-white block">Sua operação</span>
              <span className="text-white block">não pode parar.</span>
              <span className="block mt-4 text-white">
                A{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Comex10
                </span>{" "}
                mantém
              </span>
              <span className="text-white block">sua cadeia de fluidos</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 block">
                em movimento.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-200 max-w-xl leading-relaxed font-light">
              Soluções completas para máxima{" "}
              <span className="text-white font-semibold">confiabilidade</span>,{" "}
              <span className="text-white font-semibold">desempenho</span> e{" "}
              <span className="text-white font-semibold">continuidade</span> da sua operação.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#contato"
                className="px-8 md:px-10 py-4 md:py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider skew-x-[-12deg] transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
              >
                <span className="inline-block skew-x-[12deg]">Solicitar diagnóstico</span>
              </a>
              <a
                href="https://wa.me/5511914900404"
                target="_blank"
                rel="noopener"
                className="px-8 md:px-10 py-4 md:py-5 border border-white/30 hover:border-cyan-400/60 hover:bg-white/10 text-white font-semibold text-sm uppercase tracking-wider skew-x-[-12deg] transition-all backdrop-blur-sm"
              >
                <span className="inline-block skew-x-[12deg]">Falar com especialista</span>
              </a>
            </div>
          </div>

          {/* Right column — hexagon badge */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-cyan-400/20 blur-3xl rounded-full" />
              <div
                className="relative w-64 h-72 md:w-72 md:h-80 flex items-center justify-center"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  background:
                    "linear-gradient(160deg, rgba(15,23,42,0.85) 0%, rgba(30,58,138,0.75) 100%)",
                  border: "1px solid rgba(34,211,238,0.4)",
                  boxShadow:
                    "0 0 40px rgba(34,211,238,0.25), inset 0 0 30px rgba(34,211,238,0.15)",
                }}
              >
                <div className="text-center px-6 backdrop-blur-md">
                  <div className="font-display text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                    TECNOLOGIA
                  </div>
                  <div className="font-display text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-3">
                    ALEMÃ
                  </div>
                  <div className="text-[11px] font-mono tracking-[0.25em] text-cyan-300 mb-1">
                    DE ALTA
                  </div>
                  <div className="text-[11px] font-mono tracking-[0.25em] text-cyan-300 mb-4">
                    PERFORMANCE
                  </div>
                  <div className="text-2xl">🇩🇪</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners strip */}
        <div className="pb-8 md:pb-12">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {partners.map((p, i) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener nofollow"
                title={p.name}
                className={`group flex flex-col items-center justify-start text-center p-5 md:p-6 hover:bg-white/5 transition-colors ${
                  i !== 0 ? "md:border-l border-white/10" : ""
                }`}
              >
                <div className="h-16 flex items-center justify-center mb-3">
                  <img
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    className={`${p.h} w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100`}
                  />
                </div>
                <p className="text-xs text-slate-300 leading-snug max-w-[180px]">
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
