import heroImg from "@/assets/hero-uniflex.jpg";
import { ArrowRight, MessageCircle } from "lucide-react";
import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeld from "@/assets/logos/held.png";
import logoNext from "@/assets/logos/next-powertech.png";

const partners = [
  { name: "Uniflex", country: "Alemanha", logo: logoUniflex, href: "https://www.uniflex.de/" },
  { name: "ZEC", country: "Itália", logo: logoZec, href: "https://zecspa.com/" },
  { name: "Next Powertech", country: "Itália", logo: logoNext, href: "https://www.powertechhoses.com/our-products" },
  { name: "Marzocchi", country: "Itália", logo: logoMarzocchi, href: "https://www.marzocchipompe.com/en/" },
  { name: "Transfluid", country: "Alemanha", logo: logoTransfluid, href: "https://www.transfluid.de/" },
  { name: "Held", country: "Alemanha", logo: logoHeld, href: "https://held-test-stands.de/downloads.htm" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[88vh] md:min-h-screen md:max-h-[1100px] flex items-center overflow-hidden pt-28 md:pt-24 pb-10"
    >
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Máquina Uniflex HM em operação na oficina COMEX 10"
          width={1920}
          height={1280}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)", opacity: 0.7 }} />
        <div className="absolute inset-0 bg-background/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 md:px-8 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/40 backdrop-blur-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wide uppercase text-primary">
              Expert em cadeia de fluidos
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5 text-white">
            Do problema
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              à solução.
            </span>
          </h1>

          <p className="text-base md:text-lg text-neutral-100 max-w-2xl mb-8 leading-relaxed">
            Falhas em sistemas hidráulicos muitas vezes começam antes da operação:
            na especificação, na montagem ou na ausência de validação técnica. A
            COMEX 10 é sua parceira técnica em equipamentos, mangueiras, bombas e
            soluções industriais certificadas.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="#produtos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm md:text-base font-semibold text-primary-foreground transition-all hover:scale-105"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              Ver soluções <ArrowRight size={18} />
            </a>
            <a
              href="https://wa.me/5511914900404"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm md:text-base font-semibold border border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
            >
              <MessageCircle size={18} /> Falar com especialista
            </a>
          </div>
        </div>

        {/* Partners highlight card */}
        <div className="hidden lg:block lg:col-span-5">
          <div
            className="relative p-6 rounded-2xl border border-white/15 bg-background/55 backdrop-blur-md"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold tracking-wide uppercase">
              Parceiros estratégicos
            </div>
            <p className="text-sm text-neutral-200 mb-5 mt-2">
              Marcas líderes globais em hidráulica e cadeia de fluidos.
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {partners.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener nofollow"
                  title={`${p.name} — ${p.country}`}
                  className="aspect-[5/3] flex items-center justify-center rounded-md border border-neutral-200 bg-white hover:border-primary transition-colors p-2"
                >
                  <img
                    src={p.logo}
                    alt={`Logo ${p.name}`}
                    className="max-h-7 w-auto object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
