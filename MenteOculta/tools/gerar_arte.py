#!/usr/bin/env python3
"""Gera a arte provisória de Mente Oculta (SVG), 100% original.

Uso, a partir da pasta MenteOculta:
    python3 tools/gerar_arte.py

Para trocar por ilustrações definitivas, substitua os arquivos em assets/
mantendo os mesmos nomes.
"""
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

NAVY = "#18233a"
NAVY_2 = "#22314f"
NAVY_3 = "#2e4066"
WINE = "#7b2d3b"
PAPER = "#efe5d0"
GRAY = "#8a93a3"
LAMP = "#f2c46d"


def svg(w, h, body, scale=2):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w*scale}" height="{h*scale}" '
            f'viewBox="0 0 {w} {h}">\n{body}\n</svg>\n')


def write(rel, content):
    path = ASSETS / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print("  ", path.relative_to(ROOT))


# ------------------------------------------------------------- cenário

def shelf(x, y, w, h, rnd):
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#3a2a22"/>']
    rows = int(h // 74)
    colors = ["#5c3440", "#2f4a5c", "#6b5a3a", "#3e3a52", "#7b2d3b", "#4b5a4a", "#8a7a5c", "#2a3550"]
    for r in range(rows):
        by = y + 10 + r * 74
        out.append(f'<rect x="{x+6}" y="{by+58}" width="{w-12}" height="8" fill="#2a1d17"/>')
        bx = x + 10
        while bx < x + w - 18:
            bw = rnd.randint(8, 16)
            bh = rnd.randint(36, 56)
            c = rnd.choice(colors)
            out.append(f'<rect x="{bx}" y="{by+58-bh}" width="{bw}" height="{bh}" fill="{c}"/>')
            if rnd.random() < 0.3:
                out.append(f'<rect x="{bx+2}" y="{by+58-bh+8}" width="{bw-4}" height="3" fill="{PAPER}" opacity="0.35"/>')
            bx += bw + 2
    return "".join(out)


def background():
    W, H = 720, 1280
    rnd = random.Random(11)
    b = ['<defs>'
         '<radialGradient id="lamp" cx="0.5" cy="0.3" r="0.6"><stop offset="0" stop-color="#f2c46d" stop-opacity="0.55"/>'
         '<stop offset="1" stop-color="#f2c46d" stop-opacity="0"/></radialGradient>'
         '<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2220"/><stop offset="1" stop-color="#15110f"/></linearGradient>'
         '<radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/>'
         '<stop offset="1" stop-color="#000" stop-opacity="0.65"/></radialGradient>'
         '</defs>']
    b.append(f'<rect width="{W}" height="{H}" fill="{NAVY}"/>')
    # papel de parede listrado
    for x in range(0, W, 40):
        b.append(f'<rect x="{x}" y="0" width="20" height="760" fill="{NAVY_2}" opacity="0.6"/>')
    # janela com chuva (centro alto)
    b.append('<rect x="270" y="40" width="180" height="150" rx="6" fill="#0d1526" stroke="#3a2a22" stroke-width="10"/>')
    b.append('<path d="M360,40 V190 M270,115 H450" stroke="#3a2a22" stroke-width="6"/>')
    for _ in range(26):
        x, y = rnd.uniform(280, 440), rnd.uniform(48, 170)
        b.append(f'<path d="M{x:.0f},{y:.0f} l-4,14" stroke="#7d93b8" stroke-width="1.5" opacity="0.5"/>')
    b.append('<circle cx="420" cy="70" r="10" fill="#e8e2c8" opacity="0.5"/>')
    # estantes laterais
    b.append(shelf(0, 230, 120, 560, rnd))
    b.append(shelf(600, 360, 120, 430, rnd))
    # escritório (porta, esquerda alto)
    b.append('<rect x="100" y="240" width="120" height="200" fill="#3a2a22"/>')
    b.append('<rect x="112" y="252" width="96" height="188" fill="#5a4033"/>')
    b.append('<rect x="124" y="268" width="72" height="80" fill="#b7c2cf" opacity="0.35"/>')
    b.append(f'<text x="160" y="314" font-family="serif" font-size="12" fill="{PAPER}" text-anchor="middle" opacity="0.8">ESCRITÓRIO</text>')
    b.append('<circle cx="196" cy="370" r="5" fill="#c9a44f"/>')
    # área de montagem (direita alto): cavaletes e molduras
    b.append('<path d="M520,330 L560,200 L600,330 M540,270 H580" stroke="#8a6a4f" stroke-width="6" fill="none"/>')
    b.append(f'<rect x="530" y="190" width="70" height="56" fill="{PAPER}" opacity="0.85" stroke="#5a4033" stroke-width="5"/>')
    b.append('<rect x="610" y="250" width="54" height="74" fill="none" stroke="#c9a44f" stroke-width="5"/>')
    b.append('<rect x="640" y="300" width="40" height="30" fill="#5a4033"/>')
    # chão
    b.append(f'<rect x="0" y="760" width="{W}" height="{H-760}" fill="url(#floor)"/>')
    for y in range(780, H, 46):
        b.append(f'<path d="M0,{y} H{W}" stroke="#3a2c26" stroke-width="2"/>')
    # luz da luminária sobre a vitrine
    b.append('<path d="M360,230 L180,700 H540 Z" fill="url(#lamp)"/>')
    b.append(f'<path d="M330,215 h60 l-12,20 h-36 Z" fill="#c9a44f"/><rect x="357" y="0" width="6" height="215" fill="#2a1d17"/>')
    # vitrine (centro)
    b.append('<rect x="250" y="520" width="220" height="200" fill="#3a2a22"/>')
    b.append('<rect x="262" y="380" width="196" height="150" fill="#9fb4c8" opacity="0.18" stroke="#c9a44f" stroke-width="5"/>')
    b.append('<rect x="320" y="470" width="80" height="16" rx="3" fill="#5a4033"/>')
    b.append('<path d="M262,380 L300,420 M300,380 L340,420" stroke="#ffffff" stroke-width="3" opacity="0.18"/>')
    b.append(f'<rect x="346" y="530" width="28" height="34" rx="5" fill="none" stroke="{GRAY}" stroke-width="4"/>')
    b.append(f'<rect x="342" y="548" width="36" height="28" rx="4" fill="{GRAY}"/>')
    # balcão (direita meio)
    b.append(f'<rect x="470" y="700" width="250" height="140" fill="{WINE}"/>')
    b.append('<rect x="470" y="690" width="250" height="16" fill="#5a1f2a"/>')
    b.append('<rect x="560" y="640" width="70" height="50" rx="6" fill="#2b2b33"/><rect x="570" y="650" width="50" height="14" fill="#7ea38a" opacity="0.6"/>')
    b.append(f'<rect x="500" y="672" width="44" height="18" fill="{PAPER}"/>')
    # mesa do café com celular (esquerda baixa)
    b.append('<ellipse cx="150" cy="930" rx="100" ry="26" fill="#3a2a22"/><rect x="142" y="930" width="16" height="110" fill="#2a1d17"/>')
    b.append('<rect x="128" y="900" width="34" height="56" rx="6" fill="#111" stroke="#6d7fa0" stroke-width="2" transform="rotate(-70 145 928)"/>')
    b.append('<ellipse cx="200" cy="912" rx="18" ry="7" fill="#e8e2c8"/><path d="M188,912 v-12 h24 v12" fill="#e8e2c8"/>')
    # porta dos fundos (direita baixo) e lixeiras do beco
    b.append('<rect x="560" y="960" width="130" height="230" fill="#2a1d17"/><rect x="572" y="972" width="106" height="218" fill="#3d4352"/>')
    b.append(f'<text x="625" y="1010" font-family="sans-serif" font-size="13" fill="{PAPER}" text-anchor="middle" opacity="0.7">FUNDOS</text>')
    b.append('<rect x="586" y="1080" width="24" height="34" rx="3" fill="#1b1f29"/><circle cx="598" cy="1092" r="3" fill="#7be08f"/>')
    # vinheta
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vig)"/>')
    write("backgrounds/livraria.svg", svg(W, H, "\n".join(b)))


