extends Control
## Tela inicial: jogar, loja, estatísticas e a roda girando devagar ao fundo.

var wheel: Wheel


func _ready() -> void:
	Game.background(self)
	var v := UiKit.page(self, 26)
	v.add_child(TopBar.make())

	var title := UiKit.label("Roda da Fé", "LightTitle")
	title.add_theme_font_size_override("font_size", 76)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(title)
	var sub := UiKit.label("Gire a roda, responda e junte as 6 medalhas: Bíblia, Doutrina, Santos, Liturgia, História e Oração.", "LightMuted")
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(sub)

	var center := CenterContainer.new()
	v.add_child(center)
	wheel = Wheel.new()
	wheel.custom_minimum_size = Vector2(500, 500)
	center.add_child(wheel)
	wheel.set_segments(_segments())

	var play := UiKit.button("Jogar", "PrimaryButton")
	play.name = "PlayButton"
	play.add_theme_font_size_override("font_size", 36)
	play.custom_minimum_size.y = 104
	play.pressed.connect(func(): Game.goto("match"))
	v.add_child(play)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 16)
	v.add_child(row)
	for item in [["Loja", "shop"], ["Minhas estatísticas", "stats"]]:
		var b := UiKit.button(item[0], "GhostButton")
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var key: String = item[1]
		b.pressed.connect(func(): Game.goto(key))
		row.add_child(b)

	if Monetization.is_simulated():
		var note := UiKit.label("Versão de teste: anúncios e compras são simulados.", "LightMuted")
		note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		v.add_child(note)

	var disclaimer := UiKit.label("Projeto independente, sem aprovação oficial da Igreja. As respostas citam a Bíblia, o Catecismo e outras fontes.", "LightMuted")
	disclaimer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	disclaimer.add_theme_font_size_override("font_size", 18)
	v.add_child(disclaimer)


func _segments() -> Array[String]:
	var s: Array[String] = Content.category_ids()
	s.append(QuizRules.CROWN_SEGMENT)
	return s


func _process(delta: float) -> void:
	if wheel and not wheel.spinning:
		wheel._set_angle(wheel.angle + delta * 0.15)
