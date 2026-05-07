import treinamentoImg from "@/assets/treinamento.jpg";
import { GraduationCap, Building2, Check } from "lucide-react";

export function Trainings() {
  return (
    <section id="treinamentos" className="py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden order-2 lg:order-1">
            <img
              src={treinamentoImg}
              alt="Treinamento técnico em mangueiras hidráulicas na COMEX 10"
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
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-3 mb-6 leading-tight">
              Hub de conhecimento técnico.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Capacitamos sua equipe para reduzir falhas, aumentar a vida útil dos
              componentes e elevar a segurança da operação. Treinamentos certificados
              em duas modalidades:
            </p>

            <div className="space-y-4">
              <div className="p-6 rounded-xl border border-border bg-surface">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      Na COMEX 10
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Treinamento técnico aprofundado sobre montagem, manutenção e
                      especificação de mangueiras hidráulicas.
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        "Identificação de falhas de montagem",
                        "Especificação técnica e dimensionamento",
                        "Boas práticas de operação",
                      ].map((i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-primary flex-shrink-0" />
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-surface">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      In company
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Treinamentos realizados dentro da sua empresa, com conteúdo
                      customizado para o seu setor de atuação.
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        "Capacitação da equipe na sua planta",
                        "Conteúdo customizado para seu setor",
                        "Certificação reconhecida pelo mercado",
                      ].map((i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-primary flex-shrink-0" />
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
