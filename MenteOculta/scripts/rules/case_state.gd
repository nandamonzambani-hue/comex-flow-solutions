class_name CaseState
extends RefCounted
## Estado de UMA investigação: o que o jogador já encontrou, ouviu e decidiu.
## Não sabe nada de interface. É salvo como dicionário pelo SaveManager.
## Pistas nunca são removidas: só "reiniciar caso" (com confirmação) limpa tudo.

var case_id := ""
var clues: Array = []           ## ordem em que foram encontradas
var statements: Array = []
var contradictions: Array = []
var flags: Dictionary = {}
var choices: Dictionary = {}     ## decisão -> opção
var done_entries: Array = []     ## entradas de local e tópicos de diálogo já vistos
var hints_used := 0
var accusation: Dictionary = {}  ## {"suspect": "...", "evidence": [...], "correct": bool}
var finished := false


static func create(id: String) -> CaseState:
	var s := CaseState.new()
	s.case_id = id
	return s


func has_clue(id: String) -> bool:
	return id in clues


func has_statement(id: String) -> bool:
	return id in statements


func has_flag(id: String) -> bool:
	return flags.get(id, false)


func has_contradiction(id: String) -> bool:
	return id in contradictions


func choice(decision_id: String) -> String:
	return choices.get(decision_id, "")


func is_done(entry_id: String) -> bool:
	return entry_id in done_entries


func mark_done(entry_id: String) -> void:
	if not entry_id in done_entries:
		done_entries.append(entry_id)


## Aplica um efeito do caso. Retorna o que a interface precisa mostrar:
## {"new_clue": id} | {"new_statement": id} | {"decision": id} | {}
func apply(effect: Dictionary) -> Dictionary:
	var id: String = effect.get("id", "")
	match effect.get("type"):
		"clue":
			if not has_clue(id):
				clues.append(id)
				return {"new_clue": id}
		"statement":
			if not has_statement(id):
				statements.append(id)
				return {"new_statement": id}
		"flag":
			flags[id] = true
		"decision":
			if not choices.has(id):
				return {"decision": id}
	return {}


func decide(decision_id: String, option_id: String) -> bool:
	if choices.has(decision_id):
		return false
	choices[decision_id] = option_id
	return true


func add_contradiction(id: String) -> bool:
	if has_contradiction(id):
		return false
	contradictions.append(id)
	return true


func score(case_data: Dictionary) -> int:
	var sc: Dictionary = case_data.get("scoring", {})
	var total := clues.size() * int(sc.get("clue", 0)) + contradictions.size() * int(sc.get("contradiction", 0))
	if accusation.get("correct", false):
		total += int(sc.get("correct", 0))
	var relevant: Array = case_data.get("accusation", {}).get("relevant_evidence", [])
	for e in accusation.get("evidence", []):
		if e in relevant:
			total += int(sc.get("evidence", 0))
	return total


static func max_score(case_data: Dictionary) -> int:
	var sc: Dictionary = case_data.get("scoring", {})
	return case_data.clues.size() * int(sc.get("clue", 0)) \
		+ case_data.contradictions.size() * int(sc.get("contradiction", 0)) \
		+ int(sc.get("correct", 0)) \
		+ int(case_data.accusation.get("max_evidence", 0)) * int(sc.get("evidence", 0))


func to_dict() -> Dictionary:
	return {
		"case_id": case_id, "clues": clues, "statements": statements, "contradictions": contradictions,
		"flags": flags, "choices": choices, "done_entries": done_entries, "hints_used": hints_used,
		"accusation": accusation, "finished": finished,
	}


static func from_dict(d: Dictionary) -> CaseState:
	var s := CaseState.create(d.get("case_id", ""))
	s.clues = d.get("clues", [])
	s.statements = d.get("statements", [])
	s.contradictions = d.get("contradictions", [])
	s.flags = d.get("flags", {})
	s.choices = d.get("choices", {})
	s.done_entries = d.get("done_entries", [])
	s.hints_used = int(d.get("hints_used", 0))
	s.accusation = d.get("accusation", {})
	s.finished = bool(d.get("finished", false))
	return s
