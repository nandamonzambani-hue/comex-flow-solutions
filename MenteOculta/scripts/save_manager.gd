extends Node
## Grava e lê o progresso do jogador num arquivo JSON local (user://).
## Não envia nada para a internet.
##
## A gravação é feita primeiro num arquivo temporário e só depois substitui o
## arquivo final, para que um app fechado no meio da gravação não corrompa o save.

const SAVE_VERSION := 1
const DEFAULT_PATH := "user://mente_oculta_save.json"

var save_path := DEFAULT_PATH
var last_error := ""


func save_data(data: Dictionary) -> bool:
	var payload := data.duplicate(true)
	payload["save_version"] = SAVE_VERSION
	var tmp_path := save_path + ".tmp"
	var file := FileAccess.open(tmp_path, FileAccess.WRITE)
	if file == null:
		last_error = "Não foi possível gravar o progresso (%s)." % error_string(FileAccess.get_open_error())
		push_warning(last_error)
		return false
	file.store_string(JSON.stringify(payload, "\t"))
	file.close()
	var err := DirAccess.rename_absolute(tmp_path, save_path)
	if err != OK:
		last_error = "Não foi possível finalizar a gravação (%s)." % error_string(err)
		push_warning(last_error)
		return false
	last_error = ""
	return true


## Retorna o progresso salvo, ou um dicionário vazio se não houver save válido.
## Um arquivo corrompido é renomeado para .bak (para não se perder) e o jogo recomeça limpo.
func load_data() -> Dictionary:
	if not FileAccess.file_exists(save_path):
		return {}
	var text := FileAccess.get_file_as_string(save_path)
	var parsed = JSON.parse_string(text)
	if typeof(parsed) != TYPE_DICTIONARY:
		last_error = "O arquivo de progresso estava danificado e foi reiniciado."
		push_warning(last_error)
		DirAccess.rename_absolute(save_path, save_path + ".bak")
		return {}
	var version := int(parsed.get("save_version", 0))
	if version > SAVE_VERSION:
		last_error = "Progresso salvo por uma versão mais nova do jogo."
		push_warning(last_error)
		return {}
	return _migrate(parsed, version)


func delete_save() -> void:
	if FileAccess.file_exists(save_path):
		DirAccess.remove_absolute(save_path)


## Ponto único para adaptar saves antigos quando o formato mudar.
func _migrate(data: Dictionary, _from_version: int) -> Dictionary:
	return data
