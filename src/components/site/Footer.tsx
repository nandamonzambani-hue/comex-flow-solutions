import { Instagram, Linkedin, MapPin, Phone, Mail, Clock } from "lucide-react";
import logo from "@/assets/logo-comex10.png";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white text-neutral-800">
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <img
              src={logo}
              alt="Comex10 do Brasil"
              width={180}
              height={54}
              className="h-12 w-auto bg-white/95 px-2 py-1 rounded mb-4"
            />
            <p className="text-sm text-neutral-600 max-w-sm mb-4">
              Parceiro técnico em cadeia de fluidos: equipamentos, mangueiras,
              bombas, testes e treinamentos.
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-600 mb-4">
              <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 text-primary flex-shrink-0" /><span>R. Marcelo Muller, 415 — São Paulo/SP — 03223-060</span></li>
              <li className="flex items-center gap-2"><Phone size={13} className="text-primary flex-shrink-0" /><a href="https://wa.me/5511914900404" target="_blank" rel="noopener" className="hover:text-primary transition-colors">11 91490-0404 (WhatsApp)</a></li>
              <li className="flex items-center gap-2"><Mail size={13} className="text-primary flex-shrink-0" /><a href="mailto:contato@comex10.com.br" className="hover:text-primary transition-colors">contato@comex10.com.br</a></li>
              <li className="flex items-center gap-2"><Clock size={13} className="text-primary flex-shrink-0" /><span>2ª a 6ª — 8:30 às 17:30h</span></li>
            </ul>
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/comex10dobrasil/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram da Comex10"
                className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 hover:border-primary hover:text-primary transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/company/comex10-do-brasil/"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn da Comex10"
                className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 hover:border-primary hover:text-primary transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-3">
              Navegação
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="#produtos" className="hover:text-primary transition-colors">Produtos</a></li>
              <li><a href="#segmentos" className="hover:text-primary transition-colors">Segmentos</a></li>
              <li><a href="#servicos" className="hover:text-primary transition-colors">Serviços</a></li>
              <li><a href="#treinamentos" className="hover:text-primary transition-colors">Treinamentos</a></li>
              <li><a href="#parceiros" className="hover:text-primary transition-colors">Parceiros</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-3">
              Catálogos
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="/catalogos/Catalogo_Uniflex.pdf" target="_blank" rel="noopener" className="hover:text-primary transition-colors">Uniflex</a></li>
              <li><a href="/catalogos/ZEC_Catalogo_America_Latina.pdf" target="_blank" rel="noopener" className="hover:text-primary transition-colors">ZEC</a></li>
              <li><a href="/catalogos/Company_Profile_Marzocchi.pdf" target="_blank" rel="noopener" className="hover:text-primary transition-colors">Marzocchi</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Comex10 do Brasil. Todos os direitos reservados.
          </div>
          <div className="text-xs text-neutral-600">
            Cadeia de fluidos • Mangueiras • Equipamentos • Treinamentos
          </div>
        </div>
      </div>
    </footer>
  );
}
