# Conteúdo: como escrever e revisar perguntas

Cada arquivo em `data/questions/` tem:

```json
{
	"pack": "",
	"questions": [
		{
			"id": "lit-002",
			"category": "liturgia",
			"difficulty": 1,
			"question": "Qual é a cor litúrgica do Tempo Comum?",
			"options": ["Verde", "Roxo", "Azul", "Dourado"],
			"answer": 0,
			"explanation": "O verde é usado no Tempo Comum, sinal de esperança e crescimento.",
			"source": "Instrução Geral do Missal Romano, n. 346"
		}
	]
}
```

- `pack: ""` = gratuita. Um pacote pago usa o id do pacote (ex.: `"santos_brasil"`) e precisa de um produto em `data/shop.json` com `"unlocks_pack"`.
- `answer` é o índice da alternativa correta. Nos arquivos atuais é sempre `0`; **o jogo embaralha as alternativas na tela**.
- `difficulty`: 1 (fácil), 2 (médio), 3 (difícil). A pergunta da coroa usa 2 e 3.
- Sempre 4 alternativas, sem repetir; sempre explicação curta e fonte.

## Regras de qualidade

1. **Uma resposta certa, sem ambiguidade.** Evite números de salmos (a numeração hebraica e a grega diferem) e datas disputadas.
2. **Fonte verificável**: citação bíblica, parágrafo do Catecismo (§), cânon do Código de Direito Canônico, documento papal com data.
3. **Alternativas plausíveis**, mas claramente erradas para quem estudou.
4. Linguagem respeitosa; nada de humor com o sagrado.
5. Datas recentes (canonizações, eleição do Papa) devem ser revisadas a cada versão.

O validador (`scripts/content_validator.gd`) roda nos testes e recusa:
id repetido, categoria desconhecida, menos/mais de 4 alternativas,
alternativa repetida ou vazia, `answer` fora do intervalo, sem fonte ou
explicação, e categoria com menos de 15 perguntas gratuitas.

## Revisão recomendada antes de publicar

Peça a um padre, catequista ou professor de teologia para revisar todas as
perguntas (é rápido: cada uma cabe numa linha). Registre aqui:

| Arquivo | Revisado por | Data | Observações |
|---|---|---|---|
| 01_biblia.json | | | |
| 02_doutrina.json | | | |
| 03_santos.json | | | |
| 04_liturgia.json | | | |
| 05_historia.json | | | |
| 06_espiritualidade.json | | | |
| pacote_santos_brasil.json | | | |
