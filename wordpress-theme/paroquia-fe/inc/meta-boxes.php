<?php
/**
 * Meta boxes simples (sem dependências externas) para os CPTs do tema.
 *
 * @package Paroquia_Fe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registro das meta boxes.
 */
function paroquiafe_add_meta_boxes() {
	add_meta_box( 'paroquiafe_evento_dados', __( 'Dados do Evento', 'paroquia-fe' ), 'paroquiafe_render_evento_meta_box', 'evento', 'normal', 'high' );
	add_meta_box( 'paroquiafe_horario_dados', __( 'Dados do Horário', 'paroquia-fe' ), 'paroquiafe_render_horario_meta_box', 'horario_missa', 'normal', 'high' );
	add_meta_box( 'paroquiafe_clero_dados', __( 'Cargo e Contato', 'paroquia-fe' ), 'paroquiafe_render_clero_meta_box', 'clero', 'normal', 'high' );
	add_meta_box( 'paroquiafe_pagina_layout', __( 'Layout da Página', 'paroquia-fe' ), 'paroquiafe_render_pagina_layout_meta_box', 'page', 'side', 'default' );
}
add_action( 'add_meta_boxes', 'paroquiafe_add_meta_boxes' );

/**
 * Campo de data/hora + local para Eventos.
 */
function paroquiafe_render_evento_meta_box( $post ) {
	wp_nonce_field( 'paroquiafe_salvar_evento', 'paroquiafe_evento_nonce' );

	$data_inicio = get_post_meta( $post->ID, '_evento_data_inicio', true );
	$hora        = get_post_meta( $post->ID, '_evento_hora', true );
	$local       = get_post_meta( $post->ID, '_evento_local', true );
	?>
	<p>
		<label for="evento_data_inicio"><strong><?php esc_html_e( 'Data', 'paroquia-fe' ); ?></strong></label><br />
		<input type="date" id="evento_data_inicio" name="evento_data_inicio" value="<?php echo esc_attr( $data_inicio ); ?>" />
	</p>
	<p>
		<label for="evento_hora"><strong><?php esc_html_e( 'Horário', 'paroquia-fe' ); ?></strong></label><br />
		<input type="time" id="evento_hora" name="evento_hora" value="<?php echo esc_attr( $hora ); ?>" />
	</p>
	<p>
		<label for="evento_local"><strong><?php esc_html_e( 'Local', 'paroquia-fe' ); ?></strong></label><br />
		<input type="text" id="evento_local" name="evento_local" class="widefat" value="<?php echo esc_attr( $local ); ?>" placeholder="<?php esc_attr_e( 'Ex: Igreja Matriz / Salão Paroquial', 'paroquia-fe' ); ?>" />
	</p>
	<?php
}

/**
 * Campos de dia da semana + hora + local + tipo para Horários de Missa.
 */
function paroquiafe_render_horario_meta_box( $post ) {
	wp_nonce_field( 'paroquiafe_salvar_horario', 'paroquiafe_horario_nonce' );

	$dia   = get_post_meta( $post->ID, '_horario_dia', true );
	$hora  = get_post_meta( $post->ID, '_horario_hora', true );
	$local = get_post_meta( $post->ID, '_horario_local', true );
	$tipo  = get_post_meta( $post->ID, '_horario_tipo', true );

	$dias = array(
		'domingo'      => __( 'Domingo', 'paroquia-fe' ),
		'segunda'      => __( 'Segunda-feira', 'paroquia-fe' ),
		'terca'        => __( 'Terça-feira', 'paroquia-fe' ),
		'quarta'       => __( 'Quarta-feira', 'paroquia-fe' ),
		'quinta'       => __( 'Quinta-feira', 'paroquia-fe' ),
		'sexta'        => __( 'Sexta-feira', 'paroquia-fe' ),
		'sabado'       => __( 'Sábado', 'paroquia-fe' ),
	);
	?>
	<p>
		<label for="horario_dia"><strong><?php esc_html_e( 'Dia da Semana', 'paroquia-fe' ); ?></strong></label><br />
		<select id="horario_dia" name="horario_dia">
			<?php foreach ( $dias as $valor => $rotulo ) : ?>
				<option value="<?php echo esc_attr( $valor ); ?>" <?php selected( $dia, $valor ); ?>><?php echo esc_html( $rotulo ); ?></option>
			<?php endforeach; ?>
		</select>
	</p>
	<p>
		<label for="horario_hora"><strong><?php esc_html_e( 'Horário', 'paroquia-fe' ); ?></strong></label><br />
		<input type="time" id="horario_hora" name="horario_hora" value="<?php echo esc_attr( $hora ); ?>" />
	</p>
	<p>
		<label for="horario_local"><strong><?php esc_html_e( 'Local', 'paroquia-fe' ); ?></strong></label><br />
		<input type="text" id="horario_local" name="horario_local" class="widefat" value="<?php echo esc_attr( $local ); ?>" placeholder="<?php esc_attr_e( 'Ex: Igreja Matriz / Capela São José', 'paroquia-fe' ); ?>" />
	</p>
	<p>
		<label for="horario_tipo"><strong><?php esc_html_e( 'Observação/Tipo', 'paroquia-fe' ); ?></strong></label><br />
		<input type="text" id="horario_tipo" name="horario_tipo" class="widefat" value="<?php echo esc_attr( $tipo ); ?>" placeholder="<?php esc_attr_e( 'Ex: Missa com Terço / Missa das Crianças', 'paroquia-fe' ); ?>" />
	</p>
	<?php
}

/**
 * Campos de cargo, telefone e e-mail para membros do clero/equipe.
 */
