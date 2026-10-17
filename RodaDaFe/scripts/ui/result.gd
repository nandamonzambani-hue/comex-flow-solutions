extends Control
## Resultado da partida: venceu/perdeu, medalhas, acertos e moedas.

func _ready() -> void:
	Game.background(self)
	var m: MatchState = Game.last_match
	var v := UiKit.page(self, 22)
	v.add_child(TopBar.make())
	if m == null:
		v.add_child(UiKit.button("Voltar ao início", "PrimaryButton"))
		v.get_child(-1).pressed.connect(func(): Game.goto("menu"))
		return
	var title := UiKit.label("Vitória! As 6 medalhas são suas" if m.is_won() else "Fim de partida", "LightTitle")
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(title)
	var verse := UiKit.label("“Combati o bom combate, terminei a carreira, guardei a fé.” (2Tm 4,7)" if m.is_won() else "“Sede perseverantes na oração.” (Rm 12,12) Tente de novo!", "LightMuted")
	verse.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(verse)

	var medals := HBoxContainer.new()
	medals.alignment = BoxContainer.ALIGNMENT_CENTER
	medals.add_theme_constant_override("separation", 12)
	v.add_child(medals)
	for id in m.categories:
		var won := m.medals.has(id)
		medals.add_child(CategoryIcon.make(str(Content.category(id).symbol), Content.color(id).lightened(0.2) if won else Color(1, 1, 1, 0.2), 64))

	var card := UiKit.card(v, 12)
	card.add_child(UiKit.label("Medalhas: %d de %d" % [m.medals.size(), m.categories.size()], "QuestionLabel"))
	card.add_child(UiKit.label("Acertos: %d de %d (%d%%)" % [m.correct, m.answered, roundi(m.accuracy() * 100)]))
	card.add_child(UiKit.label("Maior sequência: %d" % m.best_streak))
	card.add_child(UiKit.label("Moedas ganhas: +%d" % m.coins_earned))
	for id in m.categories:
		var e: Dictionary = m.per_category.get(id, {})
		if e.is_empty():
			continue
		card.add_child(UiKit.label("%s: %d/%d" % [Content.category(id).name, e.correct, e.answered], "MutedLabel"))

	var again := UiKit.button("Jogar de novo", "PrimaryButton")
	again.name = "PlayAgain"
	again.pressed.connect(func(): Game.goto("match"))
	v.add_child(again)
	var menu := UiKit.button("Início", "GhostButton")
	menu.pressed.connect(func(): Game.goto("menu"))
	v.add_child(menu)
