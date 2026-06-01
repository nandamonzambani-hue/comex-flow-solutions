import { useEffect, useState } from "react";
import { Menu, X, Instagram, Linkedin, Phone } from "lucide-react";
import logoComex from "@/assets/logo-comex10.png";
import TranslateButton from "@/components/site/TranslateButton";

const mainLinks = [
  { href: "/#solucoes", label: "Soluções", highlight: true },
  { href: "/#produtos", label: "Produtos" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#treinamentos", label: "Treinamentos" },
  { href: "/#quem-somos", label: "Quem Somos" },
  { href: "/#segmentos", label: "Segmentos" },
  { href: "/#certificados", label: "Certificações" },
  { href: "/#parceiros", label: "Parceiros" },
  { href: "/blog", label: "Blog" },
  { href: "/#contato", label: "Contato" },
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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white ${
        scrolled ? "border-b border-border" : ""
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
          <div className="text-neutral-500">
            Soluções hidráulicas técnicas certificadas
          </div>
        </div>
      </div>

      <div className="relative px-4 py-3 md:px-8 md:py-4 flex items-center justify-between bg-white">
        {/* Logo */}
        <a href="/#top" className="flex items-center group" aria-label="Comex10 — voltar ao topo">
          <img
            src={logoComex}
            alt="Comex10 do Brasil"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {mainLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={
                l.highlight
                  ? "relative text-sm font-bold uppercase tracking-wide text-primary hover:text-primary-glow transition-colors after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-primary/60 after:rounded-full"
                  : "text-sm font-medium text-neutral-700 hover:text-primary transition-colors"
              }
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right cluster: socials + translate */}
        <div className="hidden lg:flex items-center gap-2 ml-4">
          <a
            href="https://www.instagram.com/comex10dobrasil/"
            target="_blank"
            rel="noopener"
            aria-label="Instagram"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border text-neutral-600 hover:text-primary hover:border-primary/60 transition-colors"
          >
            <Instagram size={15} />
          </a>
          <a
            href="https://www.linkedin.com/company/comex10-do-brasil/"
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border text-neutral-600 hover:text-primary hover:border-primary/60 transition-colors"
          >
            <Linkedin size={15} />
          </a>
          <div className="w-px h-6 bg-border mx-1" />
          <TranslateButton variant="inline" />
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden p-2 text-neutral-800"
          aria-label="Abrir menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-border">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {mainLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={
                  l.highlight
                    ? "block px-3 py-3 rounded-md text-sm font-bold uppercase tracking-wide text-primary bg-primary/5"
                    : "block px-3 py-3 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-primary transition-colors"
                }
              >
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-2 px-3 py-3 mt-2 border-t border-border">
              <a
                href="https://www.instagram.com/comex10dobrasil/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-neutral-600"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.linkedin.com/company/comex10-do-brasil/"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-neutral-600"
              >
                <Linkedin size={16} />
              </a>
              <div className="ml-auto">
                <TranslateButton variant="inline" />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
