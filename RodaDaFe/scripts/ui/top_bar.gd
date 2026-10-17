class_name TopBar
extends HBoxContainer
## Barra superior com o saldo de moedas (atualiza sozinha).

var coins_label: Label


static func make(title := "", back_to := "") -> TopBar:
	var bar := TopBar.new()
	bar.add_theme_constant_override("separation", 14)
	if back_to != "":
		var back := UiKit.button("‹ Voltar", "GhostButton")
		back.custom_minimum_size = Vector2(170, 72)
		back.pressed.connect(func(): Game.goto(back_to))
		bar.add_child(back)
	if title != "":
		var t := UiKit.label(title, "LightTitle", false)
		t.add_theme_font_size_override("font_size", 36)
		t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		t.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		bar.add_child(t)
	else:
		var fill := Control.new()
		fill.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		bar.add_child(fill)
	bar.add_child(CategoryIcon.make("coin", Game.COLORS.gold, 40))
	bar.coins_label = UiKit.label(str(Player.coins()), "LightLabel", false)
	bar.coins_label.add_theme_font_override("font", Game.font_bold)
	bar.coins_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	bar.add_child(bar.coins_label)
	Player.coins_changed.connect(bar._on_coins)
	return bar


func _on_coins(total: int) -> void:
	if is_instance_valid(coins_label):
		coins_label.text = str(total)
