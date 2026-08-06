import { useEffect, useState } from "react";
import { Menu, X, Instagram, Linkedin, ChevronDown, ClipboardList } from "lucide-react";
import logoComex from "@/assets/logo-comex10.png";

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


const socials = [
  { href: "https://www.linkedin.com/company/comex10-do-brasil/", label: "LinkedIn", icon: <Linkedin size={14} /> },
  { href: "https://www.instagram.com/comex10dobrasil/", label: "Instagram", icon: <Instagram size={14} /> },
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
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-white"
      }`}
    >
      <div className="relative mx-auto max-w-7xl px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/#top" className="flex items-center shrink-0" aria-label="Comex10">
          <img decoding="async" loading="eager" fetchPriority="high"
            src={logoComex}
            alt="Comex10 do Brasil"
            className="h-12 md:h-14 w-auto object-contain"
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-3">
          {mainLinks.map((l) => (
            <div key={l.href} className="relative group">
              <a
                href={l.href}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors"
              >
                {l.label}
                {l.sub && <ChevronDown size={13} className="opacity-70" />}
              </a>
              {l.sub && (
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute top-full left-1/2 -translate-x-1/2 pt-1 z-50">
                  <div className="min-w-[180px] rounded-md border border-white/10 bg-[#0b1220]/95 backdrop-blur-md shadow-lg py-1.5">
                    {l.sub.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        className="block px-4 py-2 text-sm text-slate-200 hover:bg-white/5 hover:text-cyan-300 transition-colors"
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

        {/* Right cluster */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener"
                aria-label={s.label}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <a
            href="/#contato"
            className="inline-flex items-center gap-2 ml-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]"
          >
            <ClipboardList size={16} />
            Solicitar diagnóstico
          </a>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden p-2 text-slate-800"
          aria-label="Abrir menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-slate-200">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {mainLinks.map((l) => (
              <div key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 rounded-md text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                >
                  {l.label}
                </a>
                {l.sub && (
                  <div className="ml-3 border-l-2 border-blue-500/40 pl-3 mb-1">
                    {l.sub.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        onClick={() => setOpen(false)}
                        className="block px-2 py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-3 mt-2 border-t border-slate-200">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={s.label}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-blue-600 text-white"
                >
                  {s.icon}
                </a>
              ))}
              <a
                href="/#contato"
                onClick={() => setOpen(false)}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-bold"
              >
                <ClipboardList size={14} />
                Diagnóstico
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
