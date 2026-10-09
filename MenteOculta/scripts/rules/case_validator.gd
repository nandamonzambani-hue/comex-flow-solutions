class_name CaseValidator
extends RefCounted
## Confere um arquivo de caso antes de o jogo usá-lo.
## Cada erro diz onde está o problema, em português, para quem escreve casos.

const EFFECT_TYPES := ["clue", "statement", "flag", "decision"]
const SPECIAL_SPEAKERS := ["narrator"]


static func validate(c: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	for key in ["id", "title", "description", "background", "default_no_contradiction"]:
		if not _text(c.get(key)):
			errors.append("caso: falta o texto '%s'" % key)
	for key in ["characters", "decisions", "dialogues", "accusation", "endings", "scoring"]:
		if typeof(c.get(key)) != TYPE_DICTIONARY:
			errors.append("caso: '%s' deve ser um objeto" % key)
	for key in ["intro", "clues", "statements", "locations", "contradictions", "objectives", "hints", "explanation"]:
		if typeof(c.get(key)) != TYPE_ARRAY:
			errors.append("caso: '%s' deve ser uma lista" % key)
	if not errors.is_empty():
		return errors

	# ---------- coleta de ids ----------
	var ids := {"clue": [], "statement": [], "contradiction": [], "choice": [], "decision": []}
	errors.append_array(_collect(c.clues, "clues", ids.clue))
	errors.append_array(_collect(c.statements, "statements", ids.statement))
	errors.append_array(_collect(c.contradictions, "contradictions", ids.contradiction))
	for did in c.decisions:
		ids.decision.append(did)
		for opt in c.decisions[did].get("options", []):
			ids.choice.append("%s:%s" % [did, opt.get("id")])
	var speakers: Array = c.characters.keys() + SPECIAL_SPEAKERS

	# ---------- personagens ----------
	var suspects := 0
	for cid in c.characters:
		var ch: Dictionary = c.characters[cid]
		if not _text(ch.get("name")) or not _text(ch.get("portrait")):
			errors.append("characters.%s: precisa de 'name' e 'portrait'" % cid)
		if ch.get("suspect", false):
			suspects += 1
			if not c.dialogues.has(cid):
				errors.append("o suspeito '%s' não tem diálogo em 'dialogues'" % cid)
	if suspects < 2:
		errors.append("o caso precisa de pelo menos 2 suspeitos")

	# ---------- pistas e depoimentos ----------
	for i in c.clues.size():
		var cl: Dictionary = c.clues[i]
		for key in ["title", "summary", "icon"]:
			if not _text(cl.get(key)):
				errors.append("clues[%d]: falta '%s'" % [i, key])
		if typeof(cl.get("doc")) != TYPE_DICTIONARY or typeof(cl.doc.get("lines")) != TYPE_ARRAY:
			errors.append("clues[%d]: 'doc' precisa de 'lines'" % i)
	for i in c.statements.size():
		var st: Dictionary = c.statements[i]
		if not st.get("character") in c.characters:
			errors.append("statements[%d]: personagem desconhecido '%s'" % [i, st.get("character")])
		if not _text(st.get("text")):
			errors.append("statements[%d]: falta 'text'" % i)

	# ---------- efeitos e condições em todo lugar ----------
	errors.append_array(_lines(c.intro, "intro", speakers))
	errors.append_array(_effects(c.get("intro_effects", []), "intro_effects", ids))
	var loc_ids := []
	for i in c.locations.size():
		var loc: Dictionary = c.locations[i]
		var w := "locations[%d]" % i
		for key in ["id", "name", "icon"]:
			if not _text(loc.get(key)):
				errors.append("%s: falta '%s'" % [w, key])
		loc_ids.append(loc.get("id"))
		var pos = loc.get("pos")
		if typeof(pos) != TYPE_ARRAY or pos.size() != 2 or pos[0] < 0 or pos[0] > 1 or pos[1] < 0 or pos[1] > 1:
			errors.append("%s: 'pos' deve ser [x, y] entre 0 e 1" % w)
		errors.append_array(Conditions.validate(loc.get("condition"), ids, w + ".condition"))
		for j in loc.get("entries", []).size():
			var e: Dictionary = loc.entries[j]
			var we := "%s.entries[%d]" % [w, j]
			if not _text(e.get("id")) or not _text(e.get("text")):
				errors.append("%s: precisa de 'id' e 'text'" % we)
			errors.append_array(Conditions.validate(e.get("condition"), ids, we + ".condition"))
			errors.append_array(_effects(e.get("effects", []), we, ids))
	for cid in c.dialogues:
		if not cid in c.characters:
			errors.append("dialogues.%s: personagem desconhecido" % cid)
			continue
		var d: Dictionary = c.dialogues[cid]
		if not _text(d.get("greeting")):
			errors.append("dialogues.%s: falta 'greeting'" % cid)
		for j in d.get("topics", []).size():
			var t: Dictionary = d.topics[j]
			var wt := "dialogues.%s.topics[%d]" % [cid, j]
			if not _text(t.get("id")) or not _text(t.get("question")):
				errors.append("%s: precisa de 'id' e 'question'" % wt)
			errors.append_array(_lines(t.get("lines", []), wt, speakers))
			errors.append_array(Conditions.validate(t.get("condition"), ids, wt + ".condition"))
			errors.append_array(_effects(t.get("effects", []), wt, ids))
	for did in c.decisions:
		var dec: Dictionary = c.decisions[did]
		if not _text(dec.get("prompt")) or dec.get("options", []).size() < 2:
			errors.append("decisions.%s: precisa de 'prompt' e pelo menos 2 opções" % did)
		for opt in dec.get("options", []):
			if not _text(opt.get("text")) or not _text(opt.get("feedback")):
				errors.append("decisions.%s: cada opção precisa de 'text' e 'feedback'" % did)
			errors.append_array(_effects(opt.get("effects", []), "decisions.%s.%s" % [did, opt.get("id")], ids))
	var board_ids: Array = ids.clue + ids.statement
	for x in c.contradictions:
		if not x.get("a") in board_ids or not x.get("b") in board_ids:
			errors.append("contradição '%s': 'a' e 'b' devem ser pistas ou depoimentos existentes" % x.get("id"))
		if not _text(x.get("explanation")):
			errors.append("contradição '%s': falta 'explanation'" % x.get("id"))
	for o in c.objectives:
		errors.append_array(Conditions.validate(o.get("done"), ids, "objectives"))
	for h in c.hints:
		errors.append_array(Conditions.validate(h.get("when"), ids, "hints"))

	# ---------- acusação e finais ----------
	var acc: Dictionary = c.accusation
	if not acc.get("culprit") in c.characters or not c.characters[acc.get("culprit")].get("suspect", false):
		errors.append("accusation.culprit deve ser um suspeito")
	for e in acc.get("relevant_evidence", []):
		if not e in ids.clue:
			errors.append("accusation.relevant_evidence: pista desconhecida '%s'" % e)
	errors.append_array(Conditions.validate(acc.get("requires"), ids, "accusation.requires"))
	for key in ["correct", "wrong"]:
		var en = c.endings.get(key)
		if typeof(en) != TYPE_DICTIONARY or not _text(en.get("title")) or not _text(en.get("text")):
			errors.append("endings.%s: precisa de 'title' e 'text'" % key)
	for step in c.explanation:
		for cl in step.get("clues", []):
			if not cl in ids.clue:
				errors.append("explanation: pista desconhecida '%s'" % cl)
	return errors


static func _collect(list: Array, where: String, into: Array) -> Array[String]:
	var errors: Array[String] = []
	for i in list.size():
		var id = list[i].get("id")
		if not _text(id):
			errors.append("%s[%d]: falta 'id'" % [where, i])
		elif id in into:
			errors.append("%s[%d]: id repetido '%s'" % [where, i, id])
		else:
			into.append(id)
	return errors


static func _effects(list: Array, where: String, ids: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	for eff in list:
		var t = eff.get("type")
		if not t in EFFECT_TYPES:
			errors.append("%s: efeito desconhecido '%s'" % [where, t])
		elif t in ["clue", "statement", "decision"] and not eff.get("id") in ids[t]:
			errors.append("%s: %s desconhecido '%s'" % [where, t, eff.get("id")])
	return errors


static func _lines(list: Array, where: String, speakers: Array) -> Array[String]:
	var errors: Array[String] = []
	for l in list:
		if not l.get("speaker") in speakers:
			errors.append("%s: personagem desconhecido '%s'" % [where, l.get("speaker")])
		if not _text(l.get("text")):
			errors.append("%s: fala sem 'text'" % where)
	return errors


static func _text(v) -> bool:
	return typeof(v) == TYPE_STRING and not String(v).strip_edges().is_empty()
