# Caminhos da Fé

Aventura educativa 2D para celular, para jovens, adultos e famílias católicas. O jogador explora vilas ilustradas, ajuda os moradores, resolve desafios, responde perguntas e aprende sobre virtudes cristãs e a vida dos santos.

> **Projeto independente.** Não tem aprovação nem endosso oficial da Igreja. As histórias das vilas são ficção, sempre identificadas como tal. O conteúdo religioso e histórico cita fontes.

**Estado atual (v0.1.0):** o capítulo 1, "A caridade na prática", está completo e jogável, com cerca de 10 minutos de duração.

| Item do MVP | Onde está |
|---|---|
| Menu inicial | `scenes/main_menu.tscn` |
| Mapa de progressão | `scenes/world_map.tscn` |
| Cenário explorável com personagem | `scenes/exploration.tscn` (a vila do Vale Sereno) |
| 3 desafios diferentes | Mutirão (cooperação), Cestas (generosidade), Canal (serviço): `scenes/challenge.tscn` |
| 5 perguntas | `data/questions_001.json` |
| Narrativa sobre uma virtude | `data/chapter_001.json` (caridade) |
| Diário com referências | botão de livro no topo da vila |
| Pontuação e conclusão | `scripts/scoring.gd` e `scenes/ending.tscn` |
| Salvamento local e reinício | `scripts/save_manager.gd`, botão "Recomeçar capítulo" |
| Tela final com resumo | `scenes/ending.tscn` |
| Idiomas | interface em português, espanhol e inglês (conteúdo do capítulo em português) |

---

## 1. Instalar (gratuito)

1. Baixe o **Godot 4.6** (versão "Standard", não a ".NET") em https://godotengine.org/download. É gratuito e não precisa instalar: basta descompactar e abrir.
2. Abra o Godot. Na tela "Gerenciador de Projetos", clique em **Importar**, escolha a pasta `CaminhosDaFe` e selecione o arquivo `project.godot`.
3. Clique em **Importar e Editar**. Na primeira vez, o Godot leva alguns segundos preparando as imagens.

## 2. Jogar no computador

- Aperte **F5** (ou o botão ▶ no canto superior direito).
- O jogo abre numa janela no formato de celular. O mouse faz o papel do dedo.
- Para testar outro tamanho de tela, redimensione a janela: a interface se adapta.

## 3. Rodar os testes

Os testes conferem as regras, o conteúdo (fontes, respostas, ids) e jogam o capítulo inteiro automaticamente.

**No editor:** abra `tests/playthrough.tscn` e aperte **F6** ("rodar cena atual"). A partida acontece sozinha e o resultado aparece na aba **Saída**, embaixo.

**No terminal** (troque `godot` pelo caminho do seu executável):

```bash
cd CaminhosDaFe
godot --headless -s res://tests/run_tests.gd               # 19 testes de lógica e conteúdo
godot --headless --path . res://tests/playthrough.tscn     # partida completa automatizada
godot --path . res://tests/playthrough.tscn -- --shots     # a mesma partida, salvando capturas de tela
```

Se algum teste falhar, a mensagem diz o arquivo e o campo com problema. Exemplo: `questions[2]: 'answer' (5) fora das alternativas`.

## 4. Como o projeto está organizado

```
CaminhosDaFe/
  project.godot            configurações (tela 720×1280, idioma padrão, autoloads)
  scenes/                  telas (.tscn)
    main_menu.tscn  world_map.tscn  exploration.tscn  challenge.tscn  ending.tscn
    ui/dialogue_box.tscn   caixa de diálogo reutilizável
  scripts/
    save_manager.gd        grava/lê o progresso (arquivo local, sem internet)
    progress_manager.gd    o que o jogador já fez: pontos, respostas, escolhas, diário
    content_loader.gd      lê os JSON da pasta data/ e chama o validador
    content_validator.gd   confere o conteúdo antes de o jogo usar
    game_manager.gd        troca de telas, idioma e visual (tema)
    scoring.gd             regras de pontuação, num só lugar
    puzzles/               regras dos 3 desafios (sem interface; testadas)
    ui/                    scripts das telas
  data/                    TODO o conteúdo: capítulos, perguntas, fontes, textos da interface
  assets/                  arte provisória (SVG original), ícones e fontes livres (OFL)
  tests/                   testes automatizados
  tools/gerar_arte.py      gera a arte provisória
  docs/                    conteúdo, validação, monetização e lojas
```

