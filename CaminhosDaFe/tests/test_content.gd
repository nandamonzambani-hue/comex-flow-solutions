extends RefCounted
## Confere que TODO o conteúdo em data/ é válido: perguntas, fontes, capítulos e desafios.

var runner


func _load_chapter(entry: Dictionary) -> Dictionary:
	var loader = load("res://scripts/content_loader.gd").new()
	var chapter: Dictionary = loader.load_chapter(entry)
	for e in loader.last_errors:
		runner.check(false, "%s: %s" % [entry.id, e])
	loader.free()
	return chapter


func _index() -> Array:
	var data: Dictionary = load("res://scripts/content_loader.gd").read_json("res://data/chapters.json")
	return data.get("chapters", [])


func test_chapter_index_is_valid() -> void:
	var chapters := _index()
	runner.check(chapters.size() >= 1, "chapters.json deve listar pelo menos um capítulo")
	var ids := []
	for c in chapters:
		runner.check(not c.id in ids, "id de capítulo repetido: " + c.id)
		ids.append(c.id)
		runner.check(c.status in ["available", "coming_soon"], "status inválido em " + c.id)


func test_every_available_chapter_loads_without_errors() -> void:
	for entry in _index():
		if entry.status == "available":
			var chapter := _load_chapter(entry)
			runner.check(not chapter.is_empty(), "o capítulo %s não carregou" % entry.id)


func test_chapter_one_meets_mvp_scope() -> void:
	var chapter := _load_chapter(_index()[0])
	runner.check_eq(chapter.challenges.size(), 3, "o capítulo 1 deve ter 3 desafios")
	runner.check_eq(chapter.questions.size(), 5, "o capítulo 1 deve ter 5 perguntas")
	var types := []
	for c in chapter.challenges.values():
		types.append(c.type)
	runner.check(types.has("assignment") and types.has("distribution") and types.has("pipes"), "os 3 desafios devem ser de tipos diferentes")
	runner.check(chapter.choices.size() >= 1, "deve haver ao menos uma escolha narrativa")
	var saint := false
	for d in chapter.diary:
		if d.kind == "saint":
			saint = true
	runner.check(saint, "o diário deve ter a seção sobre o santo")


func test_validator_catches_broken_question() -> void:
	var bad := {"questions": [{"id": "x", "prompt": "?", "options": ["a", "b"], "answer": 5, "explanation": "e", "sources": ["nao_existe"]}]}
	var errors := ContentValidator.validate_questions(bad, ["ccc"])
	runner.check(errors.size() >= 2, "deveria acusar resposta fora das opções e fonte desconhecida")


func test_validator_requires_sources_for_religious_content() -> void:
	var chapter: Dictionary = load("res://scripts/content_loader.gd").read_json("res://data/chapter_001.json")
	for d in chapter.diary:
		if d.kind == "saint":
			d.erase("sources")
	var errors := ContentValidator.validate_chapter(chapter, ["q_virtudes", "q_obras", "q_samaritano", "q_vicente", "q_maior"], ["ccc_virtudes"])
	var found := false
	for e in errors:
		if "precisa citar" in e:
			found = true
	runner.check(found, "conteúdo sobre santo sem fonte deve ser rejeitado")


func test_validator_catches_unknown_event_reference() -> void:
	var chapter: Dictionary = load("res://scripts/content_loader.gd").read_json("res://data/chapter_001.json")
	chapter.points[0].events.append({"type": "challenge", "id": "nao_existe"})
	var errors := ContentValidator.validate_chapter(chapter, [], [])
	var found := false
	for e in errors:
		if "nao_existe" in e:
			found = true
	runner.check(found, "evento apontando para desafio inexistente deve ser rejeitado")
