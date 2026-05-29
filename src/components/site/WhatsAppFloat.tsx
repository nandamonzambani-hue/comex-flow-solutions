import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/5511914900404"
      target="_blank"
      rel="noopener"
      aria-label="Fale com a Comex10 no WhatsApp"
      className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 pl-3.5 pr-4 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
      style={{
        backgroundColor: "#25D366",
        boxShadow: "0 10px 30px -10px rgba(37, 211, 102, 0.55), 0 4px 12px rgba(0,0,0,0.18)",
      }}
    >
      <MessageCircle size={20} className="fill-white text-white" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
