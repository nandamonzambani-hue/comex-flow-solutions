extends Node
## Guarda o progresso do jogador: pontos visitados, respostas, desafios, escolhas e diário.
## Toda mudança é salva na hora (via SaveManager), então fechar o app não perde nada.

signal score_changed(chapter_id: String, score: int)
signal diary_unlocked(entry_id: String)

const DEFAULT_SETTINGS := {"locale": "pt_BR", "text_size": "normal"}

var data: Dictionary = {}
## Permite trocar o SaveManager nos testes.
var storage: Node = null


func _ready() -> void:
	if storage == null:
		storage = get_node_or_null("/root/SaveManager")
	load_progress()


func load_progress() -> void:
	data = storage.load_data() if storage else {}
	if typeof(data.get("chapters")) != TYPE_DICTIONARY:
		data["chapters"] = {}
	var settings: Dictionary = data.get("settings", {})
	for key in DEFAULT_SETTINGS:
		if not settings.has(key):
			settings[key] = DEFAULT_SETTINGS[key]
	data["settings"] = settings


func save() -> void:
	if storage:
		storage.save_data(data)


# ---------- configurações ----------

func get_setting(key: String):
	return data.settings.get(key, DEFAULT_SETTINGS.get(key))


func set_setting(key: String, value) -> void:
	data.settings[key] = value
	save()


# ---------- capítulo ----------

func chapter(id: String) -> Dictionary:
	if not data.chapters.has(id):
		data.chapters[id] = _new_chapter()
	return data.chapters[id]


func has_started(id: String) -> bool:
	return data.chapters.has(id) and data.chapters[id].status != "not_started"


func is_completed(id: String) -> bool:
	return data.chapters.has(id) and int(data.chapters[id].get("times_completed", 0)) > 0


func start_chapter(id: String) -> void:
	var c := chapter(id)
	if c.status == "not_started":
		c.status = "in_progress"
		save()


## Recomeça o capítulo do zero. A melhor pontuação e as conclusões anteriores são mantidas.
func reset_chapter(id: String) -> void:
	var old := chapter(id)
	var fresh := _new_chapter()
	fresh.best_score = old.get("best_score", 0)
	fresh.times_completed = old.get("times_completed", 0)
	data.chapters[id] = fresh
	save()
	score_changed.emit(id, 0)


func reset_all() -> void:
	data.chapters = {}
	save()


func mark_point_done(id: String, point_id: String) -> void:
	var c := chapter(id)
	if not point_id in c.points_done:
		c.points_done.append(point_id)
		save()


func is_point_done(id: String, point_id: String) -> bool:
	return point_id in chapter(id).points_done


func intro_seen(id: String) -> bool:
	return bool(chapter(id).get("intro_seen", false))


func mark_intro_seen(id: String) -> void:
	chapter(id).intro_seen = true
	save()


func record_question(id: String, question_id: String, attempts: int, correct: bool) -> int:
	var c := chapter(id)
	if c.questions.has(question_id):
		return int(c.questions[question_id].points)
	var pts := Scoring.question_points(attempts, correct)
	c.questions[question_id] = {"points": pts, "correct": correct, "attempts": attempts}
	save()
	score_changed.emit(id, score(id))
	return pts


func record_challenge(id: String, challenge_id: String, hints_used: int) -> int:
	var c := chapter(id)
	if c.challenges.has(challenge_id):
		return int(c.challenges[challenge_id].points)
	var pts := Scoring.challenge_points(hints_used)
	c.challenges[challenge_id] = {"points": pts, "hints": hints_used}
	save()
	score_changed.emit(id, score(id))
	return pts


func record_choice(id: String, choice_id: String, option_id: String) -> void:
	var c := chapter(id)
	if not c.choices.has(choice_id):
		c.choices[choice_id] = option_id
		save()


func is_event_done(id: String, event: Dictionary) -> bool:
	var c := chapter(id)
	match event.get("type"):
		"question":
			return c.questions.has(event.id)
		"challenge":
			return c.challenges.has(event.id)
		"choice":
			return c.choices.has(event.id)
	return false


func unlock_diary(id: String, entry_id: String) -> bool:
	var c := chapter(id)
	if entry_id in c.diary:
		return false
	c.diary.append(entry_id)
	save()
	diary_unlocked.emit(entry_id)
	return true


func complete_chapter(id: String) -> void:
	var c := chapter(id)
	var s := score(id)
	c.status = "completed"
	c.best_score = max(int(c.get("best_score", 0)), s)
	c.times_completed = int(c.get("times_completed", 0)) + 1
	save()


func score(id: String) -> int:
	var c := chapter(id)
	var total := 0
	for q in c.questions.values():
		total += int(q.points)
	for ch in c.challenges.values():
		total += int(ch.points)
	return total


func _new_chapter() -> Dictionary:
	return {
		"status": "not_started",
		"intro_seen": false,
		"points_done": [],
		"questions": {},
		"challenges": {},
		"choices": {},
		"diary": [],
		"best_score": 0,
		"times_completed": 0,
	}
