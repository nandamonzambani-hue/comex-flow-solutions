class_name ContentValidator
extends RefCounted
## Confere o banco de perguntas antes de o jogo usar. Retorna a lista de
## problemas encontrados (vazia = tudo certo). Os testes falham se houver algum.

const MIN_PER_CATEGORY := 15


static func validate(categories: Array, questions: Array) -> Array[String]:
	var errors: Array[String] = []
	var cat_ids := {}
	for c in categories:
		for key in ["id", "name", "short", "color", "symbol"]:
			if not c.has(key):
				errors.append("categoria sem '%s': %s" % [key, str(c)])
		cat_ids[c.get("id", "")] = 0
	var seen := {}
	for i in questions.size():
		var q: Dictionary = questions[i]
		var where := "pergunta '%s'" % q.get("id", "#%d" % i)
		for key in ["id", "category", "difficulty", "question", "options", "answer", "explanation", "source"]:
			if not q.has(key):
				errors.append("%s: falta '%s'" % [where, key])
		if errors.size() > 0 and not q.has("options"):
			continue
		var id := str(q.get("id", ""))
		if seen.has(id):
			errors.append("%s: id repetido" % where)
		seen[id] = true
		if not cat_ids.has(q.get("category", "")):
			errors.append("%s: categoria desconhecida '%s'" % [where, q.get("category", "")])
		var options: Array = q.get("options", [])
		if options.size() != 4:
			errors.append("%s: precisa de 4 alternativas (tem %d)" % [where, options.size()])
		var dedup := {}
		for o in options:
			if str(o).strip_edges() == "":
				errors.append("%s: alternativa vazia" % where)
			if dedup.has(str(o)):
				errors.append("%s: alternativa repetida '%s'" % [where, o])
			dedup[str(o)] = true
		var answer := int(q.get("answer", -1))
		if answer < 0 or answer >= options.size():
			errors.append("%s: 'answer' (%d) fora das alternativas" % [where, answer])
		var d := int(q.get("difficulty", 0))
		if d < 1 or d > 3:
			errors.append("%s: dificuldade deve ser 1, 2 ou 3" % where)
		if str(q.get("source", "")).strip_edges() == "":
			errors.append("%s: sem fonte" % where)
		if str(q.get("explanation", "")).strip_edges() == "":
			errors.append("%s: sem explicação" % where)
		if cat_ids.has(q.get("category", "")) and q.get("pack", "") == "":
			cat_ids[q.category] += 1
	for c in cat_ids:
		if cat_ids[c] < MIN_PER_CATEGORY:
			errors.append("categoria '%s' tem só %d perguntas gratuitas (mínimo %d)" % [c, cat_ids[c], MIN_PER_CATEGORY])
	return errors
