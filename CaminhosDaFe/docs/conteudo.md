# Guia de conteúdo: como escrever e revisar capítulos

## Regras inegociáveis

1. **Ficção separada de fato.** Personagens e situações inventadas ficam em diálogos e em registros do diário com `"kind": "fiction"`. Fatos religiosos e históricos usam `teaching`, `scripture` ou `saint` e **precisam** citar `sources`. O validador recusa o capítulo se faltar fonte.
2. **Nada inventado sobre o sagrado.** Nenhuma citação, milagre, data, documento ou ensinamento sem fonte verificável. Nenhuma fala inventada atribuída a um santo: personagens fictícios podem *contar* a história de um santo, com fatos que estejam no diário.
3. **Incerteza declarada.** Quando as fontes divergem (datas, episódios), o texto diz isso. Exemplos no capítulo 1: o ano de nascimento de São Vicente (1580 ou 1581) e o relato do cativeiro em Túnis.
4. **Bíblia resumida, com referência exata.** As traduções católicas modernas têm direitos autorais. Por isso o jogo resume as passagens e indica livro, capítulo e versículos. Citações curtas só quando vêm de um documento que as reproduz, como o Catecismo no site da Santa Sé.
5. **Pontuação não é julgamento.** Os pontos medem desafios e conhecimento. As escolhas morais nunca valem pontos e nenhum texto sugere que uma escolha mede a fé ou o valor da pessoa.

## Fontes, por ordem de prioridade

1. Bíblia (referência exata).
2. Catecismo da Igreja Católica (parágrafos §), no site da Santa Sé: https://www.vatican.va/archive/cathechism_po/index_new/prima-pagina-cic_po.html
3. Documentos da Santa Sé (vatican.va).
4. Sites oficiais de dioceses, ordens e congregações (para um santo, a ordem que ele fundou).
5. Enciclopédias e biografias confiáveis, como a Catholic Encyclopedia (New Advent) e a Britannica, para confirmar datas.

Ao cadastrar uma fonte em `data/sources.json`, abra o endereço e confirme que ele funciona e diz o que o texto afirma.

## Revisão antes de publicar um capítulo

- [ ] Toda afirmação religiosa ou histórica tem fonte em `sources`.
- [ ] As datas foram conferidas em pelo menos duas fontes, ou a divergência foi indicada.
- [ ] Nenhuma fala ou citação foi atribuída a um santo sem fonte.
- [ ] As escolhas morais mostram consequências sem humilhar nenhuma opção.
- [ ] A linguagem é adequada a famílias e jovens.
- [ ] Recomendado: revisão por um catequista ou sacerdote de confiança, registrada abaixo.
- [ ] `godot --headless -s res://tests/run_tests.gd` passa.

| Capítulo | Revisor | Data | Observações |
|---|---|---|---|
| 1 – A caridade na prática | *(pendente)* | | Fontes conferidas na criação, em outubro de 2026 |

## Formato do capítulo (`data/chapter_00N.json`)

```jsonc
{
  "id": "chapter_002",
  "title": "...", "place": "...", "virtue": "...",
  "background": "res://assets/backgrounds/....svg",
  "characters": { "id": {"name": "...", "role": "...", "portrait": "res://assets/characters/....svg"} },
  "intro": [ /* eventos */ ],
  "points": [
    {
      "id": "capela", "name": "Capela", "icon": "church",
      "pos": [0.5, 0.25],          // posição no cenário (0 a 1)
      "requires": [],              // pontos que precisam ser concluídos antes
      "events": [ /* eventos, em ordem */ ],
      "revisit": [ {"speaker": "...", "text": "..."} ]
    }
  ],
  "challenges": { "id": {"type": "assignment | distribution | pipes", "title", "virtue", "intro", "hint", "success", "data": {...}} },
  "choices": { "id": {"prompt": "...", "options": [{"id", "text", "response", "ending"}]} },
  "diary": [ {"id", "kind", "title", "body", "sources": ["..."]} ],
  "ending": {"title", "intro", "lessons": [...], "closing"}
}
```

**Eventos disponíveis:**

| type | o que faz |
|---|---|
| `dialogue` | falas: `{"type": "dialogue", "lines": [{"speaker": "marta", "text": "..."}]}`. O `speaker` pode ser um personagem, `narrator` ou `player`. |
| `challenge` | abre um desafio: `{"type": "challenge", "id": "mutirao"}` |
| `question` | faz uma pergunta de `questions_00N.json` |
| `choice` | abre uma escolha narrativa |
| `diary` | libera um registro do diário |
| `finish` | termina o capítulo (exatamente um por capítulo) |

**Ícones disponíveis** (`assets/icons/`): church, bread, apple, house, sprout, well, book, map, star, heart, person, blanket, soup, wood, entre outros.

## Desafios: como garantir que funcionam

- **assignment** (cooperação): as pistas em texto viram a lista `allowed`. O validador exige **exatamente uma solução**.
- **distribution** (generosidade): a soma das necessidades de todas as casas tem de ser igual ao estoque.
- **pipes** (serviço): informe `solution` com um giro que resolve. O validador confere que ele leva a água até o fim e que o tabuleiro não começa resolvido.
