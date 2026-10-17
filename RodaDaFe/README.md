# Roda da Fé

Quiz católico para celular no estilo "gire a roda e responda": seis
categorias (Bíblia, Doutrina e Catecismo, Santos, Liturgia e Sacramentos,
História da Igreja, Espiritualidade e Orações) e a fatia **Coroa**. Junte as
6 medalhas para vencer. Gratuito, com anúncios entre partidas e compras no
app (sem anúncios, pacote de perguntas e moedas para dicas).

> Projeto independente, sem aprovação oficial da Igreja. Toda resposta traz
> explicação e fonte (Bíblia, Catecismo da Igreja Católica, Código de
> Direito Canônico, documentos do Magistério).

**Estado (v0.1.0):** jogo completo e jogável; 125 perguntas gratuitas +
pacote "Santos do Brasil" (20); anúncios e compras **simulados** no
computador e prontos para ligar às lojas (ver `docs/monetizacao.md`).

| Como funciona | Onde está |
|---|---|
| Girar a roda → pergunta com 25 s | `scenes/match.tscn`, `scripts/ui/match.gd`, `scripts/ui/wheel.gd` |
| 3 vidas; 3 acertos seguidos (ou a fatia Coroa) = escolher uma medalha | `scripts/match_state.gd` |
| Pergunta da coroa (mais difícil) dá a medalha da categoria | `scripts/content.gd` (`pick(..., for_crown)`) |
| Dicas pagas com moedas: eliminar 2 alternativas, +10 s | `scripts/quiz_rules.gd` |
| Continuar 1 vez por partida: anúncio premiado ou 150 moedas | `match.gd` → `_offer_revive` |
| Anúncio entre partidas (a cada 2), removível por compra | `scripts/monetization/monetization.gd` |
| Loja, moedas grátis (3 anúncios/dia), restaurar compras | `scenes/shop.tscn` |
| Estatísticas por categoria | `scenes/stats.tscn` |
| Perfil salvo só no aparelho | `scripts/save_manager.gd`, `scripts/player.gd` |

## Jogar no computador

1. Baixe o **Godot 4.6** (Standard) em https://godotengine.org/download.
2. No Gerenciador de Projetos, **Importar** → pasta `RodaDaFe` → `project.godot`.
3. Aperte **F5**. Anúncios e compras aparecem como telas "de teste".

## Testes

```bash
cd RodaDaFe
godot --headless -s res://tests/run_tests.gd               # 18 testes: regras, conteúdo, loja
godot --headless --path . res://tests/playthrough.tscn     # partida completa pela interface
godot --path . res://tests/playthrough.tscn -- --shots     # a mesma partida salvando capturas
```

A partida automatizada vence uma partida acertando tudo, perde outra
(usando o "continuar" pelo anúncio premiado) e compra "Sem anúncios" na loja.
O GitHub Actions (`.github/workflows/roda-da-fe.yml`) roda os testes e gera
um APK de teste a cada mudança em `RodaDaFe/`.

## Organização

```
RodaDaFe/
  data/categories.json        categorias (nome, cor, ícone)
  data/questions/*.json       perguntas (uma categoria por arquivo; pacote pago à parte)
  data/shop.json              produtos da loja e anúncio premiado
  data/ads.json               IDs de anúncio (hoje: IDs de TESTE do Google)
  scripts/match_state.gd      regras da partida (sem interface; testado)
  scripts/quiz_rules.gd       números do jogo (vidas, moedas, custos)
  scripts/content.gd          carrega/valida/sorteia perguntas
  scripts/player.gd           moedas, compras, estatísticas
  scripts/monetization/       anúncios e compras (mock, Google Play, AdMob)
  scripts/ui/                 telas
  tests/                      testes automatizados
  tools/gerar_icones.py       ícones do app
  docs/                       conteúdo, monetização e lojas
```

Para corrigir ou acrescentar perguntas, edite os JSON (ver `docs/conteudo.md`).
