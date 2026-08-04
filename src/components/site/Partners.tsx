import { partnerBrands } from "./partnersData";

export function Partners() {
  return (
    <section
      id="parceiros"
      className="scroll-mt-24 py-16 md:py-20 lg:h-svh lg:py-0 lg:flex lg:items-center relative overflow-hidden bg-background text-foreground"
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

      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 md:px-8 lg:pt-20">
        <div className="max-w-3xl mb-6 text-center mx-auto">
          <div className="inline-flex items-center space-x-3 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-sm backdrop-blur-md mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary font-display">
              Parceiros
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-[1.05] tracking-tight mb-3">
            <span className="text-foreground">Comex10, parceiro estratégico </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-accent drop-shadow-[0_0_18px_rgba(56,140,255,0.25)]">
              no Brasil
            </span>
            <span className="text-foreground"> das marcas globais.</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-light">
            Distribuidor oficial e autorizado no Brasil das marcas líderes em cadeia de fluidos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerBrands.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener nofollow"
              title={`${p.name} — ${p.country}`}
              className="group relative flex flex-col bg-card backdrop-blur-xl border border-border hover:border-primary/40 transition-all p-4 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Tile branco: logo em CORES ORIGINAIS, sem filtro */}
              <div
                className="rounded-md h-16 flex items-center justify-center px-4 mb-3 group-hover:shadow-[0_0_25px_rgba(56,140,255,0.25)] transition-shadow"
                style={{ backgroundColor: p.tileBg }}
              >
                <img
                  src={p.logo}
                  alt={`Logo ${p.name}`}
                  className={`${p.h} max-w-full object-contain`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-display text-[9px] text-primary tracking-[0.25em]">
                    {p.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {p.country}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-1.5">
                  {p.name}
                </h3>
                {p.official && (
                  <span className="inline-block mb-2 text-[9px] font-display uppercase tracking-[0.18em] text-primary border border-primary/40 bg-primary/20 px-2 py-0.5 rounded-sm">
                    Distribuidor oficial
                  </span>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed">{p.tagline}</p>
              </div>
              <div className="mt-3 h-0.5 w-10 bg-primary/20 transition-all group-hover:w-20 group-hover:shadow-[0_0_10px_rgba(56,140,255,0.25)]" />
            </a>
          ))}
        </div>

        <div className="mt-6 text-center max-w-2xl mx-auto">
          <p className="font-display text-xl md:text-2xl font-extrabold text-foreground mb-1.5">
            Qualidade ao alcance de todos!
          </p>
          <p className="text-sm text-muted-foreground font-light">
            O elo estratégico das referências globais no Brasil.{" "}
            <a
              href="#contato"
              className="text-primary hover:text-primary underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-300 font-semibold"
            >
              Fale conosco!
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
