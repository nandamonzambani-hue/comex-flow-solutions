extends Control
## Menu inicial: jogar, configurações (idioma, tamanho do texto, apagar progresso) e "sobre".
## Os sinais dos botões são conectados em _ready() com .pressed.connect(...).
## (No editor, o mesmo pode ser feito pela aba Nó > Sinais.)

@onready var play_button: Button = %PlayButton
@onready var settings_button: Button = %SettingsButton
@onready var about_button: Button = %AboutButton


func _ready() -> void:
	play_button.pressed.connect(_on_play)
	settings_button.pressed.connect(_open_settings)
	about_button.pressed.connect(_open_about)
	%Version.text = "v" + str(ProjectSettings.get_setting("application/config/version"))
	_refresh()
	play_button.grab_focus()
	_animate_intro()


## Entrada animada: fundo "respirando", título e botões surgindo um a um, vaga-lumes.
func _animate_intro() -> void:
	Fx.breathe($Background, 0.07, 22.0)
	Fx.ambient(self, "fireflies")
	var column: VBoxContainer = $Margin/Column
	Fx.stagger([column.get_node("Title"), column.get_node("Tagline"), play_button, settings_button, about_button], 0.12, 0.15)


func _refresh() -> void:
	var started := false
	for c in ProgressManager.data.chapters.values():
		if c.get("status", "not_started") != "not_started":
			started = true
	play_button.text = tr("MENU_CONTINUE") if started else tr("MENU_PLAY")


func _on_play() -> void:
	GameManager.goto("map")


func _open_settings() -> void:
	var body := UiKit.overlay(self)
	body.add_child(UiKit.label(tr("MENU_SETTINGS"), "HeadingLabel"))

	body.add_child(UiKit.label(tr("SETTINGS_LANGUAGE"), "StrongLabel"))
	var langs := HBoxContainer.new()
	langs.add_theme_constant_override("separation", 10)
	for item in [["pt_BR", "Português"], ["es", "Español"], ["en", "English"]]:
		var b := UiKit.button(item[1], "SecondaryButton" if TranslationServer.get_locale() == item[0] else "GhostButton")
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.pressed.connect(func():
			GameManager.set_locale(item[0])
			UiKit.close_overlay(body)
			get_tree().reload_current_scene())
		langs.add_child(b)
	body.add_child(langs)
	if TranslationServer.get_locale() != "pt_BR":
		body.add_child(UiKit.label(tr("CONTENT_NOTICE"), "MutedLabel"))

	body.add_child(UiKit.label(tr("SETTINGS_TEXT"), "StrongLabel"))
	var sizes := HBoxContainer.new()
	sizes.add_theme_constant_override("separation", 10)
	for item in [["normal", "TEXT_NORMAL"], ["large", "TEXT_LARGE"]]:
		var current: bool = ProgressManager.get_setting("text_size") == item[0]
		var b := UiKit.button(tr(item[1]), "SecondaryButton" if current else "GhostButton")
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.pressed.connect(func():
			GameManager.set_text_size(item[0])
			UiKit.close_overlay(body)
			_open_settings())
		sizes.add_child(b)
	body.add_child(sizes)

	var reset := UiKit.button(tr("SETTINGS_RESET"), "GhostButton")
	reset.add_theme_color_override("font_color", GameManager.COLORS.wrong)
	reset.pressed.connect(func():
		UiKit.confirm(self, tr("CONFIRM_RESET_ALL"), tr("CONFIRM_YES_ERASE"), func():
			ProgressManager.reset_all()
			UiKit.close_overlay(body)
			UiKit.toast(self, tr("PROGRESS_ERASED"))
			_refresh()))
	body.add_child(reset)

	var close := UiKit.button(tr("CLOSE"))
	close.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(close)


func _open_about() -> void:
	var body := UiKit.overlay(self)
	body.add_child(UiKit.label(tr("MENU_ABOUT"), "HeadingLabel"))
	body.add_child(UiKit.label(tr("ABOUT_TEXT")))
	var close := UiKit.button(tr("CLOSE"))
	close.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(close)
	close.grab_focus.call_deferred()
