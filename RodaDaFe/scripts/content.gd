extends Node
## Carrega categorias e perguntas da pasta data/ e sorteia perguntas.
## Todo o conteúdo fica em JSON: para corrigir ou acrescentar perguntas não é
## preciso mexer em código (ver docs/conteudo.md).

const CATEGORIES_PATH := "res://data/categories.json"
const QUESTIONS_DIR := "res://data/questions/"
const SHOP_PATH := "res://data/shop.json"

var categories: Array = []
var crown: Dictionary = {}
var questions: Array = [] ## todas, já com o campo "pack" ("" = gratuita)
var shop: Dictionary = {}
var errors: Array[String] = []


func _ready() -> void:
	reload()


func reload() -> void:
	var cats: Dictionary = _read_json(CATEGORIES_PATH)
	categories = cats.get("categories", [])
	crown = cats.get("crown", {})
	shop = _read_json(SHOP_PATH)
	questions = []
	var files := DirAccess.get_files_at(QUESTIONS_DIR)
	files.sort()
	for f in files:
		if not f.ends_with(".json"):
			continue
		var data: Dictionary = _read_json(QUESTIONS_DIR + f)
		var pack := str(data.get("pack", ""))
		for q in data.get("questions", []):
			q["pack"] = pack
			questions.append(q)
	errors = ContentValidator.validate(categories, questions)
	for e in errors:
		push_warning("Conteúdo: " + e)


func category_ids() -> Array[String]:
	var ids: Array[String] = []
	for c in categories:
		ids.append(c.id)
	return ids


func category(id: String) -> Dictionary:
	for c in categories:
		if c.id == id:
			return c
	if id == QuizRules.CROWN_SEGMENT:
		return {"id": id, "name": crown.get("name", "Coroa"), "short": crown.get("name", "Coroa"), "color": crown.get("color", "f2c94c"), "symbol": "crown"}
	return {}


func color(id: String) -> Color:
	return Color(str(category(id).get("color", "888888")))


## Perguntas disponíveis para o jogador (gratuitas + pacotes comprados).
func pool(category_id: String, owned_packs: Array) -> Array:
	return questions.filter(func(q): return q.category == category_id and (q.pack == "" or owned_packs.has(q.pack)))


## Sorteia uma pergunta da categoria evitando as já feitas na partida.
## Para a coroa, prefere as mais difíceis (dificuldade 2 ou 3).
func pick(category_id: String, owned_packs: Array, exclude: Dictionary, rng: RandomNumberGenerator, for_crown := false) -> Dictionary:
	var candidates := pool(category_id, owned_packs).filter(func(q): return not exclude.has(q.id))
	if for_crown:
		var hard := candidates.filter(func(q): return int(q.difficulty) >= 2)
		if not hard.is_empty():
			candidates = hard
	if candidates.is_empty():
		candidates = pool(category_id, owned_packs) # acabou o banco: pode repetir
	if candidates.is_empty():
		return {}
	return candidates[rng.randi_range(0, candidates.size() - 1)]


func product(id: String) -> Dictionary:
	for p in shop.get("products", []):
		if p.id == id:
			return p
	return {}


func _read_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		errors.append("arquivo não encontrado: " + path)
		return {}
	var parsed = JSON.parse_string(FileAccess.get_file_as_string(path))
	if typeof(parsed) != TYPE_DICTIONARY:
		errors.append("JSON inválido: " + path)
		return {}
	return parsed
