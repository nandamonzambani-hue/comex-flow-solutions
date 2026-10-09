# Mente Oculta

Jogo 2D de investigação para celular. O jogador examina documentos, interroga suspeitos, compara depoimentos no Quadro e faz uma acusação baseada em evidências.

**Estado atual (v0.1.0):** o primeiro caso, "O Caso da Mensagem Anônima", está completo e jogável, com duração de 10 a 15 minutos. Tudo nele é ficção.

| Requisito do MVP | Onde está |
|---|---|
| Menu inicial, começar e continuar | `scenes/main_menu.tscn` |
| Caso completo, 3 suspeitos, 6 pistas | `data/case_001.json` |
| Diálogos e interrogatórios com perguntas que se desbloqueiam | `scenes/dialogue.tscn` |
| Inventário de pistas e documentos | aba **Pistas**, `scenes/clue_card.tscn` |
| Comparação de depoimentos | aba **Quadro**, `scenes/evidence_board.tscn` |
| 3 decisões que mudam a investigação | D1, D2 e D3 em `data/case_001.json` |
| Sistema de condições | `scripts/rules/conditions.gd` |
| Acusação, 2 finais, pontuação, resultado | `scenes/accusation.tscn`, `scenes/ending.tscn` |
| Reiniciar e salvamento local | menu e tela final; `scripts/save_manager.gd` |
| Tela de celular, textos legíveis | 720×1280 adaptável; opção de texto grande |
| Tabela de verdade do caso | [`docs/caso_001_verdade.md`](docs/caso_001_verdade.md) (contém a solução) |

---

## 1. Instalar (gratuito)

1. Baixe o **Godot 4.6, versão Standard** em https://godotengine.org/download. É grátis e não precisa instalar: basta descompactar.
2. Abra o Godot, clique em **Importar**, escolha a pasta `MenteOculta` e o arquivo `project.godot`.
3. Clique em **Importar e Editar**.

## 2. Jogar

Aperte **F5**. O jogo abre no formato de celular, e o mouse faz o papel do dedo.

**Como se joga:**
- **Local:** toque nos círculos para examinar a livraria. Os vermelhos que pulsam têm novidade.
- **Suspeitos:** converse e escolha perguntas. Novas perguntas aparecem quando você encontra pistas ou contradições.
- **Pistas:** tudo o que você coletou. Toque numa pista para ver o documento. Pistas nunca somem.
- **Quadro:** escolha duas informações que não podem ser verdadeiras ao mesmo tempo e toque em **Comparar**.
- **Dica** (lâmpada no topo): mostra o objetivo e oferece 3 dicas grátis por caso.
- **Fazer a acusação:** escolha o suspeito e até 3 evidências.

## 3. Testes

```bash
cd MenteOculta
godot --headless -s res://tests/run_tests.gd                      # 12 testes de regras e salvamento
godot --headless --path . res://tests/playthrough.tscn            # resolve o caso pela interface (final certo)
godot --headless --path . res://tests/playthrough.tscn -- --wrong # mesmo caminho, com outras decisões e o final errado
godot --path . res://tests/playthrough.tscn -- --shots            # salva capturas de tela em user://shots
```

O teste mais importante é `test_every_decision_path_is_solvable`. Ele joga automaticamente as **8 combinações de decisões** e confirma que, em todas, as 6 pistas e as 4 contradições podem ser encontradas, ou seja, o caso nunca fica impossível.

No editor, também dá para abrir `tests/playthrough.tscn` e apertar **F6**.

## 4. Organização (o que fica em cada lugar)

```
MenteOculta/
  data/case_001.json          CONTEÚDO: personagens, pistas, falas, condições, finais
  data/cases.json             lista de casos do menu
  data/i18n/ui.json           textos da interface (pt, es, en)
  scripts/rules/              REGRAS (sem interface; testadas)
    conditions.gd             avalia condições do JSON
    case_state.gd             ESTADO da investigação (pistas, decisões...)
    investigation_rules.gd    o que está disponível, perguntar, comparar, acusar
    case_validator.gd         confere o JSON e explica os erros
    case_solver.gd            "jogador automático" usado nos testes
  scripts/save_manager.gd     SALVAMENTO local (arquivo JSON em user://)
  scripts/case_loader.gd      lê e valida os casos
  scripts/game_manager.gd     telas, idioma, tema visual e progresso
  scripts/investigation.gd    tela principal
  scripts/ui/                 INTERFACE (cada tela e janela)
  scenes/                     cenas .tscn
  assets/                     arte provisória original (SVG) e fontes livres
  tools/gerar_arte.py         gera a arte provisória
  tests/                      testes automáticos
  docs/                       verdade do caso, novo caso, validação, monetização
```

