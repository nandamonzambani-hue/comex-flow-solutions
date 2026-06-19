import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

const partners = [
  { name: "Uniflex", logo: logoUniflex, href: "https://www.uniflex.de/", h: "h-9" },
  { name: "ZEC", logo: logoZec, href: "https://zecspa.com/", h: "h-9" },
  { name: "Next Powertech", logo: logoNext, href: "https://www.powertechhoses.com/our-products", h: "h-8" },
  { name: "Marzocchi", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/", h: "h-9" },
  { name: "Transfluid", logo: logoTransfluid, href: "https://www.transfluid.de/", h: "h-14" },
  { name: "Held", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm", h: "h-9" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[92svh] lg:min-h-[calc(100svh-110px)] flex items-center overflow-hidden pt-24 md:pt-28 pb-14 md:pb-20 bg-[#020617] text-white"
    >
      {/* Technical background layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-blue-600/25 blur-[150px] rounded-full" />
        <div className="absolute -bottom-32 left-1/4 w-[480px] h-[480px] bg-cyan-500/15 blur-[140px] rounded-full" />
        {/* Scan line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#020617_95%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <div className="flex flex-col space-y-7">
            <div className="inline-flex items-center space-x-3 bg-blue-900/30 border border-blue-500/40 px-4 py-1.5 rounded-sm backdrop-blur-md w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-300 font-mono">
                Tecnologia alemã de alta performance
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.05] tracking-tight">
              <span className="text-slate-100 block mb-2">
                Sua operação não pode parar.
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.35)]">
                A Comex10 mantém sua cadeia de fluidos em movimento.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-light">
              Sistemas hidráulicos de precisão para indústrias que exigem{" "}
              <span className="text-white font-medium">zero downtime</span> e
              performance certificada.
            </p>

            <div className="flex flex-wrap gap-4">
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
                className="px-8 md:px-10 py-4 md:py-5 border border-white/20 hover:border-cyan-400/60 hover:bg-white/10 text-white font-semibold text-sm uppercase tracking-wider skew-x-[-12deg] transition-all backdrop-blur-sm"
              >
                <span className="inline-block skew-x-[12deg]">Falar com especialista</span>
              </a>
            </div>
          </div>

          {/* Right column — partners card */}
          <aside className="relative flex justify-center lg:justify-end">
            <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 to-blue-600 opacity-25 blur-xl rounded-sm" />
            <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-7 md:p-9 w-full max-w-md shadow-2xl overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400/60" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400/60" />

              <div className="mb-7 flex items-baseline justify-between">
                <h3 className="text-xs uppercase tracking-[0.25em] font-black text-slate-400">
                  Marcas parceiras
                </h3>
                <span className="text-[9px] text-cyan-400 font-mono tracking-widest">
                  CERTIFIED_GLOBAL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {partners.map((p) => (
                  <a
                    key={p.name}
                    href={p.href}
                    target="_blank"
                    rel="noopener nofollow"
                    title={p.name}
                    className="bg-white flex items-center justify-center p-4 h-24 shadow-inner hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all"
                  >
                    <img
                      src={p.logo}
                      alt={`Logo ${p.name}`}
                      className={`${p.h} w-auto object-contain`}
                    />
                  </a>
                ))}
              </div>

              <div className="mt-7 pt-5 border-t border-white/10">
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-[9px] font-mono text-cyan-400 tracking-widest">
                    AUTH_STATUS: OK
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 tracking-widest">
                    FLUID_DYNAMICS_V4.2
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
