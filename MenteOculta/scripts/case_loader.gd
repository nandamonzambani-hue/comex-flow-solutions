extends Node
## Lê os casos da pasta data/ e valida antes do uso.
## Tradução: se existir data/i18n/<idioma>/case_00N.json, ele substitui o arquivo em português.

const DATA_DIR := "res://data/"
const INDEX := "res://data/cases.json"

var last_errors: Array[String] = []


func case_index() -> Array:
	var data := read_json(INDEX)
	return data.get("cases", [])


## Retorna o caso validado, ou {} com last_errors preenchido.
func load_case(entry: Dictionary, locale := "") -> Dictionary:
	last_errors.clear()
	var file: String = entry.get("file", "")
	var data := {}
	var lang := locale.get_slice("_", 0)
	for candidate in [locale, lang]:
		if candidate != "" and not candidate.begins_with("pt"):
			var path := "%si18n/%s/%s" % [DATA_DIR, candidate, file]
			if FileAccess.file_exists(path):
				data = read_json(path)
				break
	if data.is_empty():
		data = read_json(DATA_DIR + file)
	if data.is_empty():
		last_errors.append("Arquivo do caso ausente ou com JSON inválido: %s (veja o console)." % file)
		return {}
	last_errors.append_array(CaseValidator.validate(data))
	if not last_errors.is_empty():
		for e in last_errors:
			push_error("[caso] " + e)
		return {}
	return data


static func read_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		push_error("Arquivo não encontrado: " + path)
		return {}
	var json := JSON.new()
	if json.parse(FileAccess.get_file_as_string(path)) != OK:
		push_error("JSON inválido em %s, linha %d: %s" % [path, json.get_error_line(), json.get_error_message()])
		return {}
	if typeof(json.data) != TYPE_DICTIONARY:
		push_error("%s deve conter um objeto JSON" % path)
		return {}
	return json.data