Monetização futura: só há um ponto de entrada marcado no código (a janela de dicas, em `scripts/investigation.gd`). Nada de compras ou anúncios foi implementado.

## 5. Criar uma cena e conectar um sinal (passo a passo)

Exemplo: uma tela de "Créditos".

1. **Cena > Nova Cena > Interface do Usuário.** Renomeie o nó raiz para `Credits`.
2. Adicione um `VBoxContainer` (botão **+**). No menu **Layout**, escolha **Retângulo Completo**.
3. Dentro dele, adicione um `Label` (o texto) e um `Button` com o texto "Voltar".
4. Salve como `scenes/credits.tscn`.
5. Selecione `Credits` e clique em **Anexar Script**. Salve como `scripts/ui/credits.gd`.
6. **Conectar pelo editor:** selecione o Button, abra **Nó > Sinais**, dê duplo clique em `pressed()` e conecte ao nó `Credits`. Na função criada, escreva:
   ```gdscript
   func _on_button_pressed() -> void:
       GameManager.goto("menu")
   ```
7. **Ou por código** (é o que este projeto usa): clique com o botão direito no Button, escolha **Acesso como Nome Único** e, no script:
   ```gdscript
   func _ready() -> void:
       %Button.pressed.connect(func(): GameManager.goto("menu"))
   ```
8. Para abrir a tela, adicione `"credits": "res://scenes/credits.tscn"` em `SCENES`, no `scripts/game_manager.gd`.

## 6. Criar um novo caso

Veja [`docs/novo_caso.md`](docs/novo_caso.md). Resumo: escreva a tabela de verdade **antes**, copie `case_001.json`, cadastre em `cases.json` e rode os testes. O validador aponta cada erro com o caminho exato, por exemplo `dialogues.bia.topics[2].condition: clue desconhecido 'p9'`.

## 7. Android

**Para testar:** a automação "Mente Oculta" (aba **Actions** do GitHub) roda os testes e gera o APK em **Artifacts > mente-oculta-apk-teste**. Instale no celular permitindo "fontes desconhecidas".

**Na sua máquina:**
1. No Godot, abra **Editor > Gerenciar Modelos de Exportação > Baixar e Instalar**.
2. Instale o Android Studio (gratuito) para obter o Android SDK, e também o JDK 17.
3. Em **Editor > Configurações do Editor > Exportar > Android**, informe as pastas do SDK e do Java.
4. Em **Projeto > Exportar > Android**, clique em **Exportar Projeto** e salve como `build/MenteOculta.apk`.

**Para publicar na Play Store** (só depois da validação):
- Crie uma **chave de lançamento** e guarde-a com backup, fora do repositório. Sem ela, não é possível atualizar o app.
- Exporte em **AAB**, com "Gradle build" ligado.
- Conta de desenvolvedor Google Play: **US$ 25, pagamento único**.

## 8. iOS (documentado; não compilado aqui)

| Item | Custo |
|---|---|
| Mac com Xcode | Xcode é gratuito; é preciso ter um Mac ou alugar um na nuvem |
| Testar no seu iPhone | Apple ID gratuito (o app expira em 7 dias) |
| Distribuir (TestFlight / App Store) | Apple Developer Program, **US$ 99 por ano** |
| Certificados e perfis de provisionamento | gerados pelo Xcode com a conta acima |

**Passos:**
1. No Mac, instale os modelos de exportação.
2. Em **Projeto > Exportar > iOS**, preencha o Team ID e o identificador `com.menteoculta.jogo`.
3. Exporte o projeto Xcode, abra-o no Xcode, escolha seu time em **Signing** e rode no aparelho.

## 9. Custos e limitações

- **Custo até aqui:** R$ 0. Godot, fontes (OFL), arte e testes são gratuitos.
- **Para publicar:** Google Play, US$ 25 (único); Apple, US$ 99 por ano mais um Mac.
- **Limitações conhecidas:**
  - Sem música e sem efeitos sonoros.
  - Só a interface está traduzida para espanhol e inglês; o caso existe apenas em português.
  - A arte é provisória. Para trocá-la, substitua os arquivos em `assets/` mantendo os nomes.
  - O APK foi gerado e verificado, mas ainda não foi testado num aparelho físico.

## 10. Sobre o conteúdo

- Todos os personagens, lugares e documentos são **ficção**.
- As conclusões vêm de **evidências verificáveis dentro da história** (horários, registros, documentos). O jogo não sugere que gestos ou expressões isoladas provem uma mentira.
- Classificação etária pretendida: **12 anos ou mais**. Não há violência, apenas um furto sem vítimas.
