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
	$wp_customize->add_setting( 'paroquiafe_paleta', array(
		'sanitize_callback' => 'paroquiafe_sanitize_paleta',
		'default'           => 'classico',
	) );
	$wp_customize->add_control( 'paroquiafe_paleta', array(
		'label'       => __( 'Paleta de Cores', 'paroquia-fe' ),
		'description' => __( 'Escolha um estilo pronto ou defina suas próprias cores abaixo.', 'paroquia-fe' ),
		'section'     => 'colors',
		'type'        => 'select',
		'choices'     => array(
			'classico'     => __( 'Clássico - Vinho Litúrgico e Dourado', 'paroquia-fe' ),
			'moderno'      => __( 'Moderno Claro - Azul Sereno e Areia', 'paroquia-fe' ),
			'personalizado' => __( 'Personalizado (cores abaixo)', 'paroquia-fe' ),
		),
		'priority' => 5,
	) );

	$wp_customize->add_setting( 'paroquiafe_cor_primaria', array(
		'sanitize_callback' => 'sanitize_hex_color',
		'default'           => '#6b1d2e',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'paroquiafe_cor_primaria', array(
		'label'           => __( 'Cor Primária', 'paroquia-fe' ),
		'section'         => 'colors',
		'active_callback' => function () {
			return 'personalizado' === get_theme_mod( 'paroquiafe_paleta', 'classico' );
		},
	) ) );

	$wp_customize->add_setting( 'paroquiafe_cor_destaque', array(
		'sanitize_callback' => 'sanitize_hex_color',
		'default'           => '#c8a24a',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'paroquiafe_cor_destaque', array(
		'label'           => __( 'Cor de Destaque', 'paroquia-fe' ),
		'section'         => 'colors',
		'active_callback' => function () {
			return 'personalizado' === get_theme_mod( 'paroquiafe_paleta', 'classico' );
		},
	) ) );
}
add_action( 'customize_register', 'paroquiafe_customize_register' );

function paroquiafe_sanitize_checkbox( $checked ) {
	return ( isset( $checked ) && true === (bool) $checked ) ? true : false;
}

function paroquiafe_sanitize_paleta( $valor ) {
	$permitidos = array( 'classico', 'moderno', 'personalizado' );
	return in_array( $valor, $permitidos, true ) ? $valor : 'classico';
}

/**
 * Paletas de cores prontas do tema.
 *
 * @return array<string, array<string, string>>
 */
function paroquiafe_get_paletas() {
	return array(
		'classico' => array(
			'primaria'        => '#6b1d2e',
			'primaria_escura' => '#4a1420',
			'destaque'        => '#c8a24a',
			'fundo_alt'       => '#faf6ee',
			'borda'           => '#e7ddcb',
			'texto'           => '#2b2622',
			'texto_claro'     => '#6f645b',
			'topbar_fundo'    => '#4a1420',
			'topbar_texto'    => '#f1e7d8',
			'fonte_titulo'    => "'Cormorant Garamond', Georgia, serif",
		),
		'moderno' => array(
			'primaria'        => '#2f6690',
			'primaria_escura' => '#1f4a68',
			'destaque'        => '#e0a458',
			'fundo_alt'       => '#f3f6f6',
			'borda'           => '#e1e7e6',
			'texto'           => '#242b2e',
			'texto_claro'     => '#5c6a6e',
			'topbar_fundo'    => '#ffffff',
			'topbar_texto'    => '#242b2e',
			'fonte_titulo'    => "'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		),
	);
}

/**
 * Imprime as cores escolhidas no Personalizador como CSS custom properties.
 */
function paroquiafe_customizer_css() {
	$paleta_escolhida = get_theme_mod( 'paroquiafe_paleta', 'classico' );
	$paletas          = paroquiafe_get_paletas();

	if ( 'personalizado' === $paleta_escolhida ) {
		$cores = $paletas['classico'];
		$cores['primaria'] = get_theme_mod( 'paroquiafe_cor_primaria', $cores['primaria'] );
		$cores['destaque'] = get_theme_mod( 'paroquiafe_cor_destaque', $cores['destaque'] );
	} else {
		$cores = isset( $paletas[ $paleta_escolhida ] ) ? $paletas[ $paleta_escolhida ] : $paletas['classico'];
	}
	?>
	<style id="paroquiafe-customizer-css">
		:root {
			--pf-cor-primaria: <?php echo esc_html( $cores['primaria'] ); ?>;
			--pf-cor-primaria-escura: <?php echo esc_html( $cores['primaria_escura'] ); ?>;
			--pf-cor-destaque: <?php echo esc_html( $cores['destaque'] ); ?>;
			--pf-cor-fundo-alt: <?php echo esc_html( $cores['fundo_alt'] ); ?>;
			--pf-cor-borda: <?php echo esc_html( $cores['borda'] ); ?>;
			--pf-cor-texto: <?php echo esc_html( $cores['texto'] ); ?>;
			--pf-cor-texto-claro: <?php echo esc_html( $cores['texto_claro'] ); ?>;
			--pf-topbar-fundo: <?php echo esc_html( $cores['topbar_fundo'] ); ?>;
			--pf-topbar-texto: <?php echo esc_html( $cores['topbar_texto'] ); ?>;
			--pf-fonte-titulo: <?php echo esc_html( $cores['fonte_titulo'] ); ?>;
		}
	</style>
	<?php
}
add_action( 'wp_head', 'paroquiafe_customizer_css' );
