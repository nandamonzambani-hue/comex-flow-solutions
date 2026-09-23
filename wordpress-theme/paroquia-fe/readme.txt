=== Paróquia Fé ===
Contributors: (seu usuário na Envato/ThemeForest ou marketplace escolhido)
Tags: church, religion, non-profit, blog, custom-colors, custom-logo, custom-menu, featured-images, footer-widgets, threaded-comments, translation-ready, one-column, two-columns, right-sidebar
Requires at least: 6.0
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Tema WordPress completo e responsivo para paróquias, dioceses e comunidades católicas.

== Descrição ==

Paróquia Fé é um tema WordPress pensado para paróquias, santuários e comunidades
católicas que querem uma presença online profissional, sem depender de
desenvolvedor para o dia a dia. Com ele, a secretaria paroquial consegue
publicar sozinha:

* Horário de Missas, organizado por dia da semana;
* Agenda de Eventos (novenas, festas, retiros, celebrações especiais);
* Apresentação do Clero e da Equipe Pastoral;
* Pastorais e Movimentos, com foto e descrição;
* Blog/Notícias da paróquia;
* Seção de Doações e Dízimo, com chave Pix e link de pagamento;
* Contato, endereço, telefone, WhatsApp e redes sociais no topo e no rodapé.

Todo o conteúdo é gerenciado por Custom Post Types nativos do WordPress
(sem plugins obrigatórios) e as cores, o banner e os textos da home são
configurados pelo Personalizador (Aparência > Personalizar), com pré-visualização
em tempo real.

== Instalação ==

1. No painel do WordPress, acesse Aparência > Temas > Adicionar novo > Enviar tema.
2. Envie o arquivo .zip do tema "paroquia-fe" e clique em Instalar agora.
3. Ative o tema.
4. Vá em Aparência > Personalizar para preencher:
   - Configurações da Paróquia > Informações de Contato (endereço, telefone, WhatsApp, e-mail);
   - Configurações da Paróquia > Redes Sociais;
   - Configurações da Paróquia > Página Inicial (banner, texto de boas-vindas);
   - Configurações da Paróquia > Doações e Dízimo (opcional);
   - Cores (cor primária e cor de destaque).
5. No menu lateral do admin, cadastre o conteúdo:
   - "Horários de Missa" > Adicionar Novo (dia, hora, local);
   - "Eventos" > Adicionar Novo (data, hora, local, descrição);
   - "Clero e Equipe" > Adicionar Novo (cargo, telefone, e-mail, foto);
   - "Pastorais e Grupos" > Adicionar Novo.
6. Em Aparência > Menus, crie o menu principal e atribua-o à posição "Menu Principal".
7. Em Aparência > Widgets, você pode adicionar os widgets "Paróquia Fé - Horário de
   Missas" e "Paróquia Fé - Próximos Eventos" em qualquer área de widgets (ex: rodapé).
8. Defina uma página estática como página inicial em Configurações > Leitura,
   ou deixe em branco: o tema já usa "front-page.php" automaticamente com base
   nos dados acima quando a opção "Sua última entrada" está marcada em
   Configurações > Leitura.

== Personalização de cores e fontes ==

As cores principais ficam em `assets/css/main.css`, nas variáveis CSS dentro de
`:root` (--pf-cor-primaria, --pf-cor-destaque, etc.), mas também podem ser
alteradas sem código em Aparência > Personalizar > Cores.

As fontes usadas são Cormorant Garamond (títulos) e Mulish (corpo do texto),
carregadas do Google Fonts. Para trocá-las, edite a chamada em `functions.php`
na função `paroquiafe_scripts()`.

== Estrutura de arquivos ==

* style.css - cabeçalho do tema (obrigatório pelo WordPress).
* functions.php - configuração geral, menus, sidebars, scripts.
* inc/custom-post-types.php - Eventos, Horários de Missa, Clero, Pastorais.
* inc/meta-boxes.php - campos extras de cada tipo de conteúdo.
* inc/customizer.php - opções do Personalizador.
* inc/template-tags.php - funções auxiliares usadas nos templates.
* inc/widgets.php - widgets de Horário de Missas e Próximos Eventos.
* template-parts/ - blocos reutilizáveis de conteúdo.
* assets/css/main.css - estilo visual completo do tema.
* assets/js/main.js - menu mobile e submenus.

== Licença ==

Este tema é distribuído sob a licença GPLv2 (ou posterior), como exigido para
temas WordPress. As fontes Cormorant Garamond e Mulish são licenciadas sob a
SIL Open Font License, disponível via Google Fonts.

== Changelog ==

= 1.0.0 =
* Versão inicial de lançamento.

== Créditos ==

* Cormorant Garamond & Mulish, Google Fonts (SIL OFL) - https://fonts.google.com/
* Dashicons, incluído no núcleo do WordPress (GPLv2) - usado para os ícones de contato/redes sociais.
