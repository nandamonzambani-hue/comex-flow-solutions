import { useEffect, useState } from "react";
import { Menu, X, Instagram, Linkedin, Phone, ChevronDown } from "lucide-react";

const mainLinks = [
  { href: "/#quem-somos", label: "Quem Somos" },
  {
    href: "/#produtos",
    label: "Soluções",
    submenu: [
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

      <div className="relative px-4 py-3 md:px-8 md:py-4 flex items-center justify-between bg-white">
        {/* Wordmark */}
        <a href="/#top" className="flex items-center group" aria-label="Comex10 — voltar ao topo">
          <span
            className="font-display text-2xl md:text-3xl font-bold tracking-tight text-neutral-900"
            style={{ letterSpacing: "-0.04em" }}
          >
            Comex<span className="text-primary">10</span>
          </span>
          <span className="hidden md:inline ml-2 text-[10px] uppercase tracking-[0.18em] text-neutral-500 mt-2">
            do Brasil
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {mainLinks.map((l) =>
            l.submenu ? (
              <div key={l.label} className="relative group">
                <a
                  href={l.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-primary transition-colors"
                >
                  {l.label}
                  <ChevronDown size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all">
                  <div className="min-w-[200px] rounded-lg border border-border bg-white shadow-lg py-2">
                    {l.submenu.map((s) => (
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
              </div>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-neutral-700 hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ),
          )}
        </nav>

        {/* Right cluster: socials */}
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
              <div key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
                {l.submenu && (
                  <div className="pl-4 border-l border-border ml-3 my-1">
                    {l.submenu.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 rounded-md text-sm text-neutral-600 hover:text-primary transition-colors"
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
              <a href="tel:+551126017483" className="ml-auto text-sm font-medium text-neutral-600">
                11 2601-7483
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
