extends RefCounted
## Salvamento: o progresso sobrevive a fechar o app, e pistas nunca se perdem.

var runner
var save: Node
const TEST_SAVE := "user://test_mente_oculta.json"


func before_each() -> void:
	save = load("res://scripts/save_manager.gd").new()
	save.save_path = TEST_SAVE
	save.delete_save()


func after_each() -> void:
	save.delete_save()
	save.free()


func test_state_roundtrip() -> void:
	var s := CaseState.create("case_001")
	s.apply({"type": "clue", "id": "p1"})
	s.apply({"type": "statement", "id": "s_bia_sexta"})
	s.apply({"type": "flag", "id": "talked_bia"})
	s.decide("d1", "segredo")
	s.add_contradiction("x2")
	s.hints_used = 2
	save.save_data({"cases": {"case_001": s.to_dict()}})
	var loaded := CaseState.from_dict(save.load_data().cases.case_001)
	runner.check(loaded.has_clue("p1"), "pista salva")
	runner.check(loaded.has_statement("s_bia_sexta"), "depoimento salvo")
	runner.check(loaded.has_flag("talked_bia"), "marcador salvo")
	runner.check_eq(loaded.choice("d1"), "segredo", "decisão salva")
	runner.check(loaded.has_contradiction("x2"), "contradição salva")
	runner.check_eq(loaded.hints_used, 2, "dicas usadas salvas")


func test_clues_are_never_lost() -> void:
	var s := CaseState.create("case_001")
	s.apply({"type": "clue", "id": "p3"})
	s.apply({"type": "clue", "id": "p3"})
	runner.check_eq(s.clues.size(), 1, "pista repetida não duplica")
	runner.check(not s.decide("d1", "a") == false, "primeira decisão vale")
	runner.check(not s.decide("d1", "b"), "uma decisão não pode ser trocada depois")
	runner.check_eq(s.choice("d1"), "a", "a escolha original é mantida")


func test_corrupted_save_does_not_crash() -> void:
	var f := FileAccess.open(TEST_SAVE, FileAccess.WRITE)
	f.store_string("{ quebrado")
	f.close()
	runner.check(save.load_data().is_empty(), "save corrompido volta vazio")
	DirAccess.remove_absolute(TEST_SAVE + ".bak")
