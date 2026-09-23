<?php
/**
 * Template padrão de página estática.
 *
 * @package Paroquia_Fe
 */

get_header();

$largura_total = get_post_meta( get_the_ID(), '_pf_largura_total', true );
?>

<div class="pf-container <?php echo $largura_total ? 'pf-layout-largura-total' : 'pf-layout-com-sidebar'; ?>">
	<main id="conteudo-principal" class="pf-conteudo-principal">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'pf-page' ); ?>>
				<?php if ( has_post_thumbnail() ) : ?>
					<div class="pf-page-thumb"><?php the_post_thumbnail( 'large' ); ?></div>
				<?php endif; ?>

				<header class="pf-page-header">
					<h1 class="pf-page-titulo"><?php the_title(); ?></h1>
				</header>

				<div class="pf-page-conteudo">
					<?php
					the_content();
					wp_link_pages( array(
						'before' => '<div class="pf-paginas-post">' . esc_html__( 'Páginas:', 'paroquia-fe' ),
						'after'  => '</div>',
					) );
					?>
				</div>
			</article>

			<?php if ( comments_open() || get_comments_number() ) : ?>
				<?php comments_template(); ?>
			<?php endif; ?>
		<?php endwhile; ?>
	</main>

	<?php if ( ! $largura_total ) : ?>
		<?php get_sidebar(); ?>
	<?php endif; ?>
</div>

<?php get_footer(); ?>
