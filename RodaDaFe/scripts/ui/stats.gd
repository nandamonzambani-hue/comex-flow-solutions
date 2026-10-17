extends Control
## Estatísticas do jogador por categoria.

func _ready() -> void:
	Game.background(self)
	var v := UiKit.page(self, 20)
	v.add_child(TopBar.make("Estatísticas", "menu"))
	var d: Dictionary = Player.data
	var card := UiKit.card(v, 10)
	card.add_child(UiKit.label("Partidas: %d   ·   Vitórias: %d" % [d.matches, d.wins], "QuestionLabel"))
	var acc := roundi(100.0 * float(d.correct) / float(d.answered)) if int(d.answered) > 0 else 0
	card.add_child(UiKit.label("Acertos: %d de %d (%d%%)" % [d.correct, d.answered, acc]))
	card.add_child(UiKit.label("Maior sequência: %d   ·   Medalhas ganhas: %d" % [d.best_streak, d.medals_total]))

	var per := UiKit.card(v, 14)
	per.add_child(UiKit.label("Por categoria", "QuestionLabel"))
	for c in Content.categories:
		var e: Dictionary = d.per_category.get(c.id, {"answered": 0, "correct": 0})
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 12)
		row.add_child(CategoryIcon.make(str(c.symbol), Content.color(c.id), 40))
		var col := VBoxContainer.new()
		col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var pct := 100.0 * float(e.correct) / float(e.answered) if int(e.answered) > 0 else 0.0
		col.add_child(UiKit.label("%s — %d/%d" % [c.name, e.correct, e.answered]))
		var bar := ProgressBar.new()
		bar.show_percentage = false
		bar.custom_minimum_size.y = 12
		bar.value = pct
		var fill := StyleBoxFlat.new()
		fill.bg_color = Content.color(c.id)
		fill.set_corner_radius_all(6)
		bar.add_theme_stylebox_override("fill", fill)
		col.add_child(bar)
		row.add_child(col)
		per.add_child(row)

	var reset := UiKit.button("Apagar meu progresso", "GhostButton")
	reset.pressed.connect(func():
		var dv := UiKit.overlay(self, 560)
		dv.add_child(UiKit.label("Apagar tudo?", "TitleLabel"))
		dv.add_child(UiKit.label("Moedas e estatísticas voltam ao início. Compras podem ser restauradas na loja.", "MutedLabel"))
		var yes := UiKit.button("Apagar", "PrimaryButton")
		yes.pressed.connect(func():
			Player.reset()
			Game.goto("menu"))
		dv.add_child(yes)
		var no := UiKit.button("Cancelar", "CardButton")
		no.pressed.connect(func(): dv.get_meta("overlay").queue_free())
		dv.add_child(no))
	v.add_child(reset)
