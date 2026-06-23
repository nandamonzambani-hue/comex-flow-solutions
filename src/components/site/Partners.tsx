import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

type Partner = {
  name: string;
  country: string;
  code: string;
  tagline: string;
  logo: string;
  href: string;
  maxH?: string;
};

const partners: Partner[] = [
  { name: "Uniflex", country: "Alemanha", code: "DE", tagline: "Líder mundial em máquinas para crimpagem", logo: logoUniflex, href: "https://www.uniflex.de/", maxH: "max-h-14" },
  { name: "ZEC", country: "Itália", code: "IT", tagline: "Excelência em conexões — The Original. Better. Direct.", logo: logoZec, href: "https://zecspa.com/", maxH: "max-h-14" },
  { name: "Next Powertech", country: "Itália", code: "IT", tagline: "Sistemas hidráulicos avançados", logo: logoNext, href: "https://www.powertechhoses.com/our-products", maxH: "max-h-12" },
  { name: "Marzocchi Pompe", country: "Itália", code: "IT", tagline: "Bombas e motores de alta performance", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/", maxH: "max-h-14" },
  { name: "Transfluid", country: "Alemanha", code: "DE", tagline: "Soluções completas para mangueiras e conexões", logo: logoTransfluid, href: "https://www.transfluid.de/", maxH: "max-h-16" },
  { name: "Gebr. Held", country: "Alemanha", code: "DE", tagline: "Ferramentas hidráulicas para fundição e precisão", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm", maxH: "max-h-14" },
];

export function Partners() {
  return (
    <section
      id="parceiros"
      className="scroll-mt-24 py-20 md:py-28 relative overflow-hidden bg-[#020617] text-white"
    >
      {/* Technical background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-blue-600/15 blur-[160px] rounded-full" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-3xl mb-14 text-center mx-auto">
          <div className="inline-flex items-center space-x-3 bg-blue-900/30 border border-blue-500/40 px-4 py-1.5 rounded-sm backdrop-blur-md mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-300 font-mono">
              Parceiros
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5">
            <span className="text-slate-100">Comex10, parceiro estratégico </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
              no Brasil das marcas globais.
            </span>
          </h2>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener nofollow"
              title={`${p.name} — ${p.country}`}
              className="group relative flex flex-col bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all p-6 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="bg-white h-24 flex items-center justify-center mb-5 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] transition-shadow">
                <img
                  src={p.logo}
                  alt={`Logo ${p.name}`}
                  className={`${p.maxH ?? "max-h-14"} w-auto object-contain`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[9px] text-cyan-400 tracking-[0.25em]">
                    {p.code}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {p.country}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-1.5">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.tagline}</p>
              </div>
              <div className="mt-4 h-0.5 w-10 bg-cyan-400/60 transition-all group-hover:w-20 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            </a>
          ))}
        </div>

        <div className="mt-14 text-center max-w-2xl mx-auto">
          <p className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2">
            Qualidade ao alcance de todos!
          </p>
          <p className="text-base text-slate-400 font-light">
            O elo estratégico das referências globais no Brasil.{" "}
            <a
              href="#contato"
              className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-300 font-semibold"
            >
              Fale conosco!
            </a>
          </p>
        </div>

      </div>
    </section>
  );
}
