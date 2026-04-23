import { Mail, Phone, MapPin, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contato" className="py-24 md:py-32 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at top right, var(--primary), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">
              Contato
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6 leading-tight">
              Vamos resolver
              <br />o seu problema técnico.
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Conte para a nossa equipe o desafio da sua operação. Respondemos em até
              um dia útil com um especialista da cadeia de fluidos.
            </p>

            <div className="space-y-5">
              <a
                href="mailto:contato@comex10dobrasil.com.br"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Mail className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    contato@comex10dobrasil.com.br
                  </div>
                </div>
              </a>

              <a href="tel:+551100000000" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Phone className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Telefone
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    Fale com o comercial
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Brasil
                  </div>
                  <div className="font-medium">Atendimento em todo o território nacional</div>
                </div>
              </div>

              <a
                href="https://www.instagram.com/comex10dobrasil/"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Instagram className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Instagram
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    @comex10dobrasil
                  </div>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/company/comex10-do-brasil/"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <Linkedin className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    LinkedIn
                  </div>
                  <div className="font-medium group-hover:text-primary transition-colors">
                    COMEX 10 do Brasil
                  </div>
                </div>
              </a>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="p-8 rounded-2xl border border-border bg-surface"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            {submitted ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-4">
                  <ArrowRight className="text-primary" size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">Mensagem enviada</h3>
                <p className="text-muted-foreground">
                  Em breve um especialista da COMEX 10 entrará em contato.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="font-display text-2xl font-bold mb-1">Solicite um diagnóstico</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Preencha e nossa equipe responde em até um dia útil.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Nome
                    </label>
                    <input
                      required
                      type="text"
                      className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Empresa
                    </label>
                    <input
                      type="text"
                      className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      E-mail
                    </label>
                    <input
                      required
                      type="email"
                      className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Conte sobre o problema
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Ex.: minha mangueira está rompendo na operação..."
                    className="mt-1.5 w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                >
                  Enviar mensagem <ArrowRight size={16} />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