# ------------------------------------------------------------- personagens

def portrait(name, skin, hair_back, hair_front, clothes, extra="", mouth="neutral", rim="#c9a44f"):
    b = ['<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">'
         f'<stop offset="0" stop-color="{NAVY_3}"/><stop offset="1" stop-color="{NAVY}"/></linearGradient></defs>',
         '<rect width="256" height="256" fill="url(#g)"/>',
         f'<circle cx="200" cy="40" r="90" fill="{rim}" opacity="0.08"/>',
         hair_back,
         f'<path d="M30,256 C34,196 78,172 128,172 C178,172 222,196 226,256 Z" fill="{clothes}"/>',
         f'<rect x="112" y="146" width="32" height="34" rx="12" fill="{skin}"/>',
         f'<ellipse cx="128" cy="110" rx="50" ry="58" fill="{skin}"/>',
         f'<path d="M172,80 C186,110 184,140 168,160" stroke="{rim}" stroke-width="4" fill="none" opacity="0.5"/>',
         hair_front,
         '<ellipse cx="108" cy="114" rx="5.5" ry="6.5" fill="#1d1715"/><ellipse cx="148" cy="114" rx="5.5" ry="6.5" fill="#1d1715"/>',
         '<path d="M98,100 q10,-6 20,0 M138,100 q10,-6 20,0" stroke="#3a2a22" stroke-width="3.5" fill="none" stroke-linecap="round"/>']
    mouths = {
        "neutral": '<path d="M114,142 H142" stroke="#6b3a30" stroke-width="4" stroke-linecap="round"/>',
        "smile": '<path d="M112,138 Q128,152 144,138" stroke="#6b3a30" stroke-width="4" fill="none" stroke-linecap="round"/>',
        "tense": '<path d="M114,145 Q128,138 142,145" stroke="#6b3a30" stroke-width="4" fill="none" stroke-linecap="round"/>',
    }
    b.append(mouths[mouth])
    b.append(extra)
    write(f"characters/{name}.svg", svg(256, 256, "\n".join(b), scale=1))


