class_name Wheel
extends Control
## A roda: uma fatia por categoria + a fatia "Coroa". O sorteio é feito pela
## lógica (MatchState.spin); a roda só anima até parar na fatia sorteada.

signal stopped(segment: String)

var segments: Array[String] = []
var angle := 0.0 ## rotação atual (radianos)
var spinning := false


func _ready() -> void:
	custom_minimum_size = Vector2(560, 560)
	mouse_filter = Control.MOUSE_FILTER_IGNORE


func set_segments(ids: Array[String]) -> void:
	segments = ids
	queue_redraw()


## Gira e para com o ponteiro (no topo) no meio da fatia indicada.
func spin_to(segment: String, instant := false) -> void:
	var idx := segments.find(segment)
	if idx < 0:
		return
	var slice := TAU / segments.size()
	# fatia idx ocupa [idx*slice, (idx+1)*slice] a partir do topo, no sentido horário
	var target := -(idx + 0.5) * slice
	# pelo menos 5 voltas completas no sentido horário até cair no alvo
	var final := target + ceilf((angle + 5.0 * TAU - target) / TAU) * TAU
	if instant:
		angle = target
		queue_redraw()
		stopped.emit(segment)
		return
	spinning = true
	var t := create_tween()
	t.tween_method(_set_angle, angle, final, 2.6).set_trans(Tween.TRANS_QUART).set_ease(Tween.EASE_OUT)
	await t.finished
	angle = fmod(final, TAU)
	spinning = false
	queue_redraw()
	stopped.emit(segment)


func _set_angle(a: float) -> void:
	angle = a
	queue_redraw()


func _draw() -> void:
	if segments.is_empty():
		return
	var c := size / 2.0
	var r := minf(size.x, size.y) / 2.0 - 12.0
	var slice := TAU / segments.size()
	draw_circle(c, r + 12.0, Game.COLORS.gold)
	for i in segments.size():
		var start := angle + i * slice - PI / 2.0
		var pts := PackedVector2Array([c])
		for k in 25:
			var a := start + slice * k / 24.0
			pts.append(c + Vector2(cos(a), sin(a)) * r)
		var col := Content.color(segments[i])
		draw_colored_polygon(pts, col)
		draw_line(c, c + Vector2(cos(start), sin(start)) * r, Color(1, 1, 1, 0.85), 4.0, true)
		# ícone e nome no meio da fatia
		var mid := start + slice / 2.0
		var icon_pos := c + Vector2(cos(mid), sin(mid)) * r * 0.73
		_draw_symbol(segments[i], icon_pos, r * 0.155, mid)
		var label := str(Content.category(segments[i]).get("short", ""))
		draw_set_transform(c + Vector2(cos(mid), sin(mid)) * r * 0.37, mid, Vector2.ONE)
		var font := Game.font_bold
		var fs := 19
		var tw := font.get_string_size(label, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
		draw_string(font, Vector2(-tw / 2.0, fs * 0.35), label, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color.WHITE)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	draw_circle(c, r * 0.16, Game.COLORS.night)
	draw_circle(c, r * 0.12, Game.COLORS.gold)
	# ponteiro no topo
	draw_colored_polygon(PackedVector2Array([c + Vector2(-26, -r - 30), c + Vector2(26, -r - 30), c + Vector2(0, -r + 22)]), Game.COLORS.light)
	draw_polyline(PackedVector2Array([c + Vector2(-26, -r - 30), c + Vector2(26, -r - 30), c + Vector2(0, -r + 22), c + Vector2(-26, -r - 30)]), Game.COLORS.night, 4.0, true)


func _draw_symbol(id: String, pos: Vector2, half: float, rot: float) -> void:
	draw_circle(pos, half * 1.25, Color(1, 1, 1, 0.2))
	draw_set_transform(pos, rot + PI / 2.0, Vector2.ONE)
	CategoryIcon.paint(self, str(Content.category(id).get("symbol", "")), Vector2(-half * 0.8, -half * 0.8), half * 1.6, Color.WHITE)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
