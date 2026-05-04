import heroImg from "@/assets/hero-uniflex.jpg";
import { ArrowRight, ShieldCheck, Wrench, GraduationCap } from "lucide-react";

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen max-h-[1100px] flex items-center overflow-hidden pt-24 pb-10"
    >
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Máquina Uniflex HM em operação na oficina COMEX 10"
          width={1920}
          height={1280}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-8 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/40 backdrop-blur-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wide uppercase text-primary">
              Expert em cadeia de fluidos
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5 text-white">
            Do problema
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              à solução.
            </span>
          </h1>

          <p className="text-base md:text-lg text-neutral-200 max-w-2xl mb-7 leading-relaxed">
            Falhas em sistemas hidráulicos muitas vezes começam antes da operação:
            na especificação, na montagem ou na ausência de validação técnica. A
            COMEX 10 é sua parceira técnica em equipamentos, mangueiras, bombas,
            testes e treinamentos certificados.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href="#produtos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm md:text-base font-semibold text-primary-foreground transition-all hover:scale-105"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              Ver soluções <ArrowRight size={18} />
            </a>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm md:text-base font-semibold border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
            >
              Falar com especialista
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl">
            {[
              { icon: ShieldCheck, label: "Testes & Certificações" },
              { icon: Wrench, label: "Equipamentos premium" },
              { icon: GraduationCap, label: "Hub de treinamento" },
            ].map((i) => (
              <div
                key={i.label}
                className="flex flex-col items-start gap-2 p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-white/10"
              >
                <div className="p-1.5 rounded-md bg-primary/20 border border-primary/40">
                  <i.icon size={16} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-white leading-tight">
                  {i.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Partners highlight card */}
        <div className="hidden lg:block lg:col-span-5">
          <div
            className="relative p-6 rounded-2xl border border-white/15 bg-background/60 backdrop-blur-md"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wide uppercase">
              Parceiros estratégicos
            </div>
            <p className="text-sm text-neutral-300 mb-5 mt-2">
              Marcas líderes globais em hidráulica e cadeia de fluidos.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: "UNIFLEX", country: "Alemanha", featured: true },
                { name: "TRANSFLUID", country: "Alemanha" },
                { name: "HELD", country: "Alemanha" },
                { name: "MARZOCCHI", country: "Itália" },
                { name: "ZEC", country: "Itália" },
                { name: "NEXT", country: "Brasil" },
              ].map((p) => (
                <div
                  key={p.name}
                  className={`aspect-[5/2.5] flex flex-col items-center justify-center rounded-md border transition-colors ${
                    p.featured
                      ? "bg-primary/15 border-primary/60"
                      : "bg-background/60 border-white/10 hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`font-display text-base font-bold tracking-tight ${
                      p.featured ? "text-primary" : "text-white"
                    }`}
                  >
                    {p.name}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-neutral-400 mt-0.5">
                    {p.country}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
