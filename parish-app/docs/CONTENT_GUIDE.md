# Guia de Conteúdo: Bíblia, Liturgia Diária e Licenciamento

## Bíblia — atenção a direitos autorais

Traduções católicas amplamente usadas no Brasil **são protegidas por
direitos autorais** e pertencem a editoras específicas:

| Tradução | Editora | Uso comercial |
|---|---|---|
| Bíblia Ave Maria | Editora Ave Maria | Requer licença/autorização |
| Bíblia de Jerusalém | Paulus | Requer licença/autorização |
| Edição Pastoral | Paulus | Requer licença/autorização |
| Almeida (várias revisões) | Domínio público no Brasil (a tradução original de João Ferreira de Almeida é de domínio público; revisões modernas podem não ser) | Geralmente livre, mas confira a revisão específica |

**Recomendação prática:**
1. Se a paróquia/diocese já tem acordo com alguma editora católica, use
   o texto dela e negocie licença de uso digital — é o caminho mais
   correto para um app "estilo InChurch" com a tradução litúrgica oficial.
2. Enquanto isso, o app já funciona tecnicamente com qualquer fonte: a
   função `supabase/functions/bible-sync` importa de uma API configurável
   (`BIBLE_API_URL`). Aponte para uma fonte que você tenha o direito de
   usar.
3. Nunca faça scraping de sites de terceiros sem autorização — além do
   risco legal, esses sites mudam de estrutura e quebram a integração.

### Versão pré-instalada: Pe. Figueiredo (1778) — domínio público

A migration `supabase/migrations/0008_bible_figueiredo.sql` já popula o
banco com a tradução do **Padre Antônio Pereira de Figueiredo** (a partir
da Vulgata Latina, 73 livros do cânon católico). Foi escolhida porque é a
única tradução católica completa em português **seguramente em domínio
público no Brasil**: Figueiredo faleceu em 1797, muito além do prazo de
vida do autor + 70 anos (Lei 9.610/98) — ao contrário de traduções mais
recentes (Ave Maria, Matos Soares, Edição Pastoral), que **ainda estão
protegidas por direitos autorais** (Matos Soares, por exemplo, só entra em
domínio público em 01/01/2028) e não podem ser usadas sem licença da
editora, mesmo que apareçam "de graça" em repositórios no GitHub.

