# Como criar um novo caso

## 1. Antes de escrever qualquer JSON: a tabela de verdade

Copie a estrutura de [`caso_001_verdade.md`](caso_001_verdade.md) e preencha:

- **O que realmente aconteceu:** uma linha do tempo com horários.
- **O que cada personagem sabe, esconde e revela.**
- **Pistas:** onde estão e o que cada uma prova.
- **Contradições:** pares de informações que não podem ser verdadeiras ao mesmo tempo.
- **A dedução:** a sequência de passos que leva ao culpado usando só pistas que o jogador consegue achar.
- **Decisões:** o que cada opção muda. Toda opção precisa manter o caso solucionável.

**Regras de um mistério justo:**
- Nada de coincidência arbitrária e nada de culpado que só aparece no final.
- Pelo menos uma pista deve mudar a interpretação de um depoimento.
- Suspeitos inocentes também podem mentir, mas sempre por um motivo próprio que o jogo revela.
- Conclusões vêm de evidências (documentos, horários, registros), nunca de "linguagem corporal".

## 2. O arquivo `data/case_00N.json`

Use `case_001.json` como modelo. As partes principais:

| Campo | O que é |
|---|---|
| `characters` | personagens; `"suspect": true` para os suspeitos |
| `intro` / `intro_effects` | falas iniciais e o que acontece em seguida (pista inicial, primeira decisão) |
| `clues` | pistas, cada uma com um `doc` (estilos: `phone`, `email`, `photo`, `form`, `notebook`, `receipt`) |
| `statements` | depoimentos que vão para o Quadro |
| `locations` | pontos do cenário; cada `entry` pode ter `condition` e `effects` |
| `dialogues` | perguntas por suspeito; cada `topic` pode ter `condition` e `effects` |
| `decisions` | escolhas importantes, com `feedback` e `effects` por opção |
| `contradictions` | pares `a` × `b` e a `explanation` mostrada ao jogador |
| `no_contradiction` | pares que parecem contraditórios mas não são, com a explicação |
| `objectives` / `hints` | o que o jogador deve fazer agora e as dicas, em ordem |
| `accusation` | culpado, evidências relevantes e a razão de cada uma |
| `endings` / `explanation` | os dois finais, os epílogos por decisão e a cadeia de pistas |

**Efeitos:** `{"type": "clue" | "statement" | "flag" | "decision", "id": "..."}`

**Condições:** `clue`, `statement`, `flag`, `contradiction`, `choice` (`["d1", "segredo"]`), `min_clues`, `min_contradictions`, `all`, `any`, `not` e `always`. Ao abrir uma conversa, o jogo liga automaticamente o marcador `talked_<id do personagem>`.

## 3. Cadastrar e testar

1. Em `data/cases.json`, adicione `{"id": "case_002", "file": "case_002.json", "status": "available"}`.
2. Copie `tests/test_case.gd` para `tests/test_case_002.gd`, troque o arquivo carregado e ajuste os números (pistas, contradições, pontuação).
3. Rode `godot --headless -s res://tests/run_tests.gd`.

O teste de "todas as decisões" é o que garante que o caso é justo. Se ele falhar, alguma combinação de escolhas deixa uma pista ou contradição inalcançável.
