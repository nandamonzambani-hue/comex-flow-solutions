extends Node
## Lê os capítulos, perguntas e fontes da pasta data/ e valida tudo antes do uso.
##
## Tradução do conteúdo: se existir data/i18n/<idioma>/<arquivo>.json, ele substitui
## o arquivo em português. Assim um capítulo novo ou traduzido não exige mudar código.

const DATA_DIR := "res://data/"
const CHAPTER_INDEX := "res://data/chapters.json"
const SOURCES_FILE := "sources.json"

var last_errors: Array[String] = []
var _sources: Dictionary = {}


## Lista de capítulos para o mapa (inclui os que ainda virão).
func chapter_index() -> Array:
	var data := read_json(CHAPTER_INDEX)
	if data.is_empty() or typeof(data.get("chapters")) != TYPE_ARRAY:
		push_error("chapters.json ausente ou inválido")
		return []
	return data.chapters


## Carrega um capítulo completo e já validado. Em caso de erro, retorna {} e
## preenche last_errors com mensagens legíveis.
func load_chapter(entry: Dictionary, locale := "") -> Dictionary:
	last_errors.clear()
	var sources := read_localized(SOURCES_FILE, locale)
	last_errors.append_array(ContentValidator.validate_sources(sources))
	var questions := read_localized(entry.get("questions_file", ""), locale)
	var chapter := read_localized(entry.get("file", ""), locale)
	if sources.is_empty() or questions.is_empty() or chapter.is_empty():
		last_errors.append("Arquivo de conteúdo ausente ou com JSON inválido (veja o console).")
		return {}
	var source_ids := []
	for s in sources.get("sources", []):
		source_ids.append(s.get("id"))
	last_errors.append_array(ContentValidator.validate_questions(questions, source_ids))
	var question_ids := []
	for q in questions.get("questions", []):
		question_ids.append(q.get("id"))
	last_errors.append_array(ContentValidator.validate_chapter(chapter, question_ids, source_ids))
	if not last_errors.is_empty():
		for e in last_errors:
			push_error("[conteúdo] " + e)
		return {}

	var by_id := {}
	for q in questions.questions:
		by_id[q.id] = q
	chapter["questions"] = by_id
	_sources = {}
	for s in sources.sources:
		_sources[s.id] = s
	return chapter


func source(id: String) -> Dictionary:
	return _sources.get(id, {})


func read_localized(file_name: String, locale: String) -> Dictionary:
	if file_name == "":
		return {}
	var lang := locale.get_slice("_", 0)
	for candidate in [locale, lang]:
		if candidate != "" and candidate != "pt" and candidate != "pt_BR":
			var path := "%si18n/%s/%s" % [DATA_DIR, candidate, file_name]
			if FileAccess.file_exists(path):
				return read_json(path)
	return read_json(DATA_DIR + file_name)


static func read_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		push_error("Arquivo não encontrado: " + path)
		return {}
	var json := JSON.new()
	var err := json.parse(FileAccess.get_file_as_string(path))
	if err != OK:
		push_error("JSON inválido em %s, linha %d: %s" % [path, json.get_error_line(), json.get_error_message()])
		return {}
	if typeof(json.data) != TYPE_DICTIONARY:
		push_error("%s deve conter um objeto JSON" % path)
		return {}
	return json.data
