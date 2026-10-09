class_name AssignmentPuzzle
extends RefCounted
## Desafio de COOPERAÇÃO: cada voluntário recebe exatamente uma tarefa.
## As pistas (texto) se traduzem na lista "allowed": as tarefas que cada pessoa pode fazer.
## O conteúdo deve ter uma única solução; os testes automáticos conferem isso.
##
## Formato dos dados:
## {
##   "people":  [{"id": "ana", "name": "Ana"}, ...],
##   "tasks":   [{"id": "telhado", "name": "Trocar as telhas"}, ...],
##   "clues":   ["Rita tem medo de altura.", ...],
##   "allowed": {"ana": ["telhado", ...], ...}
## }

var people: Array = []
var tasks: Array = []
var clues: Array = []
var allowed: Dictionary = {}


static func validate(data: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	for key in ["people", "tasks", "clues", "allowed"]:
		if not data.has(key):
			errors.append("falta o campo '%s'" % key)
	if not errors.is_empty():
		return errors
	var person_ids := _ids(data.people)
	var task_ids := _ids(data.tasks)
	if person_ids.size() != data.people.size() or task_ids.size() != data.tasks.size():
		errors.append("pessoas e tarefas precisam de 'id' únicos")
	if person_ids.size() != task_ids.size():
		errors.append("o número de pessoas (%d) deve ser igual ao de tarefas (%d)" % [person_ids.size(), task_ids.size()])
	for pid in data.allowed:
		if not pid in person_ids:
			errors.append("'allowed' cita a pessoa desconhecida '%s'" % pid)
			continue
		for tid in data.allowed[pid]:
			if not tid in task_ids:
				errors.append("'allowed.%s' cita a tarefa desconhecida '%s'" % [pid, tid])
	if errors.is_empty():
		var p := AssignmentPuzzle.from_data(data)
		var n := p.count_solutions()
		if n != 1:
			errors.append("o desafio deve ter exatamente 1 solução, mas tem %d" % n)
	return errors


static func from_data(data: Dictionary) -> AssignmentPuzzle:
	var p := AssignmentPuzzle.new()
	p.people = data.people
	p.tasks = data.tasks
	p.clues = data.clues
	p.allowed = data.allowed
	return p


func can_do(person_id: String, task_id: String) -> bool:
	return task_id in allowed.get(person_id, [])


## assignment: {person_id: task_id}. Retorna os ids das pessoas com problema
## (tarefa repetida, tarefa que contraria uma pista, ou ninguém designado).
func conflicts(assignment: Dictionary) -> Array[String]:
	var result: Array[String] = []
	var used := {}
	for person in people:
		var tid: String = assignment.get(person.id, "")
		if tid == "" or not can_do(person.id, tid):
			result.append(person.id)
		elif used.has(tid):
			result.append(person.id)
			if not used[tid] in result:
				result.append(used[tid])
		else:
			used[tid] = person.id
	return result


func is_solved(assignment: Dictionary) -> bool:
	return assignment.size() == people.size() and conflicts(assignment).is_empty()


func count_solutions() -> int:
	return _count(0, {})


func _count(index: int, used: Dictionary) -> int:
	if index == people.size():
		return 1
	var total := 0
	var pid: String = people[index].id
	for tid in allowed.get(pid, []):
		if used.has(tid):
			continue
		used[tid] = true
		total += _count(index + 1, used)
		used.erase(tid)
	return total


static func _ids(list: Array) -> Array:
	var seen := []
	for item in list:
		if typeof(item) == TYPE_DICTIONARY and item.has("id") and not item.id in seen:
			seen.append(item.id)
	return seen
