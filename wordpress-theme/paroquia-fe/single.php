<?php
/**
 * Template padrão para posts individuais (blog).
 *
 * @package Paroquia_Fe
 */

get_header();
?>

<div class="pf-container pf-layout-com-sidebar">
	<main id="conteudo-principal" class="pf-conteudo-principal">
		<?php
		while ( have_posts() ) :
			the_post();
			get_template_part( 'template-parts/content' );

			$categorias = get_the_category_list( ', ' );
			$tags       = get_the_tag_list( '', ', ' );
			if ( $categorias || $tags ) :
				?>
				<div class="pf-post-taxonomias">
					<?php if ( $categorias ) : ?>
						<p><strong><?php esc_html_e( 'Categorias:', 'paroquia-fe' ); ?></strong> <?php echo wp_kses_post( $categorias ); ?></p>
					<?php endif; ?>
					<?php if ( $tags ) : ?>
						<p><strong><?php esc_html_e( 'Tags:', 'paroquia-fe' ); ?></strong> <?php echo wp_kses_post( $tags ); ?></p>
					<?php endif; ?>
				</div>
				<?php
			endif;

			if ( comments_open() || get_comments_number() ) :
				comments_template();
			endif;
		endwhile;
		?>
	</main>

	<?php get_sidebar(); ?>
</div>

<?php get_footer(); ?>
