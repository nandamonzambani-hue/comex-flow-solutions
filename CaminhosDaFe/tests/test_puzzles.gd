extends RefCounted
## Regras dos três desafios.

var runner


func _challenge(id: String) -> Dictionary:
	var chapter: Dictionary = load("res://scripts/content_loader.gd").read_json("res://data/chapter_001.json")
	return chapter.challenges[id].data


func test_assignment_has_single_solution() -> void:
	var p := AssignmentPuzzle.from_data(_challenge("mutirao"))
	runner.check_eq(p.count_solutions(), 1, "o mutirão deve ter uma única solução")


func test_assignment_detects_conflicts() -> void:
	var p := AssignmentPuzzle.from_data(_challenge("mutirao"))
	var right := {"ana": "telhado", "davi": "agua", "rita": "carregar", "caio": "escada"}
	runner.check(p.is_solved(right), "a solução correta deve ser aceita")
	var wrong := {"ana": "carregar", "davi": "agua", "rita": "telhado", "caio": "escada"}
	runner.check(not p.is_solved(wrong), "Rita no telhado contraria uma pista")
	runner.check("rita" in p.conflicts(wrong), "Rita deve aparecer como conflito")
	var repeated := {"ana": "agua", "davi": "agua", "rita": "carregar", "caio": "escada"}
	runner.check("ana" in p.conflicts(repeated) and "davi" in p.conflicts(repeated), "tarefa repetida marca as duas pessoas")
	runner.check(not p.is_solved({"ana": "telhado"}), "atribuição incompleta não resolve")


func test_distribution_rules() -> void:
	var p := DistributionPuzzle.from_data(_challenge("cestas"))
	var sol := p.solution()
	runner.check(p.is_solved(sol), "as necessidades declaradas resolvem o desafio")
	for item in p.items:
		runner.check_eq(p.remaining(sol, item.id), 0, "nenhuma doação pode sobrar: " + item.id)
	var empty := {}
	runner.check_eq(p.unmet(empty).size(), p.households.size(), "cestas vazias não atendem ninguém")
	runner.check(p.can_add(empty, "pao"), "deve ser possível adicionar pão com estoque cheio")


func test_distribution_validation_rejects_wrong_stock() -> void:
	var data := _challenge("cestas")
	data.stock.pao = 99
	runner.check(not DistributionPuzzle.validate(data).is_empty(), "estoque diferente da soma deve ser rejeitado")


func test_pipes_initial_is_unsolved_and_solution_works() -> void:
	var data := _challenge("canal")
	runner.check(PipesPuzzle.validate(data).is_empty(), "dados do canal válidos")
	var p := PipesPuzzle.from_data(data)
	runner.check(not p.is_solved(), "o canal não pode começar resolvido")


func test_pipes_rotation_math() -> void:
	runner.check_eq(PipesPuzzle.rotate_mask(PipesPuzzle.N | PipesPuzzle.E, 1), PipesPuzzle.E | PipesPuzzle.S, "curva girada 90°")
	runner.check_eq(PipesPuzzle.rotate_mask(PipesPuzzle.N | PipesPuzzle.S, 1), PipesPuzzle.E | PipesPuzzle.W, "reta girada 90°")
	runner.check_eq(PipesPuzzle.rotate_mask(PipesPuzzle.W, 1), PipesPuzzle.N, "oeste vira norte")


func test_pipes_solved_by_tapping() -> void:
	var data := _challenge("canal")
	var p := PipesPuzzle.from_data(data)
	var target := PipesPuzzle._parse_rotations(data.solution)
	# Simula os toques do jogador até cada peça do caminho ficar no giro da solução.
	for r in p.rows:
		for c in p.cols:
			var guard := 0
			while p.rotations[r][c] != target[r][c] and guard < 4:
				p.rotate(r, c)
				guard += 1
	runner.check(p.is_solved(), "girando as peças até a solução a água chega à horta")
