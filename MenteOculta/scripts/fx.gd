class_name Fx
extends RefCounted
## Animações reutilizáveis (entradas, pulsos, partículas).
## Só usam Tween e CPUParticles2D do próprio Godot: leve, sem plugins e sem arquivos extras.

static var _glow_tex: GradientTexture2D


## Bolinha de luz suave (usada nas partículas de vaga-lume e polén).
static func glow_texture() -> Texture2D:
	if _glow_tex == null:
		var g := Gradient.new()
		g.offsets = PackedFloat32Array([0.0, 1.0])
		g.colors = PackedColorArray([Color(1, 1, 1, 1), Color(1, 1, 1, 0)])
		_glow_tex = GradientTexture2D.new()
		_glow_tex.gradient = g
		_glow_tex.fill = GradientTexture2D.FILL_RADIAL
		_glow_tex.fill_from = Vector2(0.5, 0.5)
		_glow_tex.fill_to = Vector2(0.5, 0.0)
		_glow_tex.width = 64
		_glow_tex.height = 64
	return _glow_tex


## Aparece com um leve zoom. Seguro dentro de containers (não mexe na posição).
static func pop_in(c: Control, delay := 0.0, dur := 0.45) -> void:
	if not is_instance_valid(c):
		return
	c.modulate.a = 0.0
	c.scale = Vector2(0.88, 0.88)
	if c.is_inside_tree():
		await c.get_tree().process_frame
	if not is_instance_valid(c) or not c.is_inside_tree():
		return
	c.pivot_offset = c.size / 2.0
	var t := c.create_tween().set_parallel(true)
	t.tween_property(c, "modulate:a", 1.0, dur * 0.7).set_delay(delay)
	t.tween_property(c, "scale", Vector2.ONE, dur).set_delay(delay) \
		.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


## Vários itens, um depois do outro.
static func stagger(nodes: Array, step := 0.08, start := 0.0) -> void:
	var i := 0
	for n in nodes:
		if n is Control:
			pop_in(n, start + i * step)
			i += 1


## Fade simples (para fundos e camadas).
static func fade_in(c: CanvasItem, delay := 0.0, dur := 0.6) -> void:
	if not is_instance_valid(c):
		return
	c.modulate.a = 0.0
	c.create_tween().tween_property(c, "modulate:a", 1.0, dur).set_delay(delay)


## "Respirar": cresce e encolhe devagar, sem parar.
static func breathe(c: Control, amount := 0.03, period := 3.0) -> void:
	if not is_instance_valid(c):
		return
	if c.is_inside_tree():
		await c.get_tree().process_frame
	if not is_instance_valid(c) or not c.is_inside_tree():
		return
	c.pivot_offset = c.size / 2.0
	var t := c.create_tween().set_loops()
	t.tween_property(c, "scale", Vector2.ONE * (1.0 + amount), period / 2.0) \
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	t.tween_property(c, "scale", Vector2.ONE, period / 2.0) \
		.set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)


## Luz que pulsa (opacidade sobe e desce).
static func glow_pulse(c: CanvasItem, low := 0.55, high := 1.0, period := 2.4) -> void:
	if not is_instance_valid(c):
		return
	var t := c.create_tween().set_loops()
	t.tween_property(c, "modulate:a", high, period / 2.0).set_trans(Tween.TRANS_SINE)
	t.tween_property(c, "modulate:a", low, period / 2.0).set_trans(Tween.TRANS_SINE)


## Chacoalhar (resposta errada). Usa rotação, então funciona até dentro de containers.
static func shake(c: Control, strength := 0.05) -> void:
	if not is_instance_valid(c):
		return
	c.pivot_offset = c.size / 2.0
	var t := c.create_tween()
	for a in [strength, -strength, strength * 0.6, -strength * 0.4, 0.0]:
		t.tween_property(c, "rotation", a, 0.05)


## Pulinho de comemoração.
static func hop(c: Control, height := 14.0) -> void:
	if not is_instance_valid(c):
		return
	var y := c.position.y
	var t := c.create_tween()
	t.tween_property(c, "position:y", y - height, 0.1).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)
	t.tween_property(c, "position:y", y, 0.14).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)


