extends Control
## Menu inicial: começar/continuar o caso, reiniciar, configurações e "sobre".
## Os sinais dos botões são conectados por código em _ready() (veja o README
## para fazer o mesmo pela aba Nó > Sinais do editor).

var _entry: Dictionary = {}


func _ready() -> void:
	for e in CaseLoader.case_index():
		if e.get("status") == "available":
			_entry = e
			break
	var data := CaseLoader.read_json(CaseLoader.DATA_DIR + _entry.get("file", ""))
	%CaseBadge.text = tr("CASE_LABEL") % 1
	%CaseTitle.text = data.get("title", "")
	%CaseDescription.text = data.get("description", "")
	var best := GameManager.best_result(_entry.get("id", ""))
	var footer := tr("COMING_SOON")
	if not best.is_empty():
		footer = tr("BEST_RESULT") % int(best.score) + "\n" + footer
	%Footer.text = footer

	var in_progress := GameManager.has_progress(_entry.get("id", ""))
	%PlayButton.text = tr("CONTINUE_CASE") if in_progress else tr("START_CASE")
	%RestartButton.visible = in_progress
	%PlayButton.pressed.connect(_play.bind(false))
	%RestartButton.pressed.connect(func():
		UiKit.confirm(self, tr("CONFIRM_RESTART"), tr("YES_RESTART"), _play.bind(true)))
	%SettingsButton.pressed.connect(_open_settings)
	%AboutButton.pressed.connect(_open_about)
	%PlayButton.grab_focus()
	_animate_intro()
	var top := GameManager.safe_top_margin(self)
	if top > 0:
		%Margin.add_theme_constant_override("margin_top", 150 + top)


func _play(restart: bool) -> void:
	var opened := GameManager.open_case(_entry, restart)
	print("DEBUG open_case:", opened, GameManager.load_errors)
	if opened:
		GameManager.goto("investigation")
		return
	var body := UiKit.overlay(self)
	body.add_child(UiKit.label(tr("CASE_ERROR"), "StrongLabel"))
	var text := ""
	for e in GameManager.load_errors.slice(0, 8):
		text += "• " + e + "\n"
	body.add_child(UiKit.label(text, "MutedLabel"))
	var ok := UiKit.button(tr("CLOSE"))
	ok.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(ok)


func _open_settings() -> void:
	var body := UiKit.overlay(self)
	body.add_child(UiKit.label(tr("SETTINGS"), "HeadingLabel"))
	body.add_child(UiKit.label(tr("LANGUAGE"), "StrongLabel"))
	var langs := HBoxContainer.new()
	langs.add_theme_constant_override("separation", 8)
	for item in [["pt_BR", "Português"], ["es", "Español"], ["en", "English"]]:
		var b := UiKit.button(item[1], "" if TranslationServer.get_locale() == item[0] else "SecondaryButton")
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.pressed.connect(func():
			GameManager.set_locale(item[0])
			UiKit.close_overlay(body)
			get_tree().reload_current_scene())
		langs.add_child(b)
	body.add_child(langs)
	if TranslationServer.get_locale() != "pt_BR":
		body.add_child(UiKit.label(tr("CONTENT_NOTICE"), "MutedLabel"))
	body.add_child(UiKit.label(tr("TEXT_SIZE"), "StrongLabel"))
	var sizes := HBoxContainer.new()
	sizes.add_theme_constant_override("separation", 8)
	for item in [["normal", "TEXT_NORMAL"], ["large", "TEXT_LARGE"]]:
		var b := UiKit.button(tr(item[1]), "" if GameManager.get_setting("text_size") == item[0] else "SecondaryButton")
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.pressed.connect(func():
			GameManager.set_text_size(item[0])
			UiKit.close_overlay(body)
			_open_settings())
		sizes.add_child(b)
	body.add_child(sizes)
	var close := UiKit.button(tr("CLOSE"), "GhostButton")
	close.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(close)


func _open_about() -> void:
	var body := UiKit.overlay(self)
	body.add_child(UiKit.label(tr("ABOUT"), "HeadingLabel"))
	body.add_child(UiKit.label(tr("ABOUT_TEXT")))
	var close := UiKit.button(tr("CLOSE"))
	close.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(close)


## Entrada com clima: fundo respirando, poeira na luz e blocos surgindo em sequência.
func _animate_intro() -> void:
	Fx.breathe($Background, 0.06, 20.0)
	Fx.ambient(self, "dust")
	var column: VBoxContainer = $Margin/Column
	var items: Array = []
	for c in column.get_children():
		if c is Control and c.visible and c.name != "Spacer":
			items.append(c)
	Fx.stagger(items, 0.11, 0.1)
