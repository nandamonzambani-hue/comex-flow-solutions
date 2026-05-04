import logoUniflex from "@/assets/logos/uniflex.jpeg";
import logoTransfluid from "@/assets/logos/transfluid.jpg";
import logoZec from "@/assets/logos/zec.png";

type Partner = {
  name: string;
  country: string;
  logo?: string;
  href: string;
  featured?: boolean;
  tagline?: string;
};

const partners: Partner[] = [
  {
    name: "Uniflex",
    country: "Alemanha",
    logo: logoUniflex,
    href: "https://www.uniflex.de/",
    featured: true,
    tagline: "Equipamentos de produção e teste de mangueiras",
  },
  {
    name: "Transfluid",
    country: "Alemanha",
    logo: logoTransfluid,
    href: "https://www.transfluid.de/",
  },
  { name: "Held", country: "Alemanha", href: "#" },
  { name: "Marzocchi", country: "Itália", href: "https://www.marzocchipompe.com/" },
  { name: "ZEC", country: "Itália", logo: logoZec, href: "https://www.zecitaly.com/" },
  { name: "Next", country: "Brasil", href: "#" },
];

export function Partners() {
  const featured = partners.find((p) => p.featured)!;
  const others = partners.filter((p) => !p.featured);

  return (
    <section id="parceiros" className="py-24 md:py-32 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Parceiros estratégicos
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Marcas líderes globais.
          </h2>
          <p className="text-lg text-muted-foreground">
            Trabalhamos com os fabricantes mais respeitados do mundo em hidráulica e
            cadeia de fluidos.
          </p>
        </div>

        {/* Uniflex em destaque */}
        <a
          href={featured.href}
          target="_blank"
          rel="noopener"
          className="block mb-6 group"
        >
          <div
            className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-white p-8 md:p-10 grid md:grid-cols-3 gap-6 items-center transition-all hover:border-primary"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
              Parceiro principal
            </div>
            <div className="md:col-span-1 flex items-center justify-center">
              <img
                src={featured.logo}
                alt={`Logo ${featured.name}`}
                className="max-h-24 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="md:col-span-2 text-neutral-800">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">
                {featured.country} • desde 1972
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                {featured.name}
              </h3>
              <p className="text-sm md:text-base text-neutral-600">
                {featured.tagline} — referência mundial em crimpadoras, decapadoras,
                máquinas de corte e bancadas de teste para a indústria hidráulica.
              </p>
            </div>
          </div>
        </a>

        {/* Demais parceiros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {others.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target={p.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener"
              className="aspect-[3/2] flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white hover:border-primary hover:shadow-md transition-all group p-3"
            >
              {p.logo ? (
                <img
                  src={p.logo}
                  alt={`Logo ${p.name}`}
                  className="max-h-10 w-auto object-contain mb-1 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="font-display text-xl md:text-2xl font-bold tracking-tight text-primary">
                  {p.name}
                </div>
              )}
              <div className="text-[10px] text-primary/80 mt-1 uppercase tracking-wider font-semibold">
                {p.country}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
