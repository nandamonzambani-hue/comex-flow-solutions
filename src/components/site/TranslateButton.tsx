import { useEffect, useState } from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

type Props = { variant?: "floating" | "inline" };

const TranslateButton = ({ variant = "floating" }: Props) => {
  const [lang, setLang] = useState<"pt" | "en">("pt");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/[^/]+\/(\w+)/);
    if (match && match[1] === "en") setLang("en");

    if (document.getElementById("google-translate-script")) return;

    const hiddenDiv = document.createElement("div");
    hiddenDiv.id = "google_translate_element";
    hiddenDiv.style.display = "none";
    document.body.appendChild(hiddenDiv);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "pt",
          includedLanguages: "en,pt",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    const style = document.createElement("style");
    style.innerHTML = `
      .goog-te-banner-frame, .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      .goog-tooltip, .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background: none !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const setCookie = (value: string) => {
    document.cookie = `googtrans=${value};path=/`;
    document.cookie = `googtrans=${value};path=/;domain=${window.location.hostname}`;
    const root = window.location.hostname.split(".").slice(-2).join(".");
    document.cookie = `googtrans=${value};path=/;domain=.${root}`;
  };

  const switchTo = (target: "pt" | "en") => {
    if (target === lang) return;
    setCookie(target === "en" ? "/pt/en" : "/pt/pt");
    setLang(target);
    window.location.reload();
  };

  if (!mounted) return null;

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-1 notranslate">
        <button
          onClick={() => switchTo("pt")}
          aria-label="Português"
          title="Português"
          className={`flex items-center justify-center w-9 h-9 rounded-md border text-base transition-all ${
            lang === "pt"
              ? "border-primary bg-primary/10"
              : "border-border opacity-70 hover:opacity-100 hover:border-primary/60"
          }`}
        >
          <span role="img" aria-hidden="true">🇧🇷</span>
        </button>
        <button
          onClick={() => switchTo("en")}
          aria-label="English"
          title="English"
          className={`flex items-center justify-center w-9 h-9 rounded-md border text-base transition-all ${
            lang === "en"
              ? "border-primary bg-primary/10"
              : "border-border opacity-70 hover:opacity-100 hover:border-primary/60"
          }`}
        >
          <span role="img" aria-hidden="true">🇺🇸</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 notranslate">
      <div className="flex items-center gap-1 rounded-full bg-background/95 backdrop-blur-md shadow-xl ring-2 ring-primary/40 px-2 py-2">
        <button
          onClick={() => switchTo("en")}
          aria-label="Translate to English"
          title="Translate to English"
          className={`flex items-center justify-center w-10 h-10 rounded-full text-2xl leading-none transition-all duration-200 hover:scale-110 ${
            lang === "en" ? "bg-primary/15 ring-2 ring-primary scale-105" : "opacity-70 hover:opacity-100"
          }`}
        >
          <span role="img" aria-hidden="true">🇺🇸</span>
        </button>
        <span className="text-muted-foreground/60 text-sm font-light select-none">/</span>
        <button
          onClick={() => switchTo("pt")}
          aria-label="Traduzir para Português"
          title="Traduzir para Português"
          className={`flex items-center justify-center w-10 h-10 rounded-full text-2xl leading-none transition-all duration-200 hover:scale-110 ${
            lang === "pt" ? "bg-primary/15 ring-2 ring-primary scale-105" : "opacity-70 hover:opacity-100"
          }`}
        >
          <span role="img" aria-hidden="true">🇧🇷</span>
        </button>
      </div>
    </div>
  );
};

export default TranslateButton;
