class_name DiaryView
extends RefCounted
## Diário de descobertas: lista os registros liberados, com o tipo (ficção, Bíblia,
## ensinamento, santo) sempre visível para separar história inventada de fatos.

const KIND_ICON := {"fiction": "house", "teaching": "church", "scripture": "book", "saint": "star", "sources": "check"}


static func open(parent: Node, chapter: Dictionary, unlocked: Array) -> void:
	var body := UiKit.overlay(parent, 660)
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 12)
	head.add_child(UiKit.icon_rect("book", 48, GameManager.COLORS.blue))
	var title := UiKit.label(TranslationServer.translate("DIARY"), "HeadingLabel", false)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(title)
	body.add_child(head)
	var shown := 0
	for entry in chapter.get("diary", []):
		if not entry.id in unlocked:
			continue
		shown += 1
		var card := PanelContainer.new()
		card.theme_type_variation = "SoftPanel"
		var col := VBoxContainer.new()
		col.add_theme_constant_override("separation", 10)
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		row.add_child(UiKit.icon_rect(KIND_ICON.get(entry.kind, "book"), 32, GameManager.COLORS.gold))
		row.add_child(UiKit.badge(TranslationServer.translate("KIND_" + entry.kind)))
		col.add_child(row)
		col.add_child(UiKit.label(entry.title, "StrongLabel"))
		col.add_child(UiKit.label(entry.body))
		col.add_child(SourceList.build(entry.get("sources", [])))
		card.add_child(col)
		body.add_child(card)
	if shown == 0:
		body.add_child(UiKit.label(TranslationServer.translate("DIARY_EMPTY"), "MutedLabel"))
	var close := UiKit.button(TranslationServer.translate("CLOSE"))
	close.pressed.connect(func(): UiKit.close_overlay(body))
	body.add_child(close)