A regra principal: **interface, regras, progresso, salvamento e conteúdo ficam separados.** Para mudar uma fala, uma pergunta ou a ordem da história, edite o JSON. Não é preciso mexer em código.

### Os "autoloads"

São scripts que ficam carregados o tempo todo e podem ser usados de qualquer cena pelo nome: `SaveManager`, `ContentLoader`, `ProgressManager` e `GameManager`. Veja em **Projeto > Configurações do Projeto > Globais (Autoload)**.

## 5. Criar uma cena e conectar sinais (passo a passo)

Exemplo: um botão "Créditos" no menu.

**Criar a cena**
1. **Cena > Nova Cena**. Em "Criar nó raiz", escolha **Interface do Usuário** (cria um `Control`).
2. Renomeie o nó raiz (duplo clique) para `Credits`.
3. Com `Credits` selecionado, clique no **+** (ou Ctrl+A) e adicione um `VBoxContainer`. No topo da área 2D, em **Layout**, escolha **Retângulo Completo**.
4. Dentro dele, adicione um `Label` (o texto dos créditos) e um `Button` (o texto "Voltar").
5. Salve com **Ctrl+S** como `scenes/credits.tscn`.

**Anexar um script**
1. Selecione o nó `Credits` e clique no ícone de pergaminho com **+** ("Anexar Script"). Salve como `scripts/ui/credits.gd`.

**Conectar o sinal do botão, jeito 1: pelo editor**
1. Selecione o `Button`. À direita, abra a aba **Nó > Sinais**.
2. Dê duplo clique em `pressed()`, escolha o nó `Credits` e clique em **Conectar**.
3. O Godot cria a função `_on_button_pressed()` no script. Escreva dentro dela:
   ```gdscript
   func _on_button_pressed() -> void:
       GameManager.goto("menu")
   ```

**Jeito 2: por código** (é o que este projeto usa, porque fica visível no script)
1. No Button, ative **Acesso como Nome Único** (botão direito no nó). O nome passa a ser usado como `%Button`.
2. No script:
   ```gdscript
   func _ready() -> void:
       %Button.pressed.connect(func(): GameManager.goto("menu"))
   ```

**Abrir a nova tela:** adicione `"credits": "res://scenes/credits.tscn"` no dicionário `SCENES` de `scripts/game_manager.gd` e chame `GameManager.goto("credits")`.

## 6. Adicionar um capítulo novo

Passo a passo completo em [`docs/conteudo.md`](docs/conteudo.md). Resumo:

1. Copie `data/chapter_001.json` para `data/chapter_002.json` e `data/questions_001.json` para `data/questions_002.json`. Escreva a nova história.
2. Cadastre as fontes novas em `data/sources.json`.
3. Em `data/chapters.json`, troque o capítulo 2 de `"coming_soon"` para `"available"` e informe os arquivos.
4. Rode os testes. O validador aponta qualquer erro, por exemplo uma pergunta sem fonte ou um desafio com mais de uma solução.

## 7. Traduzir

- **Textos da interface:** `data/i18n/ui.json` já tem português, espanhol e inglês.
- **Conteúdo do capítulo:** crie `data/i18n/es/chapter_001.json` (e `questions_001.json`, `sources.json`) com o texto traduzido. O jogo usa automaticamente a versão do idioma escolhido e volta ao português quando não existe tradução.
- Textos religiosos traduzidos devem passar pela mesma revisão de fontes do original (veja `docs/conteudo.md`).

