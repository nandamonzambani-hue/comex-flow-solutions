<?php
/**
 * A single, non-intrusive link to the paid FlowCraft Pro add-on.
 *
 * Per WordPress.org guidelines this theme never nags with dashboard
 * notices, forced redirects on activation, or crippled functionality —
 * it just adds one menu item under Appearance that admins can visit
 * (or ignore) whenever they like.
 *
 * @package FlowCraft
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function flowcraft_register_pro_menu() {
	add_theme_page(
		__( 'FlowCraft Pro', 'flowcraft' ),
		__( 'FlowCraft Pro', 'flowcraft' ),
		'edit_theme_options',
		'flowcraft-pro',
		'flowcraft_render_pro_page'
	);
}
add_action( 'admin_menu', 'flowcraft_register_pro_menu' );

function flowcraft_render_pro_page() {
	// Replace with your real sales page URL before distributing this theme.
	$pro_url = 'https://example.com/flowcraft-pro';
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'FlowCraft Pro', 'flowcraft' ); ?></h1>
		<p><?php esc_html_e( 'You are using the free version of FlowCraft. The Pro add-on unlocks extra patterns, a header/footer builder, WooCommerce templates and priority support.', 'flowcraft' ); ?></p>
		<p>
			<a href="<?php echo esc_url( $pro_url ); ?>" class="button button-primary" target="_blank" rel="noopener noreferrer">
				<?php esc_html_e( 'Learn more about FlowCraft Pro', 'flowcraft' ); ?>
			</a>
		</p>
	</div>
	<?php
}
