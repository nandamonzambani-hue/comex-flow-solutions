extends Control
## Tabuleiro do canal: desenha as peças e gira a peça tocada.
## As peças por onde a água passa ficam azuis.

signal rotated

const GAP := 8.0
const DIRS := [[PipesPuzzle.N, Vector2(0, -1)], [PipesPuzzle.E, Vector2(1, 0)], [PipesPuzzle.S, Vector2(0, 1)], [PipesPuzzle.W, Vector2(-1, 0)]]

var puzzle: PipesPuzzle
var _spin := {} ## Vector2i -> ângulo restante da animação (graus)
var _side_space := 56.0


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	resized.connect(_update_min)
	_update_min()


func _update_min() -> void:
	var cell := _cell_size()
	custom_minimum_size.y = cell * puzzle.rows + GAP * (puzzle.rows - 1) + 56


func _cell_size() -> float:
	var w := maxf(size.x, 300.0) - _side_space * 2
	return minf((w - GAP * (puzzle.cols - 1)) / puzzle.cols, 132.0)


func _origin() -> Vector2:
	var cell := _cell_size()
	var board_w := cell * puzzle.cols + GAP * (puzzle.cols - 1)
	return Vector2((size.x - board_w) / 2.0, 8)


func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var cell := _cell_size()
		var local: Vector2 = event.position - _origin()
		var c := int(local.x / (cell + GAP))
		var r := int(local.y / (cell + GAP))
		if local.x < 0 or local.y < 0 or c >= puzzle.cols or r >= puzzle.rows:
			return
		accept_event()
		tap(r, c)


func tap(r: int, c: int) -> void:
	puzzle.rotate(r, c)
	var key := Vector2i(c, r)
	_spin[key] = -90.0
	var t := create_tween()
	t.tween_method(func(v: float):
		_spin[key] = v
		queue_redraw(), -90.0, 0.0, 0.14)
	queue_redraw()
	rotated.emit()


func _draw() -> void:
	var cell := _cell_size()
	var o := _origin()
	var wet := puzzle.wet_cells()
	var water := Color("4f93c9")
	var dry := Color("b39674")
	var tile_bg := Color("f3e6c8")
	var arm := cell * 0.22
	# entrada do riacho e chegada na horta
	var src_y := o.y + puzzle.source_row * (cell + GAP) + cell / 2
	var dst_y := o.y + puzzle.target_row * (cell + GAP) + cell / 2
	draw_line(Vector2(o.x - 40, src_y), Vector2(o.x, src_y), water, arm, true)
	draw_circle(Vector2(o.x - 40, src_y), arm * 1.2, water)
	var done := puzzle.is_solved()
	var end_x := o.x + puzzle.cols * (cell + GAP) - GAP
	draw_line(Vector2(end_x, dst_y), Vector2(end_x + 40, dst_y), water if done else dry, arm, true)
	draw_circle(Vector2(end_x + 40, dst_y), arm * 1.3, Color("5f8a4a"))
	var font := get_theme_default_font()
	var fs := int(GameManager.base_font_size() * 0.72)
	draw_string(font, Vector2(0, o.y + puzzle.rows * (cell + GAP) + 30), tr("SOURCE_LABEL"), HORIZONTAL_ALIGNMENT_LEFT, -1, fs, GameManager.COLORS.muted)
	draw_string(font, Vector2(size.x - 160, o.y + puzzle.rows * (cell + GAP) + 30), tr("TARGET_LABEL"), HORIZONTAL_ALIGNMENT_RIGHT, 160, fs, GameManager.COLORS.green)

	for r in puzzle.rows:
		for c in puzzle.cols:
			var pos := o + Vector2(c * (cell + GAP), r * (cell + GAP))
			var rect := Rect2(pos, Vector2(cell, cell))
			draw_style_box(_tile_box(tile_bg), rect)
			if puzzle.tile_type(r, c) == ".":
				continue
			var key := Vector2i(c, r)
			var is_wet := key in wet
			var color := water if is_wet else dry
			var center := rect.get_center()
			var angle := deg_to_rad(_spin.get(key, 0.0))
			var mask := puzzle.mask_at(r, c)
			for d in DIRS:
				if mask & d[0]:
					var tip: Vector2 = center + (d[1] * cell / 2.0).rotated(angle)
					draw_line(center, tip, color, arm, true)
			draw_circle(center, arm * 0.62, color)


func _tile_box(bg: Color) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.set_corner_radius_all(14)
	sb.border_color = Color("e2cfa6")
	sb.set_border_width_all(2)
	return sb