def characters():
    portrait("helena", "#e0b08c",
             '<path d="M70,110 C60,40 196,40 186,110 L196,190 L60,190 Z" fill="#4a2c22"/>',
             '<path d="M76,100 C80,52 176,52 180,100 C160,76 120,70 76,100 Z" fill="#4a2c22"/>',
             "#5a6b85", extra='<circle cx="128" cy="196" r="5" fill="#c9a44f"/>', mouth="tense")
    portrait("rafael", "#d9a07a", "",
             '<path d="M78,92 C80,50 176,50 178,92 C170,74 150,68 128,68 C106,68 86,74 78,92 Z" fill="#2c2420"/>'
             '<path d="M84,90 Q90,76 100,74" stroke="#8a8a8a" stroke-width="5" fill="none"/>',
             "#3d4352", extra='<path d="M104,180 L128,214 L152,180" fill="#e8e2d0"/><path d="M122,196 h12 l-6,40 Z" fill="#7b2d3b"/>'
             '<rect x="96" y="104" width="26" height="20" rx="4" fill="none" stroke="#2c2420" stroke-width="3"/>'
             '<rect x="134" y="104" width="26" height="20" rx="4" fill="none" stroke="#2c2420" stroke-width="3"/><path d="M122,112 h12" stroke="#2c2420" stroke-width="3"/>')
    portrait("bia", "#9a6446",
             '<circle cx="128" cy="96" r="70" fill="#1d1513"/>',
             '<path d="M74,100 C74,44 182,44 182,100 C168,70 140,64 128,64 C112,64 88,72 74,100 Z" fill="#1d1513"/>',
             "#7b2d3b", extra='<path d="M60,210 C90,230 166,230 196,210" stroke="#c9a44f" stroke-width="6" fill="none"/>'
             '<circle cx="80" cy="128" r="5" fill="#c9a44f"/>', mouth="tense")
    portrait("otavio", "#efc9a8", "",
             '<path d="M74,96 C70,44 186,40 182,96 C178,70 150,52 120,60 C100,64 84,78 74,96 Z" fill="#b8874a"/>'
             '<path d="M150,56 C170,56 186,70 186,92" stroke="#b8874a" stroke-width="10" fill="none"/>',
             "#2b2b33", extra='<path d="M96,176 C110,200 146,200 160,176" stroke="#c9a44f" stroke-width="5" fill="none"/>'
             '<path d="M112,128 Q120,132 126,128" stroke="#9a6446" stroke-width="2" fill="none" opacity="0.6"/>', mouth="smile")
    # narrador: lupa sobre papel
    b = [f'<rect width="256" height="256" fill="{NAVY_2}"/>',
         f'<rect x="58" y="52" width="140" height="170" rx="6" fill="{PAPER}" transform="rotate(-6 128 137)"/>',
         '<path d="M84,96 h88 M84,120 h88 M84,144 h64" stroke="#b9ab8f" stroke-width="6" stroke-linecap="round" transform="rotate(-6 128 137)"/>',
         f'<circle cx="150" cy="150" r="40" fill="#9fb4c8" fill-opacity="0.35" stroke="{WINE}" stroke-width="10"/>',
         f'<path d="M178,178 L214,214" stroke="{WINE}" stroke-width="16" stroke-linecap="round"/>']
    write("characters/narrador.svg", svg(256, 256, "\n".join(b), scale=1))


