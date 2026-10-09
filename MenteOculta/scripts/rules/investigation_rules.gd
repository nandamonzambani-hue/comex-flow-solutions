class_name InvestigationRules
extends RefCounted
## Regras da investigação: o que está disponível, visitar locais, perguntar,
## comparar no Quadro, objetivos, dicas e acusação. Usado pela interface E pelos testes.

var data: Dictionary
var state: CaseState


func _init(case_data: Dictionary, case_state: CaseState) -> void:
	data = case_data
	state = case_state


# ---------- locais ----------

func available_locations() -> Array:
	var out := []
	for loc in data.locations:
		if Conditions.check(loc.get("condition"), state):
			out.append(loc)
	return out


## Visita um local. Retorna {"texts": [...], "results": [...]} (results = retornos de CaseState.apply).
func visit(location_id: String) -> Dictionary:
	var out := {"texts": [], "results": []}
	for loc in data.locations:
		if loc.id != location_id:
			continue
		for entry in loc.entries:
			if not Conditions.check(entry.get("condition"), state):
				continue
			out.texts.append(entry.text)
			if not state.is_done(entry.id):
				state.mark_done(entry.id)
				for eff in entry.get("effects", []):
					out.results.append(state.apply(eff))
			else:
				# Uma decisão pendente (ex.: o app fechou no meio) volta a aparecer.
				for eff in entry.get("effects", []):
					if eff.type == "decision" and not state.choices.has(eff.id):
						out.results.append({"decision": eff.id})
	return out


func is_location_new(loc: Dictionary) -> bool:
	for entry in loc.entries:
		if Conditions.check(entry.get("condition"), state) and not state.is_done(entry.id):
			return true
	return false


# ---------- diálogos ----------

func open_dialogue(character_id: String) -> void:
	state.apply({"type": "flag", "id": "talked_" + character_id})


func available_topics(character_id: String) -> Array:
	var out := []
	for t in data.dialogues[character_id].topics:
		if Conditions.check(t.get("condition"), state):
			out.append(t)
	return out


func has_new_topics(character_id: String) -> bool:
	for t in available_topics(character_id):
		if not state.is_done(t.id):
			return true
	return false


func ask(character_id: String, topic_id: String) -> Dictionary:
	for t in data.dialogues[character_id].topics:
		if t.id == topic_id:
			var results := []
			if not state.is_done(t.id):
				state.mark_done(t.id)
				for eff in t.get("effects", []):
					results.append(state.apply(eff))
			else:
				for eff in t.get("effects", []):
					if eff.type == "decision" and not state.choices.has(eff.id):
						results.append({"decision": eff.id})
			return {"lines": t.lines, "results": results}
	return {"lines": [], "results": []}


func greeting(character_id: String) -> String:
	var d: Dictionary = data.dialogues[character_id]
	if state.has_flag("otavio_hostil") and d.has("greeting_hostile"):
		return d.greeting_hostile
	return d.greeting


# ---------- decisões ----------

func decide(decision_id: String, option_id: String) -> Dictionary:
	var dec: Dictionary = data.decisions[decision_id]
	for opt in dec.options:
		if opt.id == option_id and state.decide(decision_id, option_id):
			var results := []
			for eff in opt.get("effects", []):
				results.append(state.apply(eff))
			return {"feedback": opt.feedback, "results": results}
	return {"feedback": "", "results": []}


# ---------- Quadro de evidências ----------

## Itens que podem ir para o Quadro: pistas e depoimentos já obtidos.
func board_items() -> Array:
	var out := []
	for c in data.clues:
		if state.has_clue(c.id):
			out.append({"id": c.id, "kind": "clue", "title": c.title, "text": c.summary})
	for s in data.statements:
		if state.has_statement(s.id):
			out.append({"id": s.id, "kind": "statement", "title": data.characters[s.character].name, "text": s.text})
	return out


## Compara dois itens. Retorna {"found": bool, "new": bool, "title": "", "text": ""}.
func compare(a: String, b: String) -> Dictionary:
	for x in data.contradictions:
		if (x.a == a and x.b == b) or (x.a == b and x.b == a):
			var is_new := state.add_contradiction(x.id)
			return {"found": true, "new": is_new, "id": x.id, "title": x.title, "text": x.explanation}
	for n in data.get("no_contradiction", []):
		if (n.a == a and n.b == b) or (n.a == b and n.b == a):
			return {"found": false, "new": false, "title": "", "text": n.text}
	return {"found": false, "new": false, "title": "", "text": data.default_no_contradiction}


# ---------- objetivos e dicas ----------

func current_objective() -> Dictionary:
	for o in data.objectives:
		if not o.has("done") or not Conditions.check(o.done, state):
			var text: String = o.text
			match o.get("progress", ""):
				"clues":
					text += " (%d/%d)" % [state.clues.size(), data.clues.size()]
				"contradictions":
					text += " (%d/%d)" % [state.contradictions.size(), data.contradictions.size()]
			return {"text": text}
	return {"text": ""}


func free_hints_left() -> int:
	return max(0, int(data.get("free_hints", 0)) - state.hints_used)


## Usa uma dica grátis. (Futuro: anúncio recompensado opcional para dicas extras.)
func use_hint() -> String:
	if free_hints_left() <= 0:
		return ""
	state.hints_used += 1
	return peek_hint()


func peek_hint() -> String:
	for h in data.hints:
		if Conditions.check(h.when, state):
			return h.text
	return ""


# ---------- acusação ----------

func can_accuse() -> bool:
	return Conditions.check(data.accusation.get("requires"), state)


func suspects() -> Array:
	var out := []
	for id in data.characters:
		if data.characters[id].get("suspect", false):
			out.append(id)
	return out


func accuse(suspect_id: String, evidence: Array) -> Dictionary:
	var acc: Dictionary = data.accusation
	var picked := evidence.slice(0, int(acc.max_evidence))
	var correct: bool = suspect_id == acc.culprit
	state.accusation = {"suspect": suspect_id, "evidence": picked, "correct": correct}
	state.finished = true
	return state.accusation
