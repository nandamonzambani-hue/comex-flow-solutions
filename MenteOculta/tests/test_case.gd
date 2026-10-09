extends RefCounted
## O caso 001 é válido, completo e solucionável em TODAS as combinações de decisões.

var runner


func _case() -> Dictionary:
	return load("res://scripts/case_loader.gd").read_json("res://data/case_001.json")


func test_case_file_is_valid() -> void:
	var errors := CaseValidator.validate(_case())
	for e in errors:
		runner.check(false, e)


func test_mvp_scope() -> void:
	var c := _case()
	runner.check_eq(c.clues.size(), 6, "seis pistas")
	runner.check_eq(InvestigationRules.new(c, CaseState.create("x")).suspects().size(), 3, "três suspeitos")
	runner.check_eq(c.decisions.size(), 3, "três decisões")
	runner.check(c.contradictions.size() >= 1, "pelo menos uma comparação de depoimentos")
	runner.check(c.endings.has("correct") and c.endings.has("wrong"), "dois finais")


func test_every_decision_path_is_solvable() -> void:
	var c := _case()
	var policies := CaseSolver.all_policies(c)
	runner.check_eq(policies.size(), 8, "2 × 2 × 2 combinações de decisões")
	for p in policies:
		var s := CaseSolver.explore(c, p)
		var label := JSON.stringify(p)
		runner.check_eq(s.clues.size(), 6, "todas as pistas encontráveis com " + label)
		runner.check_eq(s.contradictions.size(), 4, "todas as contradições encontráveis com " + label)
		runner.check(InvestigationRules.new(c, s).can_accuse(), "acusação disponível com " + label)
		runner.check(s.has_flag("rafael_confessou"), "Rafael explica a mentira com " + label)


func test_key_clue_changes_interpretation() -> void:
	# A pista que muda a leitura: foto (p3) × ficha (p4).
	var c := _case()
	var s := CaseState.create("case_001")
	s.clues = ["p3", "p4"]
	var r := InvestigationRules.new(c, s).compare("p4", "p3")
	runner.check(r.found and r.id == "x2", "foto × ficha revela a cópia")


func test_wrong_pair_explains_why() -> void:
	var c := _case()
	var r := InvestigationRules.new(c, CaseState.create("case_001")).compare("s_bia_caderno", "s_rafael_bia")
	runner.check(not r.found, "pedir ≠ tocar: não é contradição")
	runner.check("pedir" in r.text, "o jogo explica por que não há contradição")


func test_decision_d1_changes_how_photo_is_obtained() -> void:
	var c := _case()
	var told := CaseState.create("case_001")
	var rules := InvestigationRules.new(c, told)
	rules.state.decide("d1", "contar")
	rules.state.apply({"type": "flag", "id": "equipe_sabe"})
	var ids := []
	for t in rules.available_topics("bia"):
		ids.append(t.id)
	runner.check("b_foto_defensiva" in ids and not "b_foto_aberta" in ids, "contando, Bia fica na defensiva")


func test_accusation_and_scoring() -> void:
	var c := _case()
	runner.check_eq(CaseState.max_score(c), 1150, "pontuação máxima")
	var s := CaseSolver.explore(c, {})
	var rules := InvestigationRules.new(c, s)
	rules.accuse("otavio", ["p3", "p5", "p6"])
	runner.check(s.accusation.correct, "Otávio é o culpado")
	runner.check_eq(s.score(c), 1150, "pontuação completa com acusação e evidências certas")
	var s2 := CaseSolver.explore(c, {})
	InvestigationRules.new(c, s2).accuse("rafael", ["p1", "p2", "p5"])
	runner.check(not s2.accusation.correct, "acusar Rafael é o final errado")
	runner.check_eq(s2.score(c), 700 + 100, "pistas e contradições contam; só evidências relevantes somam")


func test_validator_catches_broken_case() -> void:
	var c := _case()
	c.contradictions[0].b = "p99"
	c.dialogues.bia.topics[0].condition = {"clue": "nao_existe"}
	c.accusation.culprit = "helena"
	var errors := CaseValidator.validate(c)
	runner.check(errors.size() >= 3, "deveria acusar 3 erros, acusou %d" % errors.size())


func test_hints_follow_progress() -> void:
	var c := _case()
	var s := CaseState.create("case_001")
	var rules := InvestigationRules.new(c, s)
	runner.check("Rafael" in rules.peek_hint(), "primeira dica aponta o Rafael")
	runner.check_eq(rules.free_hints_left(), 3, "3 dicas grátis")
	rules.use_hint()
	runner.check_eq(rules.free_hints_left(), 2, "dica usada")
