# Análise da inChurch → o que levamos para o Minha Paróquia

Base: dois vídeos gravados em 17/10/2026 (app do fiel da Aliança de
Misericórdia na inChurch e o painel `admin.inchurch.com.br`) e o pedido da
Secretaria de Evangelização.

Legenda: ✅ já existe no Minha Paróquia · 🆕 implementado nesta etapa ·
🔜 recomendado para a próxima etapa · ➖ não vale a pena para paróquia

## 1. Estrutura: Denominação → Regionais → Igrejas

A inChurch organiza tudo em **Denominação > Regional > Igreja local**, e
cada conteúdo é "publicado para" um desses níveis.

Para paróquia católica o equivalente é **Matriz → Comunidades (capelas)**:

| Regra | Status |
|---|---|
| Quem contrata é a Matriz; as comunidades ficam debaixo dela | 🆕 `parishes.kind` + `parent_parish_id` (migration 0013) |
| O que a Matriz publica aparece nas comunidades | 🆕 RLS `can_view_parish()` |
| O que a comunidade publica **não** sobe para a Matriz nem vai para outra comunidade | 🆕 (testado no banco) |
| Matriz pode publicar algo só para a Matriz | 🆕 switch "Mostrar também nas comunidades" |
| Matriz administra as comunidades (membros, conteúdo, coordenação) | 🆕 `is_staff_for()` + seletor "Publicar em" |
| Comunidade não paga plano: herda status/plano da Matriz | 🆕 trigger de cascata |
| Push da Matriz chega nas comunidades; pode mirar uma comunidade só | 🆕 `send-push-notification` |
| Regionais (nível acima da paróquia: diocese/forania) | 🔜 só se formos vender para dioceses |

## 2. Painel administrativo (menu da inChurch × nosso)

| inChurch | Minha Paróquia | Status |
|---|---|---|
| Início: ranking, "sob cuidados", mídias mais vistas | Início com indicadores (membros, novos, pedidos de oração, doações do mês, eventos, respostas, testemunhos), tabela Matriz × comunidades, termômetro de sentimentos, faixa etária | 🆕 |
| Igreja: Denominação / Regionais / Igrejas / Minha Igreja | Igreja → Matriz e comunidades (criar comunidade, código de entrada, coordenadores) | 🆕 |
| Pessoas: membros, visitantes, novos convertidos, aniversários, histórico, métricas (idade, sexo, localização) | Membros ✅ · faixa etária no Início 🆕 · aniversariantes do mês 🔜 · sexo/bairro 🔜 (precisa campo no perfil) | parcial |
| Financeiro: entradas, saídas, DRE, fluxo de caixa, conciliação, boletos | Dízimo/doações via Mercado Pago ✅ · relatório do mês ✅ · saídas/DRE ➖ (paróquia já usa sistema contábil da diocese) | ✅ |
| Cuidado: sentimentos, pedidos de oração, testemunhos, jornadas, atendimento pastoral | Sentimentos ("Como você está hoje?") 🆕 · Pedidos de oração com área + WhatsApp 🆕 · Testemunhos com aprovação 🆕 · Atendimento pastoral (agenda de confissão/aconselhamento) 🔜 | 🆕 |
| Célula: grupos, líderes, hierarquia, materiais | Grupos/pastorais ✅ (equivalem às células) | ✅ |
| Programação: agenda, eventos com tickets e inscrições, perguntas complementares, ao vivo | Eventos ✅ · inscrição ✅ · ficha de inscrição completa via Formulários 🆕 · ingressos pagos 🔜 | ✅ |
| Conteúdo: vídeos/séries, push, notícias (com agendamento), atalhos, banner, plano de leitura, downloads, métricas | Vídeos/textos ✅ · push ✅ · notícias ✅ · banners ✅ · avisos ✅ · downloads ✅ · liturgia/Bíblia ✅ · plano de leitura 🔜 · agendamento de notícia 🔜 | ✅ |
| Kids | ➖ (catequese já cobre) | — |
| Inchurch Store / API | ➖ | — |

## 3. O que a Secretaria de Evangelização disse que **não tem** na inChurch

As "perguntas complementares" da inChurch só têm múltipla escolha, texto
livre e upload. Pedido da Secretaria → o que fizemos (Formulários,
migration 0014):

| Pedido | Como ficou |
|---|---|
| Lista suspensa longa | Tipo **Lista suspensa**: abre com busca (digitar filtra, ignora acentos). No painel dá para **colar a lista inteira**, uma opção por linha |
| "Se for sim, ir para tal seção" | Em cada opção de escolha única/lista: **seguir normal / ir para a seção X / enviar formulário**. Também dá para definir o destino padrão de cada seção |
| Divisão por seção | Formulário em **etapas**, cada seção com título, texto e imagem; botão Voltar respeita o caminho percorrido |
| Incluir imagem | Imagem na capa do formulário, em cada seção, em cada pergunta e em cada opção; e pergunta do tipo **Imagem** para o fiel anexar foto (ex.: certidão de batismo, bucket privado) |
| Quiz | **Modo quiz**: marca a(s) resposta(s) certa(s) e os pontos; a nota é calculada no servidor (o gabarito nunca vai para o celular) |
| (extra) Relatório | Respostas por pessoa, filtro por comunidade, botão WhatsApp e **exportação em planilha (CSV)** |

## 4. App do fiel (inChurch × nosso)

| inChurch | Minha Paróquia |
|---|---|
| Home com "Como está se sentindo hoje?" e atalhos em círculo | 🆕 check-in de sentimento + atalhos (Formulários, Pedido de oração, Testemunhos, Bíblia) |
| Banner, Minha agenda, vídeos em destaque | ✅ banners, eventos, notícias, liturgia |
| Vídeos por categoria / séries | ✅ Mídia |
| Materiais com "marcar como lido" | ✅ textos · 🔜 progresso de leitura |
| Pedido de oração, Testemunho, Doação, Bíblia, Downloads, Ao vivo | ✅ / 🆕 (oração e testemunho novos) · Ao vivo 🔜 (link do YouTube na Home) |
| Encontre uma célula | ✅ Grupos |
| Perfil "83% completo", carteirinhas | 🔜 completar perfil (gamificado) · ➖ carteirinha |

## 5. Próximos passos sugeridos (ordem)

1. Aniversariantes do mês + campo sexo/bairro no perfil (métricas como na inChurch).
2. Plano de leitura (Bíblia em 1 ano / Advento) usando a Bíblia que já está no banco.
3. Agendamento de notícias e de push.
4. Atendimento pastoral: agenda de confissões e conversas com o padre.
5. Ingressos pagos para eventos (já temos Mercado Pago Connect).

## Como demonstrar

Rode `supabase/seed_demo.sql` (paróquia **Sagrado Coração de Jesus** com
as comunidades **Imaculado Coração de Maria** e **Castíssimo Coração de
José**). Logins e senha estão no topo do arquivo. Entre como
`matriz@…` para ver o painel completo, como `imaculado@…` para ver a visão
de uma comunidade, e como `fiel@…` para ver o app do fiel recebendo o
conteúdo da Matriz + da comunidade.
