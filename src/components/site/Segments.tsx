import mineracao from "@/assets/segment-mineracao.jpg";
import petroleo from "@/assets/segment-petroleo.jpg";
import agro from "@/assets/segment-agro.jpg";
import industria from "@/assets/segment-industria.jpg";

const segments = [
  {
    img: mineracao,
    alt: "Equipamento de mineração com mangueiras hidráulicas de alta pressão",
    title: "Mineração",
    desc: "Mangueiras de alta resistência à abrasão, reposição rápida e equipamentos para reduzir paradas em frota pesada.",
  },
  {
    img: petroleo,
    alt: "Refinaria de petróleo com tubulações industriais ao pôr do sol",
    title: "Óleo & Gás",
    desc: "Soluções para alta pressão e temperatura, conformes às normas do setor e com rastreabilidade total.",
  },
  {
    img: agro,
    alt: "Trator agrícola com implementos hidráulicos no campo",
    title: "Agro & Florestal",
    desc: "Mangueiras e crimpagem para implementos agrícolas, colheitadeiras e maquinário florestal.",
  },
  {
    img: industria,
    alt: "Linha de prensas hidráulicas em planta industrial",
    title: "Indústria",
    desc: "Manutenção, retrofit e novos projetos em prensas, injetoras e linhas hidráulicas industriais.",
  },
];

export function Segments() {
  return (
    <section id="segmentos" className="py-16 md:py-32 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Segmentos de atuação
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
            Soluções pensadas para o seu setor.
          </h2>
          <p className="text-lg text-muted-foreground">
            Cada operação tem desafios únicos. Selecionamos equipamentos, mangueiras e
            insumos para o seu segmento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {segments.map((s) => (
            <a
              key={s.title}
              href="#produtos"
              className="group relative overflow-hidden rounded-xl border border-border aspect-[16/10] sm:aspect-[4/5] cursor-pointer block"
            >
              <img
                src={s.img}
                alt={s.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent sm:via-background/50" />
              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                <h3 className="font-display text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 max-h-40 sm:max-h-0 sm:group-hover:max-h-40 overflow-hidden">
                  {s.desc}
                </p>
                <div className="mt-2 sm:mt-3 h-1 w-12 bg-primary rounded-full transition-all group-hover:w-24" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
