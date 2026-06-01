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

          <p className="text-base md:text-lg text-neutral-100 max-w-2xl leading-relaxed mb-8">
            A Comex10 do Brasil é referência técnica em soluções hidráulicas. Mais do
            que vender máquinas e mangueiras, entregamos diagnóstico, projetos,
            equipamentos certificados e capacitação técnica para garantir que a sua
            operação continue funcionando com segurança e eficiência. Atuamos lado a
            lado com as principais marcas líderes mundiais, oferecendo soluções
            completas e personalizadas para resolver, de fato, as necessidades do
            seu negócio.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/5511914900404?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20especialista%20da%20Comex10."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white shadow-lg transition-all hover:scale-[1.03] active:scale-95"
              style={{
                backgroundColor: "#25D366",
                boxShadow: "0 10px 30px -10px rgba(37, 211, 102, 0.55)",
              }}
            >
              Fale com um especialista
            </a>
            <a
              href="#solucoes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              Ver soluções
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
