import treinamentoImg from "@/assets/treinamento.jpg";
import { GraduationCap, Building2, Globe2, Calendar, ArrowRight } from "lucide-react";

type Session = { date: string; language: string };
type CountrySchedule = { flag: string; country: string; sessions: Session[] };

const schedule: CountrySchedule[] = [
  {
    flag: "🇩🇪",
    country: "Alemanha",
    sessions: [
      { date: "22 e 23/04", language: "Alemão" },
      { date: "10 e 11/06", language: "Tcheco" },
      { date: "24 e 25/06", language: "Inglês" },
    ],
  },
  {
    flag: "🇧🇷",
    country: "Brasil",
    sessions: [{ date: "11 e 12/06", language: "Português" }],
  },
  {
    flag: "🇨🇴",
    country: "Colômbia",
    sessions: [{ date: "23 e 24/06", language: "Espanhol" }],
  },
];

export function Trainings() {
  return (
    <section id="treinamentos" className="scroll-mt-24 py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
          <div className="relative rounded-2xl overflow-hidden order-2 lg:order-1">
            <img
              src={treinamentoImg}
              alt="Treinamento técnico em mangueiras hidráulicas na Comex10"
              loading="lazy"
              width={1280}
              height={800}
              className="w-full h-full object-cover aspect-[5/4]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-primary/20" />
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">
              Treinamentos
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-4 leading-tight">
              Capacitação técnica certificada.
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              Treinamentos para reduzir falhas, aumentar a vida útil dos componentes
              e elevar a segurança da operação — na Comex10 ou na sua empresa.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border bg-surface">
                <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-3">
                  <GraduationCap size={20} />
                </div>
                <h3 className="font-display text-base font-semibold mb-1">Na Comex10</h3>
                <p className="text-sm text-muted-foreground">
                  Conteúdo aprofundado sobre montagem, manutenção e especificação.
                </p>
              </div>
              <div className="p-5 rounded-xl border border-border bg-surface">
                <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center mb-3">
                  <Building2 size={20} />
                </div>
                <h3 className="font-display text-base font-semibold mb-1">In company</h3>
                <p className="text-sm text-muted-foreground">
                  Customizado para seu setor, realizado na sua planta.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agenda — full horizontal width */}
        <div
          className="rounded-2xl border border-border overflow-hidden bg-surface"
          style={{ background: "var(--gradient-surface)", boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="p-5 md:p-7 border-b border-border flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe2 size={20} className="text-primary" />
                <h3 className="font-display text-xl md:text-2xl font-bold">
                  Agenda de cursos — 1º semestre
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Datas confirmadas das próximas turmas internacionais.
              </p>
            </div>
            <a
              href="https://wa.me/5511914900404?text=Tenho%20interesse%20em%20uma%20turma%20de%20treinamento%20da%20Comex10."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
              style={{ background: "var(--gradient-primary)" }}
            >
              Reservar minha vaga <ArrowRight size={14} />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-6 py-3 font-semibold w-1/3">País</th>
                  <th className="text-left px-4 py-3 font-semibold w-1/3">Data</th>
                  <th className="text-left px-4 py-3 pr-6 font-semibold w-1/3">Idioma</th>
                </tr>
              </thead>
              <tbody>
                {schedule.flatMap((c) =>
                  c.sessions.map((s, i) => (
                    <tr
                      key={`${c.country}-${s.date}`}
                      className="border-t border-border/60 hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-6 py-4 align-middle">
                        {i === 0 ? (
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl leading-none" aria-hidden>
                              {c.flag}
                            </span>
                            <span className="font-display font-bold text-base">
                              {c.country}
                            </span>
                          </div>
                        ) : (
                          <span className="pl-9 text-muted-foreground/60 text-xs">↳</span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                          <Calendar size={14} /> {s.date}
                        </span>
                      </td>
                      <td className="px-4 py-4 pr-6 align-middle">
                        {s.language}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
