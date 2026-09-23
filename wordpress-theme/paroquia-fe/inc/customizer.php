<?php
/**
 * Personalizador (Customizer): dados da paróquia, cores e textos da home.
 *
 * @package Paroquia_Fe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function paroquiafe_customize_register( $wp_customize ) {

	/* ---------- Painel geral da paróquia ---------- */
	$wp_customize->add_panel( 'paroquiafe_painel', array(
		'title'    => __( 'Configurações da Paróquia', 'paroquia-fe' ),
		'priority' => 30,
	) );

	// Seção: Informações de contato.
	$wp_customize->add_section( 'paroquiafe_contato', array(
		'title' => __( 'Informações de Contato', 'paroquia-fe' ),
		'panel' => 'paroquiafe_painel',
	) );

	$campos_contato = array(
		'endereco'   => __( 'Endereço completo', 'paroquia-fe' ),
		'telefone'   => __( 'Telefone', 'paroquia-fe' ),
		'whatsapp'   => __( 'WhatsApp (somente números, com DDI)', 'paroquia-fe' ),
		'email'      => __( 'E-mail', 'paroquia-fe' ),
		'mapa_embed' => __( 'URL do Google Maps (embed)', 'paroquia-fe' ),
	);
	foreach ( $campos_contato as $id => $rotulo ) {
		$wp_customize->add_setting( 'paroquiafe_' . $id, array(
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => '',
		) );
		$wp_customize->add_control( 'paroquiafe_' . $id, array(
			'label'   => $rotulo,
			'section' => 'paroquiafe_contato',
			'type'    => 'text',
		) );
	}

	// Seção: Redes sociais.
	$wp_customize->add_section( 'paroquiafe_redes_sociais', array(
		'title' => __( 'Redes Sociais', 'paroquia-fe' ),
		'panel' => 'paroquiafe_painel',
	) );

	$redes = array(
		'facebook'  => 'Facebook',
		'instagram' => 'Instagram',
		'youtube'   => 'YouTube',
	);
	foreach ( $redes as $id => $rotulo ) {
		$wp_customize->add_setting( 'paroquiafe_' . $id, array(
			'sanitize_callback' => 'esc_url_raw',
			'default'           => '',
		) );
		$wp_customize->add_control( 'paroquiafe_' . $id, array(
			'label'   => sprintf( __( 'Link do %s', 'paroquia-fe' ), $rotulo ),
			'section' => 'paroquiafe_redes_sociais',
			'type'    => 'url',
		) );
	}

	// Seção: Página inicial (banner).
	$wp_customize->add_section( 'paroquiafe_home', array(
		'title' => __( 'Página Inicial', 'paroquia-fe' ),
		'panel' => 'paroquiafe_painel',
	) );

	$wp_customize->add_setting( 'paroquiafe_banner_titulo', array(
		'sanitize_callback' => 'sanitize_text_field',
		'default'           => __( 'Paróquia São José', 'paroquia-fe' ),
	) );
	$wp_customize->add_control( 'paroquiafe_banner_titulo', array(
		'label'   => __( 'Título do banner principal', 'paroquia-fe' ),
		'section' => 'paroquiafe_home',
		'type'    => 'text',
	) );

	$wp_customize->add_setting( 'paroquiafe_banner_subtitulo', array(
		'sanitize_callback' => 'sanitize_text_field',
		'default'           => __( 'Uma comunidade de fé, esperança e caridade', 'paroquia-fe' ),
	) );
	$wp_customize->add_control( 'paroquiafe_banner_subtitulo', array(
		'label'   => __( 'Subtítulo do banner principal', 'paroquia-fe' ),
		'section' => 'paroquiafe_home',
		'type'    => 'text',
	) );

	$wp_customize->add_setting( 'paroquiafe_banner_imagem', array(
		'sanitize_callback' => 'esc_url_raw',
	) );
	$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'paroquiafe_banner_imagem', array(
		'label'   => __( 'Imagem do banner principal', 'paroquia-fe' ),
		'section' => 'paroquiafe_home',
	) ) );

	$wp_customize->add_setting( 'paroquiafe_texto_sobre', array(
		'sanitize_callback' => 'wp_kses_post',
		'default'           => __( 'Escreva aqui um breve texto de boas-vindas sobre a história e a missão da sua paróquia.', 'paroquia-fe' ),
	) );
	$wp_customize->add_control( 'paroquiafe_texto_sobre', array(
		'label'   => __( 'Texto de apresentação (seção "Sobre")', 'paroquia-fe' ),
		'section' => 'paroquiafe_home',
		'type'    => 'textarea',
	) );

	// Seção: Doações / Dízimo.
	$wp_customize->add_section( 'paroquiafe_doacoes', array(
		'title' => __( 'Doações e Dízimo', 'paroquia-fe' ),
		'panel' => 'paroquiafe_painel',
	) );

	$wp_customize->add_setting( 'paroquiafe_doacoes_ativo', array(
		'sanitize_callback' => 'paroquiafe_sanitize_checkbox',
		'default'           => false,
	) );
	$wp_customize->add_control( 'paroquiafe_doacoes_ativo', array(
		'label'   => __( 'Exibir seção de doações/dízimo na página inicial', 'paroquia-fe' ),
		'section' => 'paroquiafe_doacoes',
		'type'    => 'checkbox',
	) );

	$wp_customize->add_setting( 'paroquiafe_doacoes_texto', array(
		'sanitize_callback' => 'wp_kses_post',
		'default'           => __( 'Sua contribuição ajuda a manter as atividades e obras sociais da nossa paróquia.', 'paroquia-fe' ),
	) );
	$wp_customize->add_control( 'paroquiafe_doacoes_texto', array(
		'label'   => __( 'Texto da seção de doações', 'paroquia-fe' ),
		'section' => 'paroquiafe_doacoes',
		'type'    => 'textarea',
	) );

	$wp_customize->add_setting( 'paroquiafe_doacoes_link', array(
		'sanitize_callback' => 'esc_url_raw',
		'default'           => '',
	) );
	$wp_customize->add_control( 'paroquiafe_doacoes_link', array(
		'label'       => __( 'Link do botão de doação (Pix/plataforma de pagamento)', 'paroquia-fe' ),
		'section'     => 'paroquiafe_doacoes',
		'type'        => 'url',
	) );

	$wp_customize->add_setting( 'paroquiafe_chave_pix', array(
		'sanitize_callback' => 'sanitize_text_field',
		'default'           => '',
	) );
	$wp_customize->add_control( 'paroquiafe_chave_pix', array(
		'label'   => __( 'Chave Pix', 'paroquia-fe' ),
		'section' => 'paroquiafe_doacoes',
		'type'    => 'text',
	) );

	/* ---------- Cores ---------- */
	$wp_customize->add_setting( 'paroquiafe_cor_primaria', array(
		'sanitize_callback' => 'sanitize_hex_color',
		'default'           => '#6b1d2e',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'paroquiafe_cor_primaria', array(
		'label'   => __( 'Cor Primária (ex: vinho litúrgico)', 'paroquia-fe' ),
		'section' => 'colors',
	) ) );

	$wp_customize->add_setting( 'paroquiafe_cor_destaque', array(
		'sanitize_callback' => 'sanitize_hex_color',
		'default'           => '#c8a24a',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'paroquiafe_cor_destaque', array(
		'label'   => __( 'Cor de Destaque (ex: dourado)', 'paroquia-fe' ),
		'section' => 'colors',
	) ) );
}
add_action( 'customize_register', 'paroquiafe_customize_register' );

function paroquiafe_sanitize_checkbox( $checked ) {
	return ( isset( $checked ) && true === (bool) $checked ) ? true : false;
}

/**
 * Imprime as cores escolhidas no Personalizador como CSS custom properties.
 */
function paroquiafe_customizer_css() {
	$primaria = get_theme_mod( 'paroquiafe_cor_primaria', '#6b1d2e' );
	$destaque = get_theme_mod( 'paroquiafe_cor_destaque', '#c8a24a' );
	?>
	<style id="paroquiafe-customizer-css">
		:root {
			--pf-cor-primaria: <?php echo esc_html( $primaria ); ?>;
			--pf-cor-destaque: <?php echo esc_html( $destaque ); ?>;
		}
	</style>
	<?php
}
add_action( 'wp_head', 'paroquiafe_customizer_css' );
