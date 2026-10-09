extends RefCounted
## Pontuação, progresso e salvamento (num arquivo de teste separado do save real).

var runner
var save: Node
var progress: Node

const TEST_SAVE := "user://test_save.json"


func before_each() -> void:
	save = load("res://scripts/save_manager.gd").new()
	save.save_path = TEST_SAVE
	save.delete_save()
	progress = load("res://scripts/progress_manager.gd").new()
	progress.storage = save
	progress.load_progress()


func after_each() -> void:
	save.delete_save()
	save.free()
	progress.free()


func test_scoring_rules() -> void:
	runner.check_eq(Scoring.question_points(1, true), 100, "acerto de primeira")
	runner.check_eq(Scoring.question_points(2, true), 50, "acerto na segunda tentativa")
	runner.check_eq(Scoring.question_points(2, false), 0, "erro")
	runner.check_eq(Scoring.challenge_points(0), 200, "desafio sem dica")
	runner.check_eq(Scoring.challenge_points(1), 150, "desafio com dica")
	runner.check_eq(Scoring.max_points(5, 3), 1100, "pontuação máxima do capítulo 1")


func test_points_are_not_awarded_twice() -> void:
	progress.record_question("c1", "q1", 1, true)
	progress.record_question("c1", "q1", 1, true)
	progress.record_challenge("c1", "d1", 0)
	progress.record_challenge("c1", "d1", 0)
	runner.check_eq(progress.score("c1"), 300, "repetir um evento não soma pontos de novo")


func test_choices_do_not_change_score() -> void:
	progress.record_question("c1", "q1", 1, true)
	var before: int = progress.score("c1")
	progress.record_choice("c1", "macas", "expor")
	runner.check_eq(progress.score("c1"), before, "escolhas não alteram a pontuação")


func test_progress_survives_reload() -> void:
	progress.start_chapter("c1")
	progress.mark_point_done("c1", "capela")
	progress.record_question("c1", "q1", 2, true)
	progress.unlock_diary("c1", "caridade")
	progress.set_setting("locale", "es")
	var again = load("res://scripts/progress_manager.gd").new()
	again.storage = save
	again.load_progress()
	runner.check(again.is_point_done("c1", "capela"), "ponto visitado continua salvo")
	runner.check_eq(again.score("c1"), 50, "pontuação continua salva")
	runner.check("caridade" in again.chapter("c1").diary, "diário continua salvo")
	runner.check_eq(again.get_setting("locale"), "es", "idioma continua salvo")
	again.free()


func test_complete_and_restart_keeps_best_score() -> void:
	progress.record_challenge("c1", "d1", 0)
	progress.complete_chapter("c1")
	runner.check(progress.is_completed("c1"), "capítulo concluído")
	progress.reset_chapter("c1")
	runner.check_eq(progress.score("c1"), 0, "recomeçar zera a pontuação atual")
	runner.check_eq(int(progress.chapter("c1").best_score), 200, "a melhor pontuação é mantida")
	runner.check(progress.is_completed("c1"), "o registro de conclusão é mantido")
	runner.check(progress.chapter("c1").points_done.is_empty(), "os pontos visitados são limpos")


func test_corrupted_save_starts_fresh() -> void:
	var f := FileAccess.open(TEST_SAVE, FileAccess.WRITE)
	f.store_string("{ isso não é json")
	f.close()
	progress.load_progress()
	runner.check(progress.data.chapters.is_empty(), "save corrompido não derruba o jogo")
	runner.check(FileAccess.file_exists(TEST_SAVE + ".bak"), "o arquivo corrompido é guardado como .bak")
	DirAccess.remove_absolute(TEST_SAVE + ".bak")
