import { useEffect } from "react";

/**
 * Ativa a animação de entrada dos elementos marcados com data-reveal.
 * Puramente visual — não altera conteúdo, textos ou imagens.
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (reduce) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    nodes.forEach((n, i) => {
      if (!n.style.getPropertyValue("--reveal-delay")) {
        const local = Number(n.dataset["revealIndex"] ?? i % 6);
        n.style.setProperty("--reveal-delay", `${Math.min(local, 6) * 70}ms`);
      }
      observer.observe(n);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
