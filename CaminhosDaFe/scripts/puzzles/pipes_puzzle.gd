class_name PipesPuzzle
extends RefCounted
## Desafio de SERVIÇO: girar as peças do canal para levar a água do riacho até a horta.
##
## Cada peça tem aberturas codificadas em bits: N=1, L(este)=2, S=4, O(oeste)=8.
## Tipos: "I" reta (N+S), "L" curva (N+L), "T" (N+L+S), "X" cruz, "." vazio.
## Girar 1 vez = 90° no sentido horário.
##
## Formato dos dados:
## {
##   "tiles":     ["LTIL", ...],          uma string por linha
##   "rotations": ["2010", ...],          giro inicial de cada peça (0–3)
##   "solution":  ["2010", ...],          um giro que resolve (usado nos testes)
##   "source_row": 0,                     a água entra pela esquerda nesta linha
##   "target_row": 3                      a horta fica à direita desta linha
## }

const N := 1
const E := 2
const S := 4
const W := 8
const BASE := {"I": N | S, "L": N | E, "T": N | E | S, "X": N | E | S | W, ".": 0}

var tiles: Array = []
var rotations: Array = []
var source_row := 0
var target_row := 0
var rows := 0
var cols := 0


static func validate(data: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	for key in ["tiles", "rotations", "solution", "source_row", "target_row"]:
		if not data.has(key):
			errors.append("falta o campo '%s'" % key)
	if not errors.is_empty():
		return errors
	var r: int = data.tiles.size()
	if r == 0:
		return ["'tiles' está vazio"]
	var c: int = String(data.tiles[0]).length()
	for grid_key in ["tiles", "rotations", "solution"]:
		var grid: Array = data[grid_key]
		if grid.size() != r:
			errors.append("'%s' deve ter %d linhas" % [grid_key, r])
			continue
		for line in grid:
			if String(line).length() != c:
				errors.append("todas as linhas de '%s' devem ter %d colunas" % [grid_key, c])
	for line in data.tiles:
		for ch in String(line):
			if not BASE.has(ch):
				errors.append("tipo de peça desconhecido '%s'" % ch)
	if int(data.source_row) < 0 or int(data.source_row) >= r or int(data.target_row) < 0 or int(data.target_row) >= r:
		errors.append("'source_row' e 'target_row' devem estar entre 0 e %d" % (r - 1))
	if errors.is_empty():
		var p := PipesPuzzle.from_data(data)
		if p.is_solved():
			errors.append("o giro inicial já resolve o desafio")
		p.rotations = _parse_rotations(data.solution)
		if not p.is_solved():
			errors.append("a 'solution' informada não leva a água até a horta")
	return errors


static func from_data(data: Dictionary) -> PipesPuzzle:
	var p := PipesPuzzle.new()
	p.tiles = data.tiles
	p.rotations = _parse_rotations(data.rotations)
	p.source_row = int(data.source_row)
	p.target_row = int(data.target_row)
	p.rows = p.tiles.size()
	p.cols = String(p.tiles[0]).length()
	return p


static func _parse_rotations(lines: Array) -> Array:
	var grid := []
	for line in lines:
		var row := []
		for ch in String(line):
			row.append(int(ch) % 4)
		grid.append(row)
	return grid


static func rotate_mask(mask: int, times: int) -> int:
	for i in times % 4:
		mask = ((mask << 1) | (mask >> 3)) & 15
	return mask


func tile_type(r: int, c: int) -> String:
	return String(tiles[r])[c]


func mask_at(r: int, c: int) -> int:
	return rotate_mask(BASE[tile_type(r, c)], rotations[r][c])


func rotate(r: int, c: int) -> void:
	if tile_type(r, c) != ".":
		rotations[r][c] = (rotations[r][c] + 1) % 4


## Células por onde a água passa, a partir da entrada à esquerda.
func wet_cells() -> Array[Vector2i]:
	var result: Array[Vector2i] = []
	if not (mask_at(source_row, 0) & W):
		return result
	var queue: Array[Vector2i] = [Vector2i(0, source_row)]
	var seen := {Vector2i(0, source_row): true}
	var dirs := [[N, Vector2i(0, -1), S], [E, Vector2i(1, 0), W], [S, Vector2i(0, 1), N], [W, Vector2i(-1, 0), E]]
	while not queue.is_empty():
		var cell: Vector2i = queue.pop_front()
		result.append(cell)
		var m := mask_at(cell.y, cell.x)
		for d in dirs:
			if not (m & d[0]):
				continue
			var nxt: Vector2i = cell + d[1]
			if nxt.x < 0 or nxt.y < 0 or nxt.x >= cols or nxt.y >= rows or seen.has(nxt):
				continue
			if mask_at(nxt.y, nxt.x) & d[2]:
				seen[nxt] = true
				queue.append(nxt)
	return result


func is_solved() -> bool:
	var target := Vector2i(cols - 1, target_row)
	return target in wet_cells() and bool(mask_at(target_row, cols - 1) & E)
