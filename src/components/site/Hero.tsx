import heroImg from "@/assets/hero-uniflex.jpg";

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[calc(100svh-80px)] flex items-center overflow-hidden pt-28 md:pt-32 pb-12 md:pb-16"
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
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.72 }} />
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

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6 text-white">
            Referência técnica em
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              soluções hidráulicas.
            </span>
          </h1>

          <p className="text-base md:text-lg text-neutral-100 max-w-2xl leading-relaxed">
            A Comex10 do Brasil é referência técnica em soluções hidráulicas. Mais do
            que vender máquinas e mangueiras, entregamos diagnóstico, projetos,
            equipamentos certificados e capacitação técnica para garantir que a sua
            operação continue funcionando com segurança e eficiência. Atuamos lado a
            lado com as principais marcas líderes mundiais, oferecendo soluções
            completas e personalizadas para resolver, de fato, as necessidades do
            seu negócio.
          </p>
        </div>
      </div>
    </section>
  );
}
