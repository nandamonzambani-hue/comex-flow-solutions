import heroImg from "@/assets/hero-uniflex.jpg";

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[88svh] lg:min-h-[calc(100svh-110px)] flex items-center overflow-hidden pt-24 md:pt-28 pb-10 md:pb-14"
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
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.74 }} />
        <div className="absolute inset-0 bg-background/25" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/40 backdrop-blur-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wide uppercase text-primary">
              Expert em cadeia de fluidos
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.05] mb-6 text-white">
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
      </div>
    </section>
  );
}