# ------------------------------------------------------------- documentos

def notebook_drawing(x, y, ribbon, cracked, w=150, h=200, label=True):
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#2f5a45"/>',
           f'<rect x="{x}" y="{y}" width="16" height="{h}" fill="#244836"/>',
           f'<path d="M{x+w*0.55},{y+h} l8,46 l10,-8 l10,8 l-8,-46" fill="{ribbon}"/>']
    for i in range(6):
        out.append(f'<path d="M{x+24},{y+30+i*28} h{w-40}" stroke="#3a6b54" stroke-width="2"/>')
    if cracked:
        out.append(f'<path d="M{x+2},{y+6} l12,10 l-6,10 l10,12" stroke="#d8caa8" stroke-width="3" fill="none"/>')
    return "".join(out)


def documents():
    # foto de Bia, 19h45: cópia com fita AZUL e lombada lisa
    b = ['<rect width="400" height="300" fill="#111"/>',
         '<rect x="10" y="10" width="380" height="280" fill="#2a2420"/>',
         '<path d="M200,10 L60,290 H340 Z" fill="#f2c46d" opacity="0.22"/>',
         '<rect x="70" y="60" width="260" height="190" fill="#9fb4c8" opacity="0.15" stroke="#c9a44f" stroke-width="4"/>',
         notebook_drawing(150, 80, "#3b6fd1", False, w=100, h=130),
         '<rect x="140" y="214" width="120" height="12" rx="3" fill="#5a4033"/>',
         '<text x="380" y="285" font-family="monospace" font-size="16" fill="#f2c46d" text-anchor="end">SEX 19:45</text>']
    write("documents/foto_vitrine.svg", svg(400, 300, "\n".join(b)))
    # desenho da ficha: original com fita VERMELHA e lombada rachada
    b = [f'<rect width="400" height="300" fill="{PAPER}"/>',
         notebook_drawing(60, 40, "#c0392b", True, w=110, h=150),
         '<path d="M178,58 C220,50 240,40 260,40" stroke="#5a4033" stroke-width="2" fill="none"/>',
         '<text x="266" y="46" font-family="monospace" font-size="15" fill="#5a4033">lombada rachada</text>',
         '<path d="M140,200 C200,236 240,240 262,240" stroke="#5a4033" stroke-width="2" fill="none"/>',
         '<text x="266" y="246" font-family="monospace" font-size="15" fill="#7b2d3b">fita vermelha</text>',
         '<text x="266" y="140" font-family="monospace" font-size="15" fill="#5a4033">capa verde, A5</text>',
         '<path d="M172,134 H262" stroke="#5a4033" stroke-width="2"/>']
    write("documents/ficha_original.svg", svg(400, 300, "\n".join(b)))


# ------------------------------------------------------------- ícones (brancos, coloridos no jogo)

