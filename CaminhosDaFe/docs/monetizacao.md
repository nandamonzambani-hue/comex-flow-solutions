# Monetização respeitosa e regras das lojas

> **Nada disto está implementado.** O MVP não tem compras, anúncios nem coleta de dados, de propósito. Compras só entram depois da validação (`docs/validacao.md`) mostrar interesse real. Não há promessa de resultado financeiro.

## Modelo pretendido

| Oferta | Preço experimental | Observação |
|---|---|---|
| Capítulo 1 | gratuito | sempre completo, sem anúncios |
| Pacote de capítulos (ex.: 3 capítulos sobre santos) | de R$ 4,90 a R$ 14,90 | preço a testar na validação |
| Expansões temáticas (virtudes, história da Igreja) | idem | |
| Coleções para famílias e grupos de catequese | a definir | possível licença para grupos no futuro |

## Princípios (valem para qualquer versão futura)

- **Nunca vender** promessas espirituais, bênçãos, indulgências, sacramentos ou qualquer benefício religioso.
- **O essencial da fé nunca fica atrás de pagamento.** Orações, passagens bíblicas, ensinamentos básicos e o diário de cada capítulo jogado ficam sempre acessíveis.
- **Sem anúncios** durante orações, leituras bíblicas ou reflexões. Se um dia houver anúncios, só em pausas neutras (entre capítulos) e nunca para menores sem as proteções exigidas.
- **Sem pressão emocional religiosa** ("não deixe seu santo esperando", contadores de urgência, culpa).
- **Sem caixas de recompensa** (itens pagos aleatórios), sem moedas virtuais que escondam o preço real e sem compras por impulso dentro dos desafios.
- O preço aparece em reais, de forma clara, antes da compra.

## Como implementar quando chegar a hora

- **Android:** Google Play Billing. Para Godot existe o plugin oficial `GodotGooglePlayBilling`; confira a versão compatível com o Godot usado.
- **iOS:** compras no app da Apple (StoreKit), via plugin iOS do Godot.
- Cada pacote deve ser uma compra **não consumível** (comprou, é seu para sempre) e o app precisa ter **"Restaurar compras"**.
- Os capítulos pagos podem vir dentro do app, bloqueados, para continuarem funcionando offline.

## Regras das lojas e da lei: leia antes de publicar

As regras mudam. Confira a versão vigente na data da publicação e registre a data da leitura na tabela no fim desta página.

### Google Play
- **Pagamentos:** conteúdo digital vendido dentro do app deve, em regra, usar o faturamento do Google Play. https://support.google.com/googleplay/android-developer/answer/9858738
- **Famílias:** se o público incluir crianças, aplicam-se as Políticas para Famílias (anúncios certificados, restrições de dados). https://support.google.com/googleplay/android-developer/answer/9893335
- **Segurança dos dados:** formulário obrigatório na Play Console, mesmo que o app não colete nada. https://support.google.com/googleplay/android-developer/answer/10787469
- **Anúncios:** https://support.google.com/googleplay/android-developer/answer/9857753

### Apple App Store
- **Diretrizes de revisão:** em especial a seção 3.1 (compras no app) e a 1.3 (categoria Infantil). https://developer.apple.com/app-store/review/guidelines/
- **Rótulos de privacidade:** obrigatórios na App Store Connect. https://developer.apple.com/app-store/app-privacy-details/

### Brasil
- **LGPD (Lei 13.709/2018):** tratamento de dados pessoais. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- **Estatuto Digital da Criança e do Adolescente (Lei 15.211/2025):** aplica-se a produtos de tecnologia direcionados a crianças e adolescentes ou de acesso provável por eles, que é o caso deste jogo. https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm
- Antes de adicionar compras, anúncios ou ferramentas de análise, busque orientação jurídica e publique uma **política de privacidade** num endereço público.

### Situação atual do MVP
- Não coleta dados pessoais, não tem conta de usuário, chat, anúncios nem análise de uso.
- A única ação de rede possível é abrir, a pedido do jogador, um link de fonte no navegador. O app não pede a permissão de internet.
- O progresso fica salvo só no aparelho (`user://save.json`).

| Documento | Lido em | Por quem | Observações |
|---|---|---|---|
| Google Play – Pagamentos | | | |
| Google Play – Famílias | | | |
| Apple – Diretrizes | | | |
| ECA Digital | | | |
