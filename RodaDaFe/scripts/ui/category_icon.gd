class_name CategoryIcon
extends Control
## Ícone desenhado (sem imagem) de cada categoria: livro, cruz, auréola,
## cálice, coluna, pomba e coroa. Fica nítido em qualquer tamanho.

var symbol := "book"
var color := Color.WHITE


static func make(symbol_name: String, icon_color: Color, size_px: int) -> CategoryIcon:
	var i := CategoryIcon.new()
	i.symbol = symbol_name
	i.color = icon_color
	i.custom_minimum_size = Vector2(size_px, size_px)
	i.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return i


func _draw() -> void:
	var s := minf(size.x, size.y)
	paint(self, symbol, (size - Vector2(s, s)) / 2.0, s, color)


## Desenha o símbolo num quadrado de lado s com canto superior esquerdo em o.
## Estático para a roda reaproveitar o mesmo desenho.
static func paint(ci: CanvasItem, symbol_name: String, o: Vector2, s: float, color: Color) -> void:
	var w := maxf(2.0, s * 0.07)
	var p := func(x: float, y: float) -> Vector2: return o + Vector2(x * s, y * s)
	match symbol_name:
		"book":
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.1, 0.25), p.call(0.48, 0.32), p.call(0.48, 0.85), p.call(0.1, 0.78)]), color)
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.52, 0.32), p.call(0.9, 0.25), p.call(0.9, 0.78), p.call(0.52, 0.85)]), color)
		"cross":
			ci.draw_rect(Rect2(p.call(0.42, 0.08), Vector2(0.16, 0.84) * s), color)
			ci.draw_rect(Rect2(p.call(0.18, 0.3), Vector2(0.64, 0.16) * s), color)
		"halo":
			ci.draw_arc(p.call(0.5, 0.22), s * 0.26, 0, TAU, 40, color, w)
			ci.draw_circle(p.call(0.5, 0.55), s * 0.17, color)
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.22, 0.95), p.call(0.3, 0.72), p.call(0.7, 0.72), p.call(0.78, 0.95)]), color)
		"chalice":
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.2, 0.12), p.call(0.8, 0.12), p.call(0.7, 0.42), p.call(0.5, 0.52), p.call(0.3, 0.42)]), color)
			ci.draw_rect(Rect2(p.call(0.45, 0.5), Vector2(0.1, 0.3) * s), color)
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.25, 0.92), p.call(0.35, 0.78), p.call(0.65, 0.78), p.call(0.75, 0.92)]), color)
		"column":
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.12, 0.25), p.call(0.5, 0.06), p.call(0.88, 0.25)]), color)
			for x in [0.2, 0.42, 0.64]:
				ci.draw_rect(Rect2(p.call(x, 0.32), Vector2(0.14, 0.5) * s), color)
			ci.draw_rect(Rect2(p.call(0.1, 0.85), Vector2(0.8, 0.09) * s), color)
		"dove":
			ci.draw_circle(p.call(0.42, 0.55), s * 0.2, color)
			ci.draw_circle(p.call(0.68, 0.38), s * 0.11, color)
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.78, 0.36), p.call(0.95, 0.4), p.call(0.78, 0.45)]), color)
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.3, 0.5), p.call(0.05, 0.2), p.call(0.55, 0.45)]), color)
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.25, 0.62), p.call(0.05, 0.8), p.call(0.35, 0.72)]), color)
		"heart":
			ci.draw_circle(p.call(0.32, 0.36), s * 0.2, color)
			ci.draw_circle(p.call(0.68, 0.36), s * 0.2, color)
			ci.draw_colored_polygon(PackedVector2Array([p.call(0.13, 0.45), p.call(0.87, 0.45), p.call(0.5, 0.9)]), color)
		"coin":
			ci.draw_circle(p.call(0.5, 0.5), s * 0.42, color)
			ci.draw_arc(p.call(0.5, 0.5), s * 0.3, 0, TAU, 32, color.darkened(0.25), w)
		"crown":
			ci.draw_colored_polygon(PackedVector2Array([
				p.call(0.1, 0.78), p.call(0.1, 0.3), p.call(0.3, 0.52), p.call(0.5, 0.18),
				p.call(0.7, 0.52), p.call(0.9, 0.3), p.call(0.9, 0.78)]), color)
			ci.draw_rect(Rect2(p.call(0.1, 0.82), Vector2(0.8, 0.1) * s), color)