## 8. Gerar o app para Android

**O que precisa (tudo gratuito para testar):**
- Godot 4.6 com os **modelos de exportação**: no editor, **Editor > Gerenciar Modelos de Exportação > Baixar e Instalar**.
- **Android SDK**: o jeito mais simples é instalar o Android Studio (gratuito) e abrir uma vez. Ele instala o SDK.
- **Java (JDK 17)**.
- Em **Editor > Configurações do Editor > Exportar > Android**, informe a pasta do SDK e a do Java.

**Exportar:**
1. **Projeto > Exportar**. A predefinição "Android" já está configurada (`export_presets.cfg`).
2. Clique em **Exportar Projeto**, mantenha "Exportar com Depuração" marcado e salve como `build/CaminhosDaFe.apk`.
3. Envie o `.apk` para o celular e instale. O Android pede para permitir "fontes desconhecidas".

**Sem configurar nada:** a cada mudança enviada ao GitHub, a automação "Caminhos da Fé" (aba **Actions**) roda os testes e gera o APK de teste em **Artifacts > caminhos-da-fe-apk-teste**.

**Para publicar na Play Store** (só depois da validação, veja `docs/monetizacao.md`):
- Crie uma **chave de assinatura de lançamento** (Projeto > Exportar > Android > Keystore > Release). Guarde-a fora do repositório e com backup. Sem ela, não é possível atualizar o app depois.
- Exporte como **AAB** (formato exigido pela Play Store), o que exige o "Gradle build" ligado na exportação.
- Custos: conta de desenvolvedor Google Play, US$ 25, pagamento único.

## 9. Gerar o app para iOS (documentado, não testado aqui)

- É obrigatório ter um **Mac com Xcode** (gratuito na App Store do Mac). Não existe forma oficial de compilar para iPhone sem macOS.
- Para instalar no seu próprio iPhone em teste, basta um Apple ID gratuito no Xcode. O app expira em 7 dias.
- Para distribuir (TestFlight ou App Store), é preciso o **Apple Developer Program: US$ 99 por ano**.
- Passos: no Godot (no Mac), instale os modelos de exportação, vá em **Projeto > Exportar > iOS**, preencha o **Team ID** da sua conta Apple e o identificador `com.caminhosdafe.jogo`, exporte o projeto Xcode e abra-o no Xcode para rodar no aparelho.

## 10. Custos e limitações

| Item | Custo | Quando |
|---|---|---|
| Godot, fontes, arte provisória, testes | R$ 0 | já |
| Teste em Android (APK) | R$ 0 | já |
| Conta Google Play | US$ 25, pagamento único | só para publicar |
| Mac para compilar iOS | já ter um, ou alugar um Mac na nuvem | só para iOS |
| Apple Developer Program | US$ 99 por ano | só para distribuir no iOS |
| Ilustrações definitivas | variável | depois de validar o interesse |

**Limitações conhecidas:**
- **Áudio:** o jogo ainda não tem música nem efeitos sonoros.
- **Tradução:** só a interface está traduzida; o conteúdo do capítulo 1 existe apenas em português.
- **Teste em aparelho:** o APK foi gerado e verificado (assinatura, pacote, conteúdo embutido), mas ainda não foi testado num aparelho físico.
- **iOS:** não foi compilado, porque exige macOS.
- **Arte:** a arte é provisória, desenhada por código. Para trocá-la, substitua os arquivos em `assets/` mantendo os mesmos nomes.

## 11. Licenças

- Código e arte provisória: criados para este projeto.
- Fontes **Nunito** e **Alegreya**: SIL Open Font License 1.1 (arquivos em `assets/fonts/`).
- Textos citados do Catecismo: versão em português publicada pela Santa Sé (vatican.va). Passagens bíblicas aparecem resumidas, com a referência.
