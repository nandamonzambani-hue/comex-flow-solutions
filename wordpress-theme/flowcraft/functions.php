<?php
/**
 * FlowCraft theme bootstrap.
 *
 * @package FlowCraft
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'FLOWCRAFT_VERSION', '1.0.0' );

/**
 * Theme setup: supports, editor style and text domain.
 */
function flowcraft_setup() {
	load_theme_textdomain( 'flowcraft', get_template_directory() . '/languages' );

	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'post-thumbnails' );

	// This theme relies on the Site Editor / theme.json for layout, colors and typography.
	add_theme_support( 'block-templates' );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Menu', 'flowcraft' ),
			'footer'  => __( 'Footer Menu', 'flowcraft' ),
		)
	);
}
add_action( 'after_setup_theme', 'flowcraft_setup' );

/**
 * Register the pattern category used by the bundled patterns/*.php files.
 */
function flowcraft_register_pattern_categories() {
	register_block_pattern_category(
		'flowcraft',
		array( 'label' => __( 'FlowCraft', 'flowcraft' ) )
	);
}
add_action( 'init', 'flowcraft_register_pattern_categories' );

/**
 * Enqueue front-end assets. style.css only carries the required theme header
 * plus tiny fallbacks; theme.json drives the rest, so nothing else to add here.
 */
function flowcraft_enqueue_assets() {
	wp_enqueue_style( 'flowcraft-style', get_stylesheet_uri(), array(), FLOWCRAFT_VERSION );
}
add_action( 'wp_enqueue_scripts', 'flowcraft_enqueue_assets' );

require get_template_directory() . '/inc/upsell.php';
