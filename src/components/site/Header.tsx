import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#produtos", label: "Produtos" },
  { href: "#segmentos", label: "Segmentos" },
  { href: "#servicos", label: "Serviços" },
  { href: "#treinamentos", label: "Treinamentos" },
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
          ? "bg-background/85 backdrop-blur-lg border-b border-border shadow-elegant"
          : "bg-transparent"
      }`}
      style={scrolled ? { boxShadow: "var(--shadow-elegant)" } : undefined}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="font-display text-2xl font-bold tracking-tight">
            COMEX<span className="text-primary">10</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contato"
            className="inline-flex items-center justify-center rounded-md px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            Fale com um expert
          </a>
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden p-2 text-foreground"
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
            <a
              href="#contato"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Fale com um expert
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
