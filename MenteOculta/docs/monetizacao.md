# Monetização e regras das lojas

> **Nada implementado.** O MVP não tem compras, anúncios nem analytics. Só depois da validação (`validacao.md`) vale implementar. Não há promessa de receita nem de aprovação nas lojas.

## Modelo pretendido

| Oferta | Hipótese de preço | Regras |
|---|---|---|
| Caso 1 | gratuito | completo, sem anúncios obrigatórios |
| Pacote de casos premium | de R$ 4,90 a R$ 14,90 | compra única (não consumível), com "Restaurar compras" |
| Dicas extras | anúncio recompensado **opcional** | só depois das 3 dicas grátis, e só quando o jogador pedir |
| Remover anúncios | compra única | opcional |

## Princípios
- A solução **nunca** fica atrás de anúncio ou compra: as pistas, o Quadro e a acusação são sempre jogáveis.
- **Nenhum anúncio** durante diálogos, documentos, decisões ou na explicação final. Anúncio só quando o jogador escolhe ver um, em troca de uma dica.
- Sem caixas de recompensa, moedas que escondam o preço real ou contadores de urgência.
- Preço em reais, mostrado antes da compra.

## Onde isso entra no código
- **Dicas:** `scripts/investigation.gd`, função `_open_hint()`. Quando acabam as dicas grátis, ali pode entrar o botão "Assistir anúncio para uma dica extra". A regra de quantas dicas existem fica em `free_hints`, no JSON do caso, e em `InvestigationRules.free_hints_left()`.
- **Casos pagos:** `data/cases.json` já marca `"free": true/false`. Um caso pago pode vir dentro do app, bloqueado, para funcionar offline depois da compra.
- **Ferramentas possíveis para Godot:**
  - Android: Google Play Billing, com o plugin oficial `GodotGooglePlayBilling`;
  - iOS: StoreKit, com o plugin iOS do Godot;
  - anúncios: AdMob, com um plugin da comunidade.
  - Confira a compatibilidade com a versão do Godot antes de escolher.

## Regras para ler antes de publicar

As regras mudam. Leia a versão vigente e registre a data na tabela abaixo.

### Google Play
- Pagamentos (conteúdo digital usa o faturamento do Google Play): https://support.google.com/googleplay/android-developer/answer/9858738
- Anúncios: https://support.google.com/googleplay/android-developer/answer/9857753
- Políticas para Famílias (se o público incluir menores): https://support.google.com/googleplay/android-developer/answer/9893335
- Seção "Segurança dos dados" (obrigatória): https://support.google.com/googleplay/android-developer/answer/10787469

### Apple App Store
- Diretrizes de revisão, em especial a 3.1 (compras no app): https://developer.apple.com/app-store/review/guidelines/
- Rótulos de privacidade: https://developer.apple.com/app-store/app-privacy-details/
- Anúncios personalizados no iOS exigem o pedido de permissão de rastreamento (App Tracking Transparency).

### Brasil
- LGPD (Lei 13.709/2018): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- Estatuto Digital da Criança e do Adolescente (Lei 15.211/2025), que se aplica a produtos de acesso provável por adolescentes: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm
- Antes de adicionar anúncios ou analytics: publique uma **política de privacidade** e busque orientação jurídica.

### Classificação etária
- Pretendida: **12 anos ou mais** (mistério sem violência). Responda com sinceridade aos questionários da IARC/Google Play e da Apple.
- Anúncios recompensados e públicos com menores exigem configurações específicas na rede de anúncios.

### Situação atual do MVP
- Não coleta dados pessoais e não tem login, chat, anúncios nem analytics.
- O app não pede permissão de internet. Progresso salvo só no aparelho.

| Documento | Lido em | Por quem | Observações |
|---|---|---|---|
| Google Play – Pagamentos | | | |
| Google Play – Anúncios / Famílias | | | |
| Apple – Diretrizes | | | |
| ECA Digital | | | |
