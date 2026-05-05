import { useEffect, useState } from "react";
import { Menu, X, Instagram, Linkedin, Phone } from "lucide-react";
import logo from "@/assets/logo-comex10.png";

const links = [
  { href: "#produtos", label: "Produtos" },
  { href: "#segmentos", label: "Segmentos" },
  { href: "#servicos", label: "Serviços" },
  { href: "#parceiros", label: "Parceiros" },
  { href: "#contato", label: "Contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg border-b border-border"
          : "bg-white/90 backdrop-blur-sm"
      }`}
      style={scrolled ? { boxShadow: "var(--shadow-elegant)" } : undefined}
    >
      {/* Top utility bar */}
      <div className="hidden md:block border-b border-border/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8 h-9 flex items-center justify-between text-xs">
          <div className="flex items-center gap-5 text-neutral-600">
            <a href="tel:+551126017483" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone size={12} /> 11 2601-7483
            </a>
            <span className="hidden lg:inline">2ª a 6ª — 8:30 às 17:30h</span>
            <a href="mailto:contato@comex10.com.br" className="hidden lg:inline hover:text-primary transition-colors">
              contato@comex10.com.br
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/comex10dobrasil/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram da COMEX 10"
              className="text-neutral-600 hover:text-primary transition-colors"
            >
              <Instagram size={14} />
            </a>
            <a
              href="https://www.linkedin.com/company/comex10-do-brasil/"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn da COMEX 10"
              className="text-neutral-600 hover:text-primary transition-colors"
            >
              <Linkedin size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="relative p-6 rounded-2xl border border-white/15 bg-background/60 backdrop-blur-md pl-[24px] flex items-center justify-between bg-white">
        <a href="#top" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Logo COMEX 10 do Brasil — parceiro técnico em cadeia de fluidos"
            width={260}
            height={78}
            className="h-16 md:h-20 w-auto -my-4"
          />
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-neutral-700 hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-2 ml-2 lg:hidden xl:flex">
            <a
              href="https://www.instagram.com/comex10dobrasil/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors"
            >
              <Instagram size={15} />
            </a>
            <a
              href="https://www.linkedin.com/company/comex10-do-brasil/"
              target="_blank"
              rel="noopener"
              aria-label="LinkedIn"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors"
            >
              <Linkedin size={15} />
            </a>
          </div>
          <a
            href="#produtos"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold border border-primary/40 text-primary hover:bg-primary/10 transition-all"
          >
            Ver soluções
          </a>
          <a
            href="https://wa.me/5511914900404"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center rounded-md px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            Falar com especialista
          </a>
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden p-2 text-neutral-800"
          aria-label="Abrir menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-lg border-t border-border">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-2 px-3 py-3">
              <a
                href="https://www.instagram.com/comex10dobrasil/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-muted-foreground"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/comex10-do-brasil/"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-muted-foreground"
              >
                <Linkedin size={16} />
              </a>
              <a href="tel:+551126017483" className="ml-auto text-sm font-medium text-muted-foreground">
                11 2601-7483
              </a>
            </div>
            <a
              href="#produtos"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold border border-primary/40 text-primary"
            >
              Ver soluções
            </a>
            <a
              href="https://wa.me/5511914900404"
              target="_blank"
              rel="noopener"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Falar com especialista
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
