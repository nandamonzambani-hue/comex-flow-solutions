import heroImg from "@/assets/hero-uniflex.jpg";
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
      className="relative min-h-[92svh] lg:min-h-[calc(100svh-110px)] flex items-center overflow-hidden pt-24 md:pt-28 pb-10 md:pb-14"
    >
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Máquina Uniflex HM em operação na oficina Comex10"
          width={1920}
          height={1280}
          loading="eager"
          // @ts-expect-error fetchpriority is a valid HTML attribute
          fetchpriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.78 }} />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/40 backdrop-blur-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-primary">
                Expert em cadeia de fluidos
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.05] mb-6 text-white">
              Mais que fornecedora.
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                Seu parceiro técnico
              </span>
              <span className="text-white"> em sistemas de fluidos.</span>
            </h1>

            <p className="text-base md:text-lg text-neutral-100 max-w-2xl leading-relaxed">
              Diagnóstico, projetos, equipamentos certificados e capacitação técnica
              para garantir que sua operação continue funcionando com segurança e
              eficiência — ao lado das principais marcas líderes mundiais.
            </p>
          </div>

          {/* Partner brands — vertical column on the side */}
          <aside className="lg:col-span-4">
            <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-2xl p-5 md:p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary text-center mb-4">
                Marcas parceiras
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {partners.map((p) => (
                  <a
                    key={p.name}
                    href={p.href}
                    target="_blank"
                    rel="noopener nofollow"
                    title={p.name}
                    className="flex items-center justify-center px-3 py-3 rounded-lg border border-neutral-200 bg-white hover:border-primary hover:shadow-sm transition-all min-h-[64px]"
                  >
                    <img
                      src={p.logo}
                      alt={`Logo ${p.name}`}
                      className={`${p.h} w-auto object-contain`}
                    />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
