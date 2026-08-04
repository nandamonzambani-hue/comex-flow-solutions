import uniflexColor from "@/assets/logos/uniflex-color.png.asset.json";
import transfluidOficial from "@/assets/logos/transfluid-oficial.svg.asset.json";
import logoZec from "@/assets/logos/zec.png";
import logoMarzocchi from "@/assets/logos/marzocchi.png";
import logoHeldAsset from "@/assets/logos/held.png.asset.json";
import logoNextAsset from "@/assets/logos/next-powertech.png.asset.json";

export type PartnerBrand = {
  name: string;
  country: string;
  code: string;
  /** Descrição técnica correta da especialidade da marca. */
  tagline: string;
  logo: string;
  href: string;
  /** Altura do logo dentro do tile branco (todas visualmente equivalentes). */
  h: string;
  /** Fundo do tile: branco por padrão; cor da marca quando o logo é branco. */
  tileBg: string;
  official?: boolean;
};

/** Logos sempre em CORES ORIGINAIS, sobre tile branco, sem filtros monocolores. */
export const partnerBrands: PartnerBrand[] = [
  {
    name: "Uniflex",
    country: "Alemanha",
    code: "DE",
    tagline:
      "Líder mundial em máquinas de crimpagem, corte e limpeza de mangueiras hidráulicas.",
    logo: uniflexColor.url,
    href: "https://www.uniflex.de/",
    h: "h-12 md:h-14",
    tileBg: "#ffffff",
    official: true,
  },
  {
    name: "ZEC",
    country: "Itália",
    code: "IT",
    tagline:
      "Especialista em mangueiras termoplásticas e de alta pressão — thermoplastic tubing and hoses.",
    logo: logoZec,
    href: "https://zecspa.com/",
    h: "h-11 md:h-12",
    tileBg: "#ffffff",
    official: true,
  },
  {
    name: "Next Powertech",
    country: "Itália",
    code: "IT",
    tagline: "Mangueiras industriais high-tech para reposição e montagem técnica.",
    logo: logoNextAsset.url,
    href: "https://www.powertechhoses.com/our-products",
    h: "h-12 md:h-14",
    tileBg: "#5B2B8A",
    official: true,
  },
  {
    name: "Marzocchi Pompe",
    country: "Itália",
    code: "IT",
    tagline: "Bombas e motores de engrenagens de alta performance e eficiência.",
    logo: logoMarzocchi,
    href: "https://www.marzocchipompe.com/en/",
    h: "h-10 md:h-12",
    tileBg: "#ffffff",
    official: true,
  },
  {
    name: "Transfluid",
    country: "Alemanha",
    code: "DE",
    tagline:
      "Fabricante de dobradores de tubos de alta precisão — tbend, tform, tcut e tmotion.",
    logo: transfluidOficial.url,
    href: "https://www.transfluid.de/",
    h: "h-12 md:h-14",
    tileBg: "#ffffff",
    official: true,
  },
  {
    name: "Gebr. Held",
    country: "Alemanha",
    code: "DE",
    tagline:
      "Bancadas de teste de impulso e ferramentas HFW para fundição de alta precisão.",
    logo: logoHeldAsset.url,
    href: "https://held-test-stands.de/downloads.htm",
    h: "h-12 md:h-14",
    tileBg: "#00509E",
    official: true,
  },
];
