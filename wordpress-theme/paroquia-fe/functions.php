<?php
/**
 * Paróquia Fé - funções e definições do tema
 *
 * @package Paroquia_Fe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PAROQUIAFE_VERSION', '1.0.0' );
define( 'PAROQUIAFE_DIR', get_template_directory() );
define( 'PAROQUIAFE_URI', get_template_directory_uri() );

/**
 * Setup do tema: suportes, menus, thumbnails.
 */
function paroquiafe_setup() {
	load_theme_textdomain( 'paroquia-fe', PAROQUIAFE_DIR . '/languages' );

	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array(
		'height'      => 100,
		'width'       => 300,
		'flex-height' => true,
		'flex-width'  => true,
	) );
	add_theme_support( 'html5', array(
		'search-form',
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
		'style',
		'script',
		'navigation-widgets',
	) );
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'align-wide' );

	add_theme_support( 'editor-color-palette', array(
		array(
			'name'  => __( 'Vinho Litúrgico', 'paroquia-fe' ),
			'slug'  => 'vinho',
			'color' => '#6b1d2e',
		),
		array(
			'name'  => __( 'Dourado', 'paroquia-fe' ),
			'slug'  => 'dourado',
			'color' => '#c8a24a',
		),
		array(
			'name'  => __( 'Creme', 'paroquia-fe' ),
			'slug'  => 'creme',
			'color' => '#faf6ee',
		),
		array(
			'name'  => __( 'Cinza Escuro', 'paroquia-fe' ),
			'slug'  => 'cinza-escuro',
			'color' => '#2b2622',
		),
	) );

	register_nav_menus( array(
		'primary' => __( 'Menu Principal', 'paroquia-fe' ),
		'footer'  => __( 'Menu do Rodapé', 'paroquia-fe' ),
	) );
}
add_action( 'after_setup_theme', 'paroquiafe_setup' );

/**
 * Largura padrão de conteúdo (para embeds/imagens).
 */
function paroquiafe_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'paroquiafe_content_width', 900 );
}
add_action( 'after_setup_theme', 'paroquiafe_content_width', 0 );

/**
 * Scripts e estilos.
 */
function paroquiafe_scripts() {
	wp_enqueue_style( 'paroquiafe-google-fonts', 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Mulish:wght@400;500;600;700&display=swap', array(), null );
	wp_enqueue_style( 'paroquiafe-style', PAROQUIAFE_URI . '/assets/css/main.css', array(), PAROQUIAFE_VERSION );
	wp_enqueue_style( 'paroquiafe-theme-json', PAROQUIAFE_URI . '/style.css', array(), PAROQUIAFE_VERSION );

	wp_enqueue_script( 'paroquiafe-main', PAROQUIAFE_URI . '/assets/js/main.js', array(), PAROQUIAFE_VERSION, true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}

	wp_localize_script( 'paroquiafe-main', 'paroquiaFeData', array(
		'ajaxUrl' => admin_url( 'admin-ajax.php' ),
	) );
}
add_action( 'wp_enqueue_scripts', 'paroquiafe_scripts' );

/**
 * Áreas de widget.
 */
function paroquiafe_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Barra Lateral', 'paroquia-fe' ),
		'id'            => 'sidebar-principal',
		'description'   => __( 'Aparece nas páginas e posts internos.', 'paroquia-fe' ),
		'before_widget' => '<section id="%1$s" class="widget %2$s">',
		'after_widget'  => '</section>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	) );

	$rodape_colunas = array( 'rodape-1', 'rodape-2', 'rodape-3', 'rodape-4' );
	foreach ( $rodape_colunas as $i => $id ) {
		register_sidebar( array(
			'name'          => sprintf( __( 'Rodapé - Coluna %d', 'paroquia-fe' ), $i + 1 ),
			'id'            => $id,
			'description'   => __( 'Widgets exibidos no rodapé do site.', 'paroquia-fe' ),
			'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h4 class="footer-widget-title">',
			'after_title'   => '</h4>',
		) );
	}
}
add_action( 'widgets_init', 'paroquiafe_widgets_init' );

/**
 * Includes.
 */
require PAROQUIAFE_DIR . '/inc/custom-post-types.php';
require PAROQUIAFE_DIR . '/inc/meta-boxes.php';
require PAROQUIAFE_DIR . '/inc/customizer.php';
require PAROQUIAFE_DIR . '/inc/template-tags.php';
require PAROQUIAFE_DIR . '/inc/widgets.php';

/**
 * Trecho (excerpt) padrão.
 */
function paroquiafe_excerpt_length( $length ) {
	return 24;
}
add_filter( 'excerpt_length', 'paroquiafe_excerpt_length' );

function paroquiafe_excerpt_more( $more ) {
	return '&hellip;';
}
add_filter( 'excerpt_more', 'paroquiafe_excerpt_more' );

/**
 * Classes extras no <body>.
 */
function paroquiafe_body_classes( $classes ) {
	if ( ! is_active_sidebar( 'sidebar-principal' ) || is_front_page() ) {
		$classes[] = 'sem-sidebar';
	}
	return $classes;
}
add_filter( 'body_class', 'paroquiafe_body_classes' );

/**
 * Fallback de menu quando nenhum menu foi definido no admin.
 */
function paroquiafe_default_menu() {
	echo '<ul class="menu-principal">';
	echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Início', 'paroquia-fe' ) . '</a></li>';
	echo '</ul>';
}
