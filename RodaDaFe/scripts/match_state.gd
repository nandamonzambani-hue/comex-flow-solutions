class_name MatchState
extends RefCounted
## Estado de uma partida, sem interface (testável).
##
## Fluxo: girar a roda → responder a pergunta da categoria sorteada.
## Errou: perde uma vida. Acertou: soma na sequência; a cada 3 acertos
## seguidos (ou caindo na fatia "Coroa") o jogador escolhe uma categoria e
## responde a pergunta da coroa: acertou, ganha a medalha daquela categoria.
## Ganha a partida quem junta as 6 medalhas; perde quem fica sem vidas.

signal changed

var categories: Array[String] = []
var rng := RandomNumberGenerator.new()

var lives := QuizRules.LIVES
var streak := 0
var best_streak := 0
var medals: Array[String] = []
var coins_earned := 0
var answered := 0
var correct := 0
var per_category := {} ## categoria → {"answered": n, "correct": n}
var continue_used := false
var crown_pending := false ## o jogador tem direito a escolher uma coroa
var asked_ids := {} ## perguntas já feitas nesta partida


func _init(category_ids: Array[String], seed_value: int = 0) -> void:
	categories = category_ids.duplicate()
	if seed_value != 0:
		rng.seed = seed_value
	else:
		rng.randomize()


## Sorteia a fatia da roda: uma categoria ou "coroa".
func spin() -> String:
	var segments := wheel_segments()
	return segments[rng.randi_range(0, segments.size() - 1)]


func wheel_segments() -> Array[String]:
	var s: Array[String] = categories.duplicate()
	s.append(QuizRules.CROWN_SEGMENT)
	return s


## Categorias em que ainda dá para disputar medalha.
func crown_choices() -> Array[String]:
	var out: Array[String] = []
	for c in categories:
		if not medals.has(c):
			out.append(c)
	return out


## Registra uma resposta comum (não-coroa). Retorna o resultado.
func answer(category: String, is_correct: bool, seconds_used: float) -> Dictionary:
	_count(category, is_correct)
	var coins := QuizRules.coins_for_answer(is_correct, seconds_used)
	coins_earned += coins
	if is_correct:
		streak += 1
		best_streak = maxi(best_streak, streak)
		if streak >= QuizRules.STREAK_FOR_CROWN and not crown_choices().is_empty():
			crown_pending = true
			streak = 0
	else:
		streak = 0
		lives -= 1
	changed.emit()
	return {"correct": is_correct, "coins": coins, "crown": crown_pending, "game_over": is_lost()}


## Fatia "Coroa" da roda: libera a escolha imediatamente.
func grant_crown() -> void:
	if not crown_choices().is_empty():
		crown_pending = true
		changed.emit()


## Registra a resposta da pergunta da coroa.
func answer_crown(category: String, is_correct: bool, seconds_used: float) -> Dictionary:
	crown_pending = false
	_count(category, is_correct)
	var coins := QuizRules.coins_for_answer(is_correct, seconds_used)
	var medal := false
	if is_correct and not medals.has(category):
		medals.append(category)
		medal = true
		coins += QuizRules.COINS_PER_MEDAL
		if is_won():
			coins += QuizRules.COINS_WIN_BONUS
	elif not is_correct:
		lives -= 1
	coins_earned += coins
	changed.emit()
	return {"correct": is_correct, "coins": coins, "medal": medal, "won": is_won(), "game_over": is_lost()}


## "Continuar" depois de perder (uma vez por partida, assistindo a um anúncio ou usando moedas).
func revive() -> bool:
	if continue_used or not is_lost():
		return false
	continue_used = true
	lives = 1
	changed.emit()
	return true


func is_won() -> bool:
	return medals.size() >= mini(QuizRules.MEDALS_TO_WIN, categories.size())


func is_lost() -> bool:
	return lives <= 0


func is_over() -> bool:
	return is_won() or is_lost()


func accuracy() -> float:
	return float(correct) / answered if answered > 0 else 0.0


func _count(category: String, is_correct: bool) -> void:
	answered += 1
	if is_correct:
		correct += 1
	var entry: Dictionary = per_category.get(category, {"answered": 0, "correct": 0})
	entry.answered += 1
	if is_correct:
		entry.correct += 1
	per_category[category] = entry
