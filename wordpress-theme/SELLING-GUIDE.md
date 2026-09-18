# FlowCraft — guia de publicação e monetização

O tema está em `wordpress-theme/flowcraft/` (e já empacotado em `flowcraft.zip`). É um **tema de blocos (FSE)** 100% genérico, sem nenhuma referência à Comex — pronto para publicar.

## 1. Testar antes de enviar

1. Suba `flowcraft.zip` num WordPress local (LocalWP, Studio da própria WordPress.org, ou um servidor de teste) via *Aparência > Temas > Adicionar novo > Enviar tema*.
2. Ative o tema e vá em *Aparência > Editor* para conferir o header, footer e os padrões da home.
3. Rode o [Theme Check plugin](https://wordpress.org/plugins/theme-check/) — é o mesmo linter que a equipe de revisão do WordPress.org usa.
4. Rode o [Site Health](https://wordpress.org/plugins/health-check/) e o validador de acessibilidade do editor (WP já tem alguns avisos nativos).

## 2. Por que não dá para "vender" no WordPress.org

O diretório oficial (wordpress.org/themes) só aceita temas **gratuitos e 100% GPL**. Isso é regra, não sugestão — não existe "tema pago" lá. O valor de estar lá é **distribuição gratuita e reputação**, não receita direta.

## 3. Modelo escolhido: Freemium (grátis + Pro)

Como você já decidiu esse caminho, os passos são:

1. **Publique o FlowCraft grátis no WordPress.org.** Isso te dá um canal de instalações orgânicas.
2. **Crie o "FlowCraft Pro"** como um plugin complementar ou um segundo tema, vendido fora do .org (no seu próprio site com Easy Digital Downloads/WooCommerce, ou em marketplaces).
3. O arquivo `inc/upsell.php` já adiciona um item discreto em *Aparência > FlowCraft Pro* apontando para `https://example.com/flowcraft-pro` — troque essa URL pela página real de vendas antes de publicar.
4. **Nunca** trave funcionalidade básica do tema gratuito para forçar upgrade — isso é motivo de rejeição/remoção pelo time de revisão do WordPress.org. O Pro deve *adicionar* valor (mais padrões, builder de header/footer, templates WooCommerce, suporte prioritário), não *remover* o que já existe no grátis.

## 4. Processo de submissão ao WordPress.org

1. Crie uma conta em https://login.wordpress.org/.
2. Acesse https://wordpress.org/themes/upload/ e envie o `.zip`.
3. A revisão manual costuma levar de algumas semanas a poucos meses (fila é grande). Responda rápido a qualquer pedido de ajuste do revisor.
4. Depois de aprovado, o tema fica no seu repositório SVN próprio (`https://themes.svn.wordpress.org/flowcraft/`) — todo update futuro é via `svn commit`, não upload manual.

Pontos que costumam gerar rejeição (já tratados aqui, mas vale revisar de novo antes de enviar):
- Sem imagens/fontes de terceiros sem licença compatível — o tema não empacota nenhuma imagem, só placeholders vazios.
- Sem nags, popups ou redirecionamento forçado ao ativar — não implementado.
- `Text Domain` no `style.css` bate com a pasta do tema (`flowcraft`) — feito.
- Tags no `style.css`/`readme.txt` batem com a [lista oficial permitida](https://developer.wordpress.org/themes/releasing-your-theme/theme-tags/).

## 5. Onde efetivamente vender (renda recorrente de verdade)

WordPress.org não paga nada — é o "Pro" ou uma venda paralela que gera receita:

- **Seu próprio site + assinatura**: WooCommerce/Easy Digital Downloads com licenciamento (ex: plugin "Software License Manager" ou EDD Software Licensing) cobrando anual por renovação — é o modelo de receita recorrente mais direto.
- **Marketplaces**: Envato/ThemeForest (venda única com royalties, não assinatura, mas fluxo constante se você mantiver o tema atualizado).
- **Freemius**: plataforma pronta para monetizar temas/plugins WordPress com assinatura, trial, licenciamento — te poupa de construir isso do zero.

## 6. Próximos passos técnicos sugeridos

- Trocar os placeholders de imagem por fotos de banco de imagens livre (Unsplash/Pexels) só como exemplo do "demo" — nunca enviar fotos de clientes/empresas reais.
- Adicionar 2-3 variações de estilo (`styles/*.json`) para dar mais apelo visual sem duplicar o tema inteiro.
- Criar um site de demonstração (pode ser o mesmo domínio da futura página de vendas do Pro) mostrando o tema em uso.