## Todo botão encolhe um pouquinho ao toque: dá sensação de "apertar".
static func press_feedback(b: BaseButton) -> void:
	if b.has_meta("fx_press") or b.get_meta("no_press", false):
		return
	b.set_meta("fx_press", true)
	b.button_down.connect(func():
		if b.get_meta("no_press", false):
			return
		b.pivot_offset = b.size / 2.0
		b.create_tween().tween_property(b, "scale", Vector2(0.96, 0.96), 0.07))
	b.button_up.connect(func():
		if b.get_meta("no_press", false):
			return
		b.create_tween().tween_property(b, "scale", Vector2.ONE, 0.16) \
			.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT))


## Partículas leves de ambiente ("fireflies", "pollen" ou "stars"). Cobre o controle inteiro.
static func ambient(parent: Control, kind := "fireflies") -> CPUParticles2D:
	var p := CPUParticles2D.new()
	var mat := CanvasItemMaterial.new()
	mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	p.material = mat
	p.texture = glow_texture()
	p.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	p.direction = Vector2(0, -1)
	p.spread = 60.0
	var tint := Color(1.0, 0.86, 0.45)
	match kind:
		"pollen":
			p.amount = 26
			p.lifetime = 9.0
			p.initial_velocity_min = 4.0
			p.initial_velocity_max = 14.0
			p.gravity = Vector2(8, -3)
			p.scale_amount_min = 0.08
			p.scale_amount_max = 0.22
			tint = Color(1.0, 0.95, 0.75)
		"dust":
			p.amount = 34
			p.lifetime = 10.0
			p.initial_velocity_min = 2.0
			p.initial_velocity_max = 9.0
			p.gravity = Vector2(3, -2)
			p.scale_amount_min = 0.05
			p.scale_amount_max = 0.14
			tint = Color(1.0, 0.82, 0.5)
		"stars":
			p.amount = 40
			p.lifetime = 5.0
			p.initial_velocity_min = 0.0
			p.initial_velocity_max = 3.0
			p.gravity = Vector2.ZERO
			p.scale_amount_min = 0.05
			p.scale_amount_max = 0.16
			tint = Color(0.85, 0.9, 1.0)
		_:
			p.amount = 16
			p.lifetime = 7.0
			p.initial_velocity_min = 6.0
			p.initial_velocity_max = 20.0
			p.gravity = Vector2(0, -6)
			p.scale_amount_min = 0.12
			p.scale_amount_max = 0.32
	p.preprocess = p.lifetime
	var g := Gradient.new()
	g.offsets = PackedFloat32Array([0.0, 0.2, 0.8, 1.0])
	g.colors = PackedColorArray([Color(1, 1, 1, 0), Color(1, 1, 1, 0.9), Color(1, 1, 1, 0.9), Color(1, 1, 1, 0)])
	p.color_ramp = g
	p.color = tint
	var fit := func():
		p.position = parent.size / 2.0
		p.emission_rect_extents = parent.size / 2.0
	parent.resized.connect(fit)
	parent.add_child(p)
	fit.call()
	p.emitting = true
	return p


## Explosão de confete (uma vez só). Libera a memória sozinho.
static func confetti(parent: Control, at: Vector2, amount := 70) -> void:
	var p := CPUParticles2D.new()
	p.position = at
	p.one_shot = true
	p.explosiveness = 0.95
	p.amount = amount
	p.lifetime = 2.4
	p.direction = Vector2(0, -1)
	p.spread = 75.0
	p.initial_velocity_min = 380.0
	p.initial_velocity_max = 820.0
	p.gravity = Vector2(0, 1100)
	p.angular_velocity_min = -540.0
	p.angular_velocity_max = 540.0
	p.scale_amount_min = 7.0
	p.scale_amount_max = 13.0
	var g := Gradient.new()
	g.offsets = PackedFloat32Array([0.0, 0.25, 0.5, 0.75, 1.0])
	g.colors = PackedColorArray([
		Color("e0a43a"), Color("c8553d"), Color("5e8c4a"), Color("2c4f8c"), Color("f4e3b0")])
	p.color_initial_ramp = g
	var fade := Gradient.new()
	fade.offsets = PackedFloat32Array([0.0, 0.7, 1.0])
	fade.colors = PackedColorArray([Color(1, 1, 1, 1), Color(1, 1, 1, 1), Color(1, 1, 1, 0)])
	p.color_ramp = fade
	parent.add_child(p)
	p.emitting = true
	p.finished.connect(p.queue_free)