function paroquiafe_render_clero_meta_box( $post ) {
	wp_nonce_field( 'paroquiafe_salvar_clero', 'paroquiafe_clero_nonce' );

	$cargo    = get_post_meta( $post->ID, '_clero_cargo', true );
	$telefone = get_post_meta( $post->ID, '_clero_telefone', true );
	$email    = get_post_meta( $post->ID, '_clero_email', true );
	?>
	<p>
		<label for="clero_cargo"><strong><?php esc_html_e( 'Cargo/Função', 'paroquia-fe' ); ?></strong></label><br />
		<input type="text" id="clero_cargo" name="clero_cargo" class="widefat" value="<?php echo esc_attr( $cargo ); ?>" placeholder="<?php esc_attr_e( 'Ex: Pároco / Vigário / Diácono', 'paroquia-fe' ); ?>" />
	</p>
	<p>
		<label for="clero_telefone"><strong><?php esc_html_e( 'Telefone', 'paroquia-fe' ); ?></strong></label><br />
		<input type="text" id="clero_telefone" name="clero_telefone" class="widefat" value="<?php echo esc_attr( $telefone ); ?>" />
	</p>
	<p>
		<label for="clero_email"><strong><?php esc_html_e( 'E-mail', 'paroquia-fe' ); ?></strong></label><br />
		<input type="email" id="clero_email" name="clero_email" class="widefat" value="<?php echo esc_attr( $email ); ?>" />
	</p>
	<?php
}

/**
 * Campo "página em largura total, sem barra lateral".
 */
function paroquiafe_render_pagina_layout_meta_box( $post ) {
	wp_nonce_field( 'paroquiafe_salvar_pagina_layout', 'paroquiafe_pagina_layout_nonce' );
	$largura_total = get_post_meta( $post->ID, '_pf_largura_total', true );
	?>
	<label>
		<input type="checkbox" name="pf_largura_total" value="1" <?php checked( $largura_total, '1' ); ?> />
		<?php esc_html_e( 'Exibir em largura total (sem barra lateral)', 'paroquia-fe' ); ?>
	</label>
	<?php
}

/**
 * Salva os meta dados com verificação de nonce, capacidade e autosave.
 */
function paroquiafe_salvar_meta_boxes( $post_id ) {
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$post_type = get_post_type( $post_id );

	if ( 'evento' === $post_type
		&& isset( $_POST['paroquiafe_evento_nonce'] )
		&& wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['paroquiafe_evento_nonce'] ) ), 'paroquiafe_salvar_evento' )
		&& current_user_can( 'edit_post', $post_id )
	) {
		if ( isset( $_POST['evento_data_inicio'] ) ) {
			update_post_meta( $post_id, '_evento_data_inicio', sanitize_text_field( wp_unslash( $_POST['evento_data_inicio'] ) ) );
		}
		if ( isset( $_POST['evento_hora'] ) ) {
			update_post_meta( $post_id, '_evento_hora', sanitize_text_field( wp_unslash( $_POST['evento_hora'] ) ) );
		}
		if ( isset( $_POST['evento_local'] ) ) {
			update_post_meta( $post_id, '_evento_local', sanitize_text_field( wp_unslash( $_POST['evento_local'] ) ) );
		}
	}

	if ( 'horario_missa' === $post_type
		&& isset( $_POST['paroquiafe_horario_nonce'] )
		&& wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['paroquiafe_horario_nonce'] ) ), 'paroquiafe_salvar_horario' )
		&& current_user_can( 'edit_post', $post_id )
	) {
		if ( isset( $_POST['horario_dia'] ) ) {
			update_post_meta( $post_id, '_horario_dia', sanitize_text_field( wp_unslash( $_POST['horario_dia'] ) ) );
		}
		if ( isset( $_POST['horario_hora'] ) ) {
			update_post_meta( $post_id, '_horario_hora', sanitize_text_field( wp_unslash( $_POST['horario_hora'] ) ) );
		}
		if ( isset( $_POST['horario_local'] ) ) {
			update_post_meta( $post_id, '_horario_local', sanitize_text_field( wp_unslash( $_POST['horario_local'] ) ) );
		}
		if ( isset( $_POST['horario_tipo'] ) ) {
			update_post_meta( $post_id, '_horario_tipo', sanitize_text_field( wp_unslash( $_POST['horario_tipo'] ) ) );
		}
	}

	if ( 'clero' === $post_type
		&& isset( $_POST['paroquiafe_clero_nonce'] )
		&& wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['paroquiafe_clero_nonce'] ) ), 'paroquiafe_salvar_clero' )
		&& current_user_can( 'edit_post', $post_id )
	) {
		if ( isset( $_POST['clero_cargo'] ) ) {
			update_post_meta( $post_id, '_clero_cargo', sanitize_text_field( wp_unslash( $_POST['clero_cargo'] ) ) );
		}
		if ( isset( $_POST['clero_telefone'] ) ) {
			update_post_meta( $post_id, '_clero_telefone', sanitize_text_field( wp_unslash( $_POST['clero_telefone'] ) ) );
		}
		if ( isset( $_POST['clero_email'] ) ) {
			update_post_meta( $post_id, '_clero_email', sanitize_email( wp_unslash( $_POST['clero_email'] ) ) );
		}
	}

	if ( 'page' === $post_type
		&& isset( $_POST['paroquiafe_pagina_layout_nonce'] )
		&& wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['paroquiafe_pagina_layout_nonce'] ) ), 'paroquiafe_salvar_pagina_layout' )
		&& current_user_can( 'edit_post', $post_id )
	) {
		update_post_meta( $post_id, '_pf_largura_total', isset( $_POST['pf_largura_total'] ) ? '1' : '' );
	}
}
add_action( 'save_post', 'paroquiafe_salvar_meta_boxes' );