**De onde veio o texto e por que há lacunas:**
- Fonte: digitalização (OCR) de uma edição impressa de 1950, disponível no
  Internet Archive. Não existe em nenhum lugar uma versão já estruturada
  em JSON/banco de dados dessa tradução — foi necessário escrever um
  parser próprio (livros/capítulos/versículos identificados por
  cabeçalhos de página, marcadores "CAPÍTULO N" e títulos de livro no
  texto OCR'd) para extrair os versículos.
- **Cobertura: ~31.300 de ~35.000 versículos esperados (~89%), todos os
  73 livros presentes**, mas com capítulos/versículos faltando de forma
  irregular — o "CAPÍTULO N" impresso na edição original às vezes não foi
  reconhecido pelo OCR. Onde falta um versículo, o app mostra "não
  disponível" em vez de inventar ou mostrar texto errado.
- **Qualidade do texto**: os versículos que foram capturados são, pelas
  amostras verificadas, fiéis ao original (conferidos manualmente vários
  versículos conhecidos, ex. João 3:16, Mateus 5:3, Romanos 1:1) — mas por
  ser OCR de um livro de 1950, pequenos erros de digitalização podem
  aparecer ocasionalmente (ex. uma letra trocada). Não houve revisão
  humana verso a verso dos ~31 mil versículos — isso é trabalho para uma
  futura contribuição/voluntário, não algo viável de garantir manualmente.
- **Numeração dos Salmos**: segue a Vulgata (tradição católica antiga),
  que é diferente da numeração hebraica/protestante usada na maioria das
  Bíblias modernas — ex. o "Salmo 22" da Vulgata é o "Salmo 23" ("O Senhor
  é meu pastor") nas edições modernas. Isso é uma característica da fonte
  histórica, não um erro.
- **Livros "I–IV Reis"**: esta tradução segue a divisão clássica da
  Vulgata (4 livros de "Reis"), que corresponde a 1–2 Samuel + 1–2 Reis
  nas edições modernas — os nomes em `bible_books.name` deixam isso
  explícito entre parênteses.

**Quando a licença da Ave Maria (ou outra) estiver disponível como texto
digital de verdade** (arquivo da editora, não um repositório não-oficial),
crie uma nova migration inserindo em `bible_versions`/`bible_books`/
`bible_verses` com um `version_id` próprio (ex. `ave-maria`) — as duas
versões convivem, e a tela de Bíblia já deixa o usuário trocar entre elas
quando há mais de uma para o mesmo idioma.

### Bíblia em outros idiomas

O app suporta várias versões bíblicas simultaneamente via `bible_versions`
(cada versão tem seu próprio `language`). Para adicionar uma versão em
inglês, espanhol, italiano ou francês:

| Idioma | Opção de domínio público | Opção com licença |
|---|---|---|
| Inglês | Douay-Rheims (tradução católica, domínio público) | New American Bible, RSV-CE (requerem licença) |
| Espanhol | — (a maioria das traduções católicas em espanhol é protegida) | Biblia de Jerusalén, Biblia Latinoamericana |
| Italiano | — | Bibbia CEI (Conferenza Episcopale Italiana) |
| Francês | — | Bible de Jérusalem, AELF (liturgia oficial francesa) |

Rode `bible-sync` uma vez por `(versão, livro)` apontando `BIBLE_API_URL`
para a fonte correta; registre a versão em `bible_versions` com o
`language` no formato usado pelo app (`en`, `es`, `it`, `fr`, `pt-BR`) para
que a tela de Bíblia a selecione automaticamente quando o app estiver
naquele idioma.

## Liturgia Diária

Não existe uma API pública e oficialmente mantida pela CNBB ou Vaticano
para as leituras do dia. Três caminhos:

1. **Alimentar manualmente**: a tela `admin/liturgy-editor.tsx` permite
   que alguém da equipe de liturgia digite a leitura do dia — funciona
   bem para uma única paróquia com um voluntário responsável. A tela tem
   uma aba por idioma (`daily_liturgy` guarda uma linha por
   `data + idioma`); na prática, a maioria das paróquias só preenche
   português e deixa os outros idiomas para quando houver um
   voluntário/fonte disponível — o app cai automaticamente para o texto
   em português quando a tradução não existe, então nada fica quebrado.
2. **Usar um provedor comunitário**: existem projetos open-source que
   disponibilizam a liturgia diária em JSON (busque "liturgia diária API"
   no GitHub). Configure `LITURGY_API_URL` na Edge Function
   `daily-liturgy-sync` apontando para ele. **Valide a licença de uso**
   antes de ir para produção — muitos desses projetos são para fins
   educacionais/pessoais.
3. **Negociar acesso a uma fonte oficial diocesana**, se a diocese tiver
   um feed próprio.

Agende `daily-liturgy-sync` para rodar todo dia de madrugada:

```bash
supabase functions deploy daily-liturgy-sync
# no painel Supabase: Edge Functions > daily-liturgy-sync > Cron
# expressão: 0 6 * * *  (06:00 UTC = 03:00 em Brasília)
```

## Notícias, vídeos e downloads

Sem questões de licenciamento — é conteúdo próprio da paróquia, publicado
pela equipe através da tela `admin/content.tsx`. Para vídeos, recomenda-se
hospedar em:
- **Supabase Storage** (bucket `media`, já configurado) para vídeos curtos
- **YouTube/Vimeo não-listado** + embed via WebView para vídeos longos
  (celebrações completas), economizando armazenamento e banda

## Multi-paróquia (venda do produto)

O schema já é multi-tenant (`parish_id` em quase toda tabela). Para vender
a mesma base de código para várias paróquias:
1. Crie uma linha em `parishes` para cada nova paróquia.
2. Publique um app separado por paróquia (bundle ID/nome próprios) **ou**
   evolua para uma tela de seleção de paróquia no primeiro acesso — nesse
   caso, adicione um seletor antes do cadastro (hoje o cadastro usa um
   `DEFAULT_PARISH_ID` fixo, ver `app/(auth)/register.tsx`).
3. Personalize `primary_color`/`secondary_color`/`logo_url` por paróquia
   e carregue-os dinamicamente no lugar da paleta fixa em `src/theme/colors.ts`.
