class_name SourceList
extends RefCounted
## Lista de fontes de um conteúdo. Fontes com endereço viram links (abrem no navegador,
## o que precisa de internet; o resto do jogo funciona offline).


static func build(source_ids: Array) -> Control:
	var box := VBoxContainer.new()
	if source_ids.is_empty():
		return box
	box.add_theme_constant_override("separation", 4)
	box.add_child(UiKit.label(TranslationServer.translate("SOURCES"), "BadgeLabel"))
	var text := ""
	for sid in source_ids:
		var s: Dictionary = ContentLoader.source(sid)
		if s.is_empty():
			continue
		var title: String = s.title
		if s.has("publisher"):
			title += " (%s)" % s.publisher
		if s.has("url"):
			text += "• [url=%s]%s[/url]\n" % [s.url, title]
		else:
			text += "• %s\n" % title
	var r := UiKit.rich(text.strip_edges())
	r.add_theme_font_size_override("normal_font_size", int(GameManager.base_font_size() * 0.8))
	r.add_theme_color_override("default_color", GameManager.COLORS.muted)
	r.meta_clicked.connect(func(meta): OS.shell_open(str(meta)))
	box.add_child(r)
	return box
