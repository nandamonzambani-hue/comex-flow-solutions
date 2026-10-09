extends SceneTree
## Executor de testes simples, sem plugins.
## Rode no terminal, a partir da pasta CaminhosDaFe:
##   godot --headless -s res://tests/run_tests.gd
## Cada arquivo tests/test_*.gd tem funções test_*(). O processo termina com
## código 0 se tudo passar e 1 se algo falhar (útil para automação).

var failures := 0
var passed := 0
var _current := ""


func _initialize() -> void:
	var files := DirAccess.get_files_at("res://tests/")
	files.sort()
	for f in files:
		if f.begins_with("test_") and f.ends_with(".gd"):
			_run_file("res://tests/" + f)
	print("\n%d testes passaram, %d falharam." % [passed, failures])
	quit(1 if failures > 0 else 0)


func _run_file(path: String) -> void:
	var script: GDScript = load(path)
	if script == null:
		failures += 1
		printerr("FALHOU ao carregar ", path)
		return
	var suite = script.new()
	suite.set("runner", self)
	print("\n== ", path.get_file())
	for m in script.get_script_method_list():
		var name: String = m.name
		if not name.begins_with("test_"):
			continue
		_current = name
		var before := failures
		if suite.has_method("before_each"):
			suite.before_each()
		suite.call(name)
		if suite.has_method("after_each"):
			suite.after_each()
		if failures == before:
			passed += 1
			print("  ok  ", name)
	if suite is Node:
		suite.free()


func check(condition: bool, message: String) -> void:
	if not condition:
		failures += 1
		printerr("  FALHOU %s: %s" % [_current, message])


func check_eq(actual, expected, message: String) -> void:
	check(actual == expected, "%s (esperado %s, veio %s)" % [message, str(expected), str(actual)])
