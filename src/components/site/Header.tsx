import { useEffect, useState } from "react";
import { Menu, X, Instagram, Linkedin, Phone, ChevronDown } from "lucide-react";
import logoComex from "@/assets/logo-comex10.png";
import TranslateButton from "@/components/site/TranslateButton";

type Link = {
  href: string;
  label: string;
  sub?: { href: string; label: string }[];
};

const mainLinks: Link[] = [
  { href: "/#quem-somos", label: "Quem Somos" },
  {
    href: "/#solucoes",
    label: "Soluções",
    sub: [
      { href: "/#produtos", label: "Produtos" },
      { href: "/#servicos", label: "Serviços" },
      { href: "/#treinamentos", label: "Treinamentos" },
    ],
  },
  { href: "/#segmentos", label: "Segmentos" },
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

      <div className="relative px-4 py-3 md:px-8 md:py-3.5 flex items-center justify-between gap-4 bg-white">
        {/* Logo (unchanged image) */}
        <a href="/#top" className="flex items-center shrink-0" aria-label="Comex10 — voltar ao topo">
          <img
            src={logoComex}
            alt="Comex10 do Brasil"
            className="h-10 md:h-11 w-auto object-contain"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
          {mainLinks.map((l) => (
            <div key={l.href} className="relative group">
              <a
                href={l.href}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-semibold text-neutral-800 hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {l.label}
                {l.sub && <ChevronDown size={13} className="opacity-60" />}
              </a>
              {l.sub && (
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute top-full left-1/2 -translate-x-1/2 pt-1 z-50">
                  <div className="min-w-[180px] rounded-lg border border-border bg-white shadow-lg py-1.5">
                    {l.sub.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right cluster: socials + translate */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
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
              <div key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 rounded-md text-sm font-semibold text-neutral-800 hover:bg-neutral-100 hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
                {l.sub && (
                  <div className="ml-3 border-l-2 border-primary/30 pl-3 mb-1">
                    {l.sub.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        onClick={() => setOpen(false)}
                        className="block px-2 py-2 text-sm text-neutral-600 hover:text-primary transition-colors"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
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
