import heroBg from "@/assets/hero-bg.png.asset.json";
import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

const partners = [
  { name: "Uniflex", logo: logoUniflex, href: "https://www.uniflex.de/", tagline: "Líder mundial em máquinas para crimpagem", h: "h-14" },
  { name: "ZEC", logo: logoZec, href: "https://zecspa.com/", tagline: "Excelência em conexões", h: "h-14" },
  { name: "Transfluid", logo: logoTransfluid, href: "https://www.transfluid.de/", tagline: "Soluções completas para mangueiras e conexões", h: "h-14" },
  { name: "Marzocchi", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/", tagline: "Bombas e motores de alta performance", h: "h-14" },
  { name: "Next Powertech", logo: logoNext, href: "https://www.powertechhoses.com/our-products", tagline: "Sistemas hidráulicos avançados", h: "h-10" },
  { name: "Gebr. Held", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm", tagline: "Ferramentas para fundição e precisão", h: "h-12" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#020617] text-white"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg.url}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        {/* Left-to-right dark gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-8 pt-32 md:pt-36 pb-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 bg-blue-900/50 border border-blue-400/50 px-5 py-2 rounded-full backdrop-blur-md mb-10">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.28em] font-bold text-white font-mono">
            Especialistas em cadeia de fluidos
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold leading-[1.02] tracking-tight max-w-3xl">
          <span className="block text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            Sua operação
          </span>
          <span className="block text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            não pode parar.
          </span>
          <span className="block mt-6 text-white text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem]">
            A <span className="text-blue-400">Comex10</span> mantém
          </span>
          <span className="block text-white text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem]">
            sua cadeia de fluidos
          </span>
          <span className="block text-blue-400 text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem]">
            em movimento.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-base md:text-lg text-slate-200 max-w-lg leading-relaxed font-light">
          Soluções completas para máxima confiabilidade,
          <br className="hidden sm:inline" />
          desempenho e continuidade da sua operação.
        </p>

        {/* Hexagon badge — bottom-right */}
        <div className="hidden lg:block absolute right-6 xl:right-12 bottom-64 z-20">
          <div className="relative">
            <div className="absolute -inset-4 bg-cyan-400/20 blur-2xl rounded-full" />
            <div
              className="relative w-40 h-44 flex items-center justify-center"
              style={{
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background:
                  "linear-gradient(160deg, rgba(15,23,42,0.9) 0%, rgba(30,58,138,0.85) 100%)",
                boxShadow:
                  "0 0 30px rgba(34,211,238,0.35), inset 0 0 20px rgba(34,211,238,0.2)",
              }}
            >
              <div className="text-center px-3">
                <div className="font-display text-base font-black text-white leading-tight tracking-tight">
                  TECNOLOGIA
                </div>
                <div className="font-display text-base font-black text-white leading-tight tracking-tight mb-2">
                  ALEMÃ
                </div>
                <div className="text-[8px] font-mono tracking-[0.25em] text-cyan-300">
                  DE ALTA
                </div>
                <div className="text-[8px] font-mono tracking-[0.25em] text-cyan-300 mb-2">
                  PERFORMANCE
                </div>
                <div className="text-lg">🇩🇪</div>
              </div>
            </div>
          </div>
        </div>

        {/* Partners strip */}
        <div className="mt-16 md:mt-24 pb-10">
          <div className="bg-[#0b1220]/85 backdrop-blur-xl border border-white/10 rounded-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 relative z-10">
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
                <div className="h-16 flex items-center justify-center mb-3">
                  <img
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    className={`${p.h} w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100`}
                  />
                </div>
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
