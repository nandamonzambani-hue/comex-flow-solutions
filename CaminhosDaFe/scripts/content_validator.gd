class_name ContentValidator
extends RefCounted
## Confere os arquivos de conteúdo (capítulos, perguntas e fontes) antes de o jogo usá-los.
## Cada erro vem com o "caminho" do problema, para quem escreve conteúdo achar e corrigir.

const EVENT_TYPES := ["dialogue", "challenge", "question", "choice", "diary", "finish"]
const DIARY_KINDS := ["fiction", "teaching", "scripture", "saint", "sources"]
const CHALLENGE_TYPES := ["assignment", "distribution", "pipes"]
const SPECIAL_SPEAKERS := ["narrator", "player"]


static func validate_sources(sources: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	if not sources.has("sources") or typeof(sources.sources) != TYPE_ARRAY:
		return ["sources.json: falta a lista 'sources'"]
	var seen := {}
	for i in sources.sources.size():
		var s = sources.sources[i]
		var where := "sources[%d]" % i
		if typeof(s) != TYPE_DICTIONARY:
			errors.append("%s: deve ser um objeto" % where)
			continue
		for key in ["id", "title", "type"]:
			if not _is_text(s.get(key)):
				errors.append("%s: falta '%s'" % [where, key])
		if s.has("url") and not String(s.url).begins_with("https://"):
			errors.append("%s: 'url' deve começar com https://" % where)
		if seen.has(s.get("id")):
			errors.append("%s: id repetido '%s'" % [where, s.get("id")])
		seen[s.get("id")] = true
	return errors


static func validate_questions(questions: Dictionary, source_ids: Array) -> Array[String]:
	var errors: Array[String] = []
	if not questions.has("questions") or typeof(questions.questions) != TYPE_ARRAY:
		return ["perguntas: falta a lista 'questions'"]
	var seen := {}
	for i in questions.questions.size():
		var q = questions.questions[i]
		var where := "questions[%d]" % i
		if typeof(q) != TYPE_DICTIONARY:
			errors.append("%s: deve ser um objeto" % where)
			continue
		for key in ["id", "prompt", "explanation"]:
			if not _is_text(q.get(key)):
				errors.append("%s: falta '%s'" % [where, key])
		var options = q.get("options")
		if typeof(options) != TYPE_ARRAY or options.size() < 2 or options.size() > 5:
			errors.append("%s: 'options' deve ter de 2 a 5 alternativas" % where)
		else:
			for opt in options:
				if not _is_text(opt):
					errors.append("%s: todas as alternativas devem ser texto" % where)
			var answer = q.get("answer")
			if typeof(answer) != TYPE_FLOAT and typeof(answer) != TYPE_INT:
				errors.append("%s: 'answer' deve ser o número da alternativa certa (começando em 0)" % where)
			elif int(answer) < 0 or int(answer) >= options.size():
				errors.append("%s: 'answer' (%d) fora das alternativas" % [where, int(answer)])
		errors.append_array(_check_sources(q.get("sources"), source_ids, where, true))
		if seen.has(q.get("id")):
			errors.append("%s: id repetido '%s'" % [where, q.get("id")])
		seen[q.get("id")] = true
	return errors


static func validate_chapter(chapter: Dictionary, question_ids: Array, source_ids: Array) -> Array[String]:
	var errors: Array[String] = []
	for key in ["id", "title", "virtue", "background"]:
		if not _is_text(chapter.get(key)):
			errors.append("capítulo: falta '%s'" % key)
	for key in ["characters", "challenges", "choices"]:
		if typeof(chapter.get(key)) != TYPE_DICTIONARY:
			errors.append("capítulo: '%s' deve ser um objeto" % key)
	for key in ["intro", "points", "diary"]:
		if typeof(chapter.get(key)) != TYPE_ARRAY:
			errors.append("capítulo: '%s' deve ser uma lista" % key)
	if typeof(chapter.get("ending")) != TYPE_DICTIONARY:
		errors.append("capítulo: falta o bloco 'ending'")
	if not errors.is_empty():
		return errors

	var diary_ids := []
	for i in chapter.diary.size():
		var d = chapter.diary[i]
		var where := "diary[%d]" % i
		for key in ["id", "title", "body", "kind"]:
			if not _is_text(d.get(key)):
				errors.append("%s: falta '%s'" % [where, key])
		if not d.get("kind") in DIARY_KINDS:
			errors.append("%s: 'kind' deve ser um de %s" % [where, DIARY_KINDS])
		# Conteúdo religioso ou histórico precisa citar fonte; ficção não.
		errors.append_array(_check_sources(d.get("sources"), source_ids, where, d.get("kind") in ["teaching", "scripture", "saint"]))
		diary_ids.append(d.get("id"))

	for cid in chapter.characters:
		var ch = chapter.characters[cid]
		if not _is_text(ch.get("name")) or not _is_text(ch.get("portrait")):
			errors.append("characters.%s: precisa de 'name' e 'portrait'" % cid)

	for cid in chapter.challenges:
		var c = chapter.challenges[cid]
		var where := "challenges.%s" % cid
		for key in ["title", "virtue", "intro", "success", "hint"]:
			if not _is_text(c.get(key)):
				errors.append("%s: falta '%s'" % [where, key])
		match c.get("type"):
			"assignment":
				errors.append_array(_prefix(where, AssignmentPuzzle.validate(c.get("data", {}))))
			"distribution":
				errors.append_array(_prefix(where, DistributionPuzzle.validate(c.get("data", {}))))
			"pipes":
				errors.append_array(_prefix(where, PipesPuzzle.validate(c.get("data", {}))))
			_:
				errors.append("%s: 'type' deve ser um de %s" % [where, CHALLENGE_TYPES])

	for cid in chapter.choices:
		var c = chapter.choices[cid]
		var where := "choices.%s" % cid
		if not _is_text(c.get("prompt")) or typeof(c.get("options")) != TYPE_ARRAY or c.options.size() < 2:
			errors.append("%s: precisa de 'prompt' e de pelo menos 2 'options'" % where)
			continue
		for opt in c.options:
			for key in ["id", "text", "response", "ending"]:
				if not _is_text(opt.get(key)):
					errors.append("%s: cada opção precisa de '%s'" % [where, key])

	var ctx := {
		"speakers": chapter.characters.keys() + SPECIAL_SPEAKERS,
		"challenges": chapter.challenges.keys(),
		"choices": chapter.choices.keys(),
		"questions": question_ids,
		"diary": diary_ids,
	}
	var used := {"challenge": [], "question": [], "choice": [], "finish": 0}
	errors.append_array(_check_events(chapter.intro, "intro", ctx, used))

	var point_ids := []
	for p in chapter.points:
		point_ids.append(p.get("id"))
	for i in chapter.points.size():
		var p = chapter.points[i]
		var where := "points[%d]" % i
		for key in ["id", "name", "icon"]:
			if not _is_text(p.get(key)):
				errors.append("%s: falta '%s'" % [where, key])
		var pos = p.get("pos")
		if typeof(pos) != TYPE_ARRAY or pos.size() != 2 or pos[0] < 0.0 or pos[0] > 1.0 or pos[1] < 0.0 or pos[1] > 1.0:
			errors.append("%s: 'pos' deve ser [x, y] com valores entre 0 e 1" % where)
		for req in p.get("requires", []):
			if not req in point_ids:
				errors.append("%s: 'requires' cita o ponto desconhecido '%s'" % [where, req])
		errors.append_array(_check_events(p.get("events", []), where + ".events", ctx, used))

	if used.finish != 1:
		errors.append("o capítulo deve ter exatamente um evento 'finish' (tem %d)" % used.finish)
	for kind in ["challenge", "question", "choice"]:
		var all_ids: Array = ctx[kind + "s"]
		for id in all_ids:
			if not id in used[kind]:
				errors.append("%s '%s' existe mas nunca aparece no capítulo" % [kind, id])
	if errors.is_empty():
		errors.append_array(_check_reachable(chapter.points))
	return errors


static func _check_events(events: Array, where: String, ctx: Dictionary, used: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	for i in events.size():
		var ev = events[i]
		var at := "%s[%d]" % [where, i]
		var t = ev.get("type")
		if not t in EVENT_TYPES:
			errors.append("%s: tipo de evento desconhecido '%s'" % [at, t])
			continue
		match t:
			"dialogue":
				if typeof(ev.get("lines")) != TYPE_ARRAY or ev.lines.is_empty():
					errors.append("%s: 'lines' não pode ficar vazio" % at)
					continue
				for line in ev.lines:
					if not line.get("speaker") in ctx.speakers:
						errors.append("%s: personagem desconhecido '%s'" % [at, line.get("speaker")])
					if not _is_text(line.get("text")):
						errors.append("%s: fala sem 'text'" % at)
			"challenge", "question", "choice":
				var id = ev.get("id")
				if not id in ctx[t + "s"]:
					errors.append("%s: %s desconhecido '%s'" % [at, t, id])
				elif id in used[t]:
					errors.append("%s: %s '%s' aparece mais de uma vez" % [at, t, id])
				else:
					used[t].append(id)
			"diary":
				if not ev.get("id") in ctx.diary:
					errors.append("%s: registro de diário desconhecido '%s'" % [at, ev.get("id")])
			"finish":
				used.finish += 1
	return errors


## Garante que todos os pontos podem ser liberados (sem dependências circulares).
static func _check_reachable(points: Array) -> Array[String]:
	var done := {}
	var progressed := true
	while progressed:
		progressed = false
		for p in points:
			if done.has(p.id):
				continue
			var ok := true
			for req in p.get("requires", []):
				if not done.has(req):
					ok = false
			if ok:
				done[p.id] = true
				progressed = true
	var errors: Array[String] = []
	for p in points:
		if not done.has(p.id):
			errors.append("o ponto '%s' nunca pode ser liberado (dependência circular)" % p.id)
	return errors


static func _check_sources(list, source_ids: Array, where: String, required: bool) -> Array[String]:
	var errors: Array[String] = []
	if list == null:
		if required:
			errors.append("%s: conteúdo religioso ou histórico precisa citar 'sources'" % where)
		return errors
	if typeof(list) != TYPE_ARRAY or (required and list.is_empty()):
		errors.append("%s: 'sources' deve ser uma lista de ids de fontes" % where)
		return errors
	for sid in list:
		if not sid in source_ids:
			errors.append("%s: fonte desconhecida '%s' (cadastre em sources.json)" % [where, sid])
	return errors


static func _prefix(where: String, list: Array[String]) -> Array[String]:
	var out: Array[String] = []
	for e in list:
		out.append("%s: %s" % [where, e])
	return out


static func _is_text(v) -> bool:
	return typeof(v) == TYPE_STRING and not String(v).strip_edges().is_empty()
