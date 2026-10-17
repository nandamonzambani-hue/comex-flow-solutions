extends RefCounted
## Regras da partida (MatchState / QuizRules), sem interface.

var runner


func _cats() -> Array[String]:
	return ["a", "b", "c", "d", "e", "f"]


func test_tres_acertos_liberam_a_coroa() -> void:
	var m := MatchState.new(_cats(), 1)
	m.answer("a", true, 3.0)
	m.answer("b", true, 20.0)
	runner.check(not m.crown_pending, "coroa não deveria sair com 2 acertos")
	var r := m.answer("c", true, 3.0)
	runner.check(r.crown and m.crown_pending, "3 acertos seguidos liberam a coroa")
	runner.check_eq(m.streak, 0, "sequência zera depois de liberar a coroa")


func test_erro_tira_vida_e_zera_sequencia() -> void:
	var m := MatchState.new(_cats(), 1)
	m.answer("a", true, 3.0)
	m.answer("a", false, 3.0)
	runner.check_eq(m.lives, QuizRules.LIVES - 1, "erro tira uma vida")
	runner.check_eq(m.streak, 0, "erro zera a sequência")


func test_medalha_na_coroa_e_vitoria_com_seis() -> void:
	var m := MatchState.new(_cats(), 1)
	for c in _cats():
		m.grant_crown()
		var r := m.answer_crown(c, true, 5.0)
		runner.check(r.medal, "acertar a coroa dá a medalha de " + c)
	runner.check(m.is_won(), "6 medalhas vencem a partida")
	runner.check(m.crown_choices().is_empty(), "sem categorias para disputar depois de vencer")


func test_coroa_errada_tira_vida_sem_medalha() -> void:
	var m := MatchState.new(_cats(), 1)
	m.grant_crown()
	var r := m.answer_crown("a", false, 5.0)
	runner.check(not r.medal and m.medals.is_empty(), "errar a coroa não dá medalha")
	runner.check_eq(m.lives, QuizRules.LIVES - 1, "errar a coroa tira vida")


func test_derrota_e_reviver_uma_vez() -> void:
	var m := MatchState.new(_cats(), 1)
	for i in QuizRules.LIVES:
		m.answer("a", false, 1.0)
	runner.check(m.is_lost(), "sem vidas = derrota")
	runner.check(m.revive(), "pode continuar uma vez")
	runner.check_eq(m.lives, 1, "volta com 1 vida")
	m.answer("a", false, 1.0)
	runner.check(not m.revive(), "não pode continuar duas vezes")


func test_moedas_por_resposta() -> void:
	runner.check_eq(QuizRules.coins_for_answer(true, 3.0), QuizRules.COINS_PER_CORRECT + QuizRules.COINS_FAST_BONUS, "rápido ganha bônus")
	runner.check_eq(QuizRules.coins_for_answer(true, 20.0), QuizRules.COINS_PER_CORRECT, "devagar sem bônus")
	runner.check_eq(QuizRules.coins_for_answer(false, 1.0), 0, "erro não dá moedas")


func test_eliminar_duas_nunca_tira_a_certa() -> void:
	var rng := RandomNumberGenerator.new()
	for s in 50:
		rng.seed = s + 1
		var out := QuizRules.options_to_eliminate(4, s % 4, rng)
		runner.check_eq(out.size(), 2, "elimina duas")
		runner.check(not out.has(s % 4), "nunca elimina a correta")


func test_roda_tem_coroa_e_todas_as_categorias() -> void:
	var m := MatchState.new(_cats(), 3)
	var seen := {}
	for i in 400:
		seen[m.spin()] = true
	runner.check_eq(seen.size(), 7, "as 7 fatias saem no sorteio")
