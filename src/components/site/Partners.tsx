const partners = [
  { name: "Uniflex", country: "Alemanha" },
  { name: "Transfluid", country: "Alemanha" },
  { name: "Held", country: "Alemanha" },
  { name: "Marzocchi", country: "Itália" },
  { name: "ZEC", country: "Itália" },
  { name: "Next", country: "Brasil" },
  { name: "Gates", country: "EUA" },
  { name: "Parker", country: "EUA" },
];

export function Partners() {
  return (
    <section id="parceiros" className="py-24 md:py-32 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Parceiros
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Marcas líderes globais.
          </h2>
          <p className="text-lg text-muted-foreground">
            Trabalhamos com os fabricantes mais respeitados do mundo em hidráulica e
            cadeia de fluidos.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {partners.map((p) => (
            <div
              key={p.name}
              className="aspect-[3/2] flex flex-col items-center justify-center rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-surface transition-all group"
            >
              <div className="font-display text-2xl md:text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">
                {p.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                {p.country}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