ICONS = {
    "phone": '<rect x="28" y="10" width="40" height="76" rx="8"/><path d="M42,76 h12"/>',
    "alarm": '<path d="M48,16 C30,16 22,30 22,46 V64 L14,74 H82 L74,64 V46 C74,30 66,16 48,16 Z"/><path d="M40,82 a8,8 0 0 0 16,0"/>',
    "photo": '<rect x="12" y="26" width="72" height="54" rx="8"/><circle cx="48" cy="53" r="14"/><path d="M34,26 l6,-10 h16 l6,10"/>',
    "document": '<path d="M24,10 H58 L74,26 V86 H24 Z"/><path d="M58,10 V26 H74 M34,44 H64 M34,58 H64 M34,72 H54"/>',
    "notebook": '<rect x="22" y="12" width="56" height="74" rx="4"/><path d="M34,12 V86 M44,32 H68 M44,46 H68"/>',
    "receipt": '<path d="M26,10 H70 V86 L62,80 L54,86 L46,80 L38,86 L30,80 L26,84 Z"/><path d="M36,30 H60 M36,44 H60 M36,58 H52"/>',
    "case": '<rect x="18" y="20" width="60" height="48" rx="4"/><path d="M18,68 H78 V84 H18 Z"/><rect x="40" y="38" width="16" height="20" rx="3"/>',
    "counter": '<path d="M10,46 H86 V82 H10 Z"/><rect x="36" y="22" width="26" height="24" rx="3"/><path d="M42,30 h14"/>',
    "door": '<path d="M24,86 V12 H72 V86"/><path d="M14,86 H82"/><circle cx="62" cy="52" r="3"/>',
    "tools": '<path d="M20,76 L56,40"/><path d="M52,24 a14,14 0 1 0 20,20 l-8,-8 l-4,-8 Z"/><path d="M60,64 L80,84 M66,58 L86,78"/>',
    "bin": '<path d="M22,26 H74 L68,86 H28 Z"/><path d="M16,26 H80 M38,26 V16 H58 V26 M40,40 V72 M56,40 V72"/>',
    "board": '<rect x="10" y="14" width="76" height="60" rx="4"/><path d="M30,74 L22,88 M66,74 L74,88"/><path d="M26,34 L48,52 L70,30"/><circle cx="26" cy="34" r="5"/><circle cx="48" cy="52" r="5"/><circle cx="70" cy="30" r="5"/>',
    "people": '<circle cx="34" cy="32" r="12"/><circle cx="64" cy="36" r="10"/><path d="M12,82 C12,60 22,52 34,52 C46,52 56,60 56,82 M56,64 C60,58 64,56 68,56 C78,56 84,64 84,82"/>',
    "clues": '<circle cx="40" cy="40" r="24"/><path d="M58,58 L84,84"/>',
    "map": '<path d="M48,86 C48,86 20,58 20,38 a28,28 0 0 1 56,0 C76,58 48,86 48,86 Z"/><circle cx="48" cy="38" r="9"/>',
    "hint": '<path d="M36,70 H60 M40,82 H56"/><path d="M48,12 C30,12 20,26 22,40 C24,52 34,56 36,66 H60 C62,56 72,52 74,40 C76,26 66,12 48,12 Z"/>',
    "back": '<path d="M58,18 L28,48 L58,78"/>',
    "settings": '<circle cx="48" cy="48" r="12"/><path d="M48,10 V22 M48,74 V86 M10,48 H22 M74,48 H86 M21,21 L30,30 M66,66 L75,75 M21,75 L30,66 M66,30 L75,21"/>',
    "check": '<path d="M16,50 L38,72 L80,26"/>',
    "lock": '<rect x="22" y="44" width="52" height="40" rx="8"/><path d="M32,44 V32 a16,16 0 0 1 32,0 V44"/>',
    "scale": '<path d="M48,14 V82 M28,82 H68 M16,30 H80"/><path d="M16,30 L6,58 H26 Z M80,30 L70,58 H90 Z"/>',
    "chat": '<path d="M14,20 H82 V64 H44 L26,80 V64 H14 Z"/>',
    "compare": '<rect x="10" y="22" width="32" height="52" rx="4"/><rect x="54" y="22" width="32" height="52" rx="4"/><path d="M42,48 H54"/>',
    "close": '<path d="M24,24 L72,72 M72,24 L24,72"/>',
    "star": '<path d="M48,10 L58,36 L86,38 L64,56 L72,84 L48,68 L24,84 L32,56 L10,38 L38,36 Z"/>',
}


def icons():
    for name, body in ICONS.items():
        write(f"icons/{name}.svg", svg(96, 96, f'<g fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">{body}</g>', scale=1))
    b = [f'<rect width="512" height="512" rx="112" fill="{NAVY}"/>',
         f'<circle cx="230" cy="230" r="120" fill="none" stroke="{PAPER}" stroke-width="36"/>',
         f'<path d="M318,318 L420,420" stroke="{WINE}" stroke-width="56" stroke-linecap="round"/>',
         f'<path d="M180,230 Q230,170 280,230 Q230,290 180,230 Z" fill="{PAPER}"/><circle cx="230" cy="230" r="18" fill="{NAVY}"/>']
    write("icons/app_icon.svg", svg(512, 512, "\n".join(b), scale=1))


if __name__ == "__main__":
    print("Gerando arte provisória:")
    background()
    characters()
    documents()
    icons()
    print("Pronto.")
