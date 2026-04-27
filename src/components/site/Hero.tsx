import heroImg from "@/assets/hero-comex.jpg";
import { ArrowRight, ShieldCheck, Wrench, GraduationCap } from "lucide-react";

export function Hero() {
  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Mangueiras hidráulicas industriais em oficina COMEX 10"
          width={1920}
          height={1280}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-8 pt-32 pb-20 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wide uppercase text-primary">
              Expert em cadeia de fluidos
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 text-center mx-0">
            Do problema à solução.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              ​
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            80% das falhas em sistemas hidráulicos acontecem na montagem. A COMEX 10 é
            sua consultoria técnica em equipamentos, mangueiras, bombas, testes e
            treinamentos certificados.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <a
              href="#produtos"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-base font-semibold text-primary-foreground transition-all hover:scale-105"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              Ver soluções <ArrowRight size={18} />
            </a>
            <a
              href="#contato"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md text-base font-semibold border border-border bg-surface/60 backdrop-blur-sm hover:bg-surface transition-all"
            >
              Falar com especialista
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-xl">
            {[
              { icon: ShieldCheck, label: "Testes & Certificações" },
              { icon: Wrench, label: "Equipamentos premium" },
              { icon: GraduationCap, label: "Hub de treinamento" },
            ].map((i) => (
              <div key={i.label} className="flex flex-col items-start gap-2">
                <div className="p-2 rounded-md bg-primary/10 border border-primary/20">
                  <i.icon size={18} className="text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium text-muted-foreground leading-tight">
                  {i.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Partners highlight card */}
        <div className="lg:col-span-5">
          <div
            className="relative p-8 rounded-2xl border border-border bg-surface/70 backdrop-blur-md"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wide uppercase">
              Parceiros estratégicos
            </div>
            <p className="text-sm text-muted-foreground mb-6 mt-2">
              Representamos as marcas líderes globais em hidráulica, transmissão de
              fluidos e equipamentos de montagem.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "UNIFLEX", country: "Alemanha" },
                { name: "TRANSFLUID", country: "Alemanha" },
                { name: "HELD", country: "Alemanha" },
                { name: "MARZOCCHI", country: "Itália" },
                { name: "ZEC", country: "Itália" },
                { name: "NEXT", country: "Brasil" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="aspect-[5/3] flex flex-col items-center justify-center rounded-md bg-background/60 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="font-display text-lg font-bold tracking-tight">
                    {p.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
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
