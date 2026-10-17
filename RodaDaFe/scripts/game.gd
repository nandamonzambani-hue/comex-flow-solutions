extends Node
## Coordena telas e visual (tema). Autoload: qualquer cena chama Game.goto(...).

const SCENES := {
	"menu": "res://scenes/main_menu.tscn",
	"match": "res://scenes/match.tscn",
	"result": "res://scenes/result.tscn",
	"shop": "res://scenes/shop.tscn",
	"stats": "res://scenes/stats.tscn",
}

## Paleta: noite de vitral (roxo profundo), ouro de cálice e as cores das categorias.
const COLORS := {
	"night": Color("21142f"),
	"night_2": Color("2e1d44"),
	"card": Color("fffaf2"),
	"ink": Color("2a1f33"),
	"muted": Color("7d6f88"),
	"light": Color("fdf6ff"),
	"light_muted": Color("cbb9de"),
	"gold": Color("f2c94c"),
	"gold_dark": Color("c99a1d"),
	"right": Color("2f9e5b"),
	"wrong": Color("c8433b"),
	"line": Color("e8dcef"),
}

var font_body: Font = preload("res://assets/fonts/nunito-latin-400-normal.woff2")
var font_bold: Font = preload("res://assets/fonts/nunito-latin-800-normal.woff2")
var font_display: Font = preload("res://assets/fonts/alegreya-latin-800-normal.woff2")

## Resultado da última partida (lido pela tela de resultado).
var last_match: MatchState

var _fade: ColorRect
var _busy := false


func _ready() -> void:
	apply_theme()
	var layer := CanvasLayer.new()
	layer.layer = 100
	add_child(layer)
	_fade = ColorRect.new()
	_fade.color = COLORS.night
	_fade.set_anchors_preset(Control.PRESET_FULL_RECT)
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_fade.modulate.a = 0.0
	layer.add_child(_fade)


func goto(key: String) -> void:
	if _busy:
		return
	_busy = true
	_fade.mouse_filter = Control.MOUSE_FILTER_STOP
	var t := create_tween()
	t.tween_property(_fade, "modulate:a", 1.0, 0.15)
	await t.finished
	get_tree().change_scene_to_file(SCENES[key])
	await get_tree().process_frame
	var t2 := create_tween()
	t2.tween_property(_fade, "modulate:a", 0.0, 0.18)
	await t2.finished
	_fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_busy = false


func apply_theme() -> void:
	var th := Theme.new()
	th.default_font = font_body
	th.default_font_size = 26
	th.set_color("font_color", "Label", COLORS.ink)

	var styles := {
		"PrimaryButton": [COLORS.gold, COLORS.ink, COLORS.gold_dark],
		"GhostButton": [Color(1, 1, 1, 0.08), COLORS.light, Color(1, 1, 1, 0.35)],
		"CardButton": [COLORS.card, COLORS.ink, COLORS.line],
	}
	for variation in styles:
		var bg: Color = styles[variation][0]
		var fg: Color = styles[variation][1]
		var border: Color = styles[variation][2]
		th.set_type_variation(variation, "Button")
		th.set_stylebox("normal", variation, _box(bg, 22, border, 3))
		th.set_stylebox("hover", variation, _box(bg.lightened(0.06), 22, border, 3))
		th.set_stylebox("pressed", variation, _box(bg.darkened(0.08), 22, border, 3))
		th.set_stylebox("disabled", variation, _box(Color(bg, bg.a * 0.45), 22, Color(border, 0.4), 3))
		th.set_stylebox("focus", variation, _box(Color(0, 0, 0, 0), 22, COLORS.gold, 4))
		for state in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color"]:
			th.set_color(state, variation, fg)
		th.set_color("font_disabled_color", variation, Color(fg, 0.5))
		th.set_font("font", variation, font_bold)
		th.set_font_size("font_size", variation, 28)

	th.set_type_variation("TitleLabel", "Label")
	th.set_font("font", "TitleLabel", font_display)
	th.set_font_size("font_size", "TitleLabel", 44)
	th.set_color("font_color", "TitleLabel", COLORS.ink)

	th.set_type_variation("LightTitle", "Label")
	th.set_font("font", "LightTitle", font_display)
	th.set_font_size("font_size", "LightTitle", 46)
	th.set_color("font_color", "LightTitle", COLORS.light)

	th.set_type_variation("LightLabel", "Label")
	th.set_color("font_color", "LightLabel", COLORS.light)

	th.set_type_variation("LightMuted", "Label")
	th.set_color("font_color", "LightMuted", COLORS.light_muted)
	th.set_font_size("font_size", "LightMuted", 22)

	th.set_type_variation("MutedLabel", "Label")
	th.set_color("font_color", "MutedLabel", COLORS.muted)
	th.set_font_size("font_size", "MutedLabel", 22)

	th.set_type_variation("QuestionLabel", "Label")
	th.set_font("font", "QuestionLabel", font_bold)
	th.set_font_size("font_size", "QuestionLabel", 32)
	th.set_color("font_color", "QuestionLabel", COLORS.ink)

	th.set_type_variation("BadgeLabel", "Label")
	th.set_font("font", "BadgeLabel", font_bold)
	th.set_font_size("font_size", "BadgeLabel", 18)
	th.set_color("font_color", "BadgeLabel", COLORS.ink)

	th.set_type_variation("CardPanel", "PanelContainer")
	th.set_stylebox("panel", "CardPanel", _box(COLORS.card, 28, COLORS.line, 0, 28))
	th.set_type_variation("BadgePanel", "PanelContainer")
	th.set_stylebox("panel", "BadgePanel", _box(COLORS.gold, 14, COLORS.gold, 0, 8))
	th.set_type_variation("DarkPanel", "PanelContainer")
	th.set_stylebox("panel", "DarkPanel", _box(COLORS.night_2, 24, Color(1, 1, 1, 0.08), 2, 20))

	var bar_bg := _box(Color(0, 0, 0, 0.12), 8, Color(0, 0, 0, 0), 0, 0)
	th.set_stylebox("background", "ProgressBar", bar_bg)
	th.set_stylebox("fill", "ProgressBar", _box(COLORS.gold, 8, Color(0, 0, 0, 0), 0, 0))
	th.set_font_size("font_size", "ProgressBar", 1)
	get_tree().root.theme = th


func _box(bg: Color, radius: int, border: Color, border_width: int, padding := 18) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.set_corner_radius_all(radius)
	s.border_color = border
	s.set_border_width_all(border_width)
	s.content_margin_left = padding + 6
	s.content_margin_right = padding + 6
	s.content_margin_top = padding
	s.content_margin_bottom = padding
	s.anti_aliasing = true
	return s


## Fundo noturno com brilho suave (usado em todas as telas).
func background(parent: Control) -> void:
	var bg := ColorRect.new()
	bg.color = COLORS.night
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(bg)
	parent.move_child(bg, 0)
