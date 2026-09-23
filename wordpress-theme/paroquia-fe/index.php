<?php
/**
 * Template padrão (loop de blog / fallback).
 *
 * @package Paroquia_Fe
 */

get_header();
?>

<div class="pf-container pf-layout-com-sidebar">
	<main id="conteudo-principal" class="pf-conteudo-principal">
		<?php if ( have_posts() ) : ?>

			<?php if ( is_home() && ! is_front_page() ) : ?>
				<header class="pf-arquivo-header">
					<h1><?php single_post_title(); ?></h1>
				</header>
			<?php endif; ?>

			<?php
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/content' );
			endwhile;

			paroquiafe_paginacao();
			?>

		<?php else : ?>
			<?php get_template_part( 'template-parts/content', 'none' ); ?>
		<?php endif; ?>
	</main>

	<?php get_sidebar(); ?>
</div>

<?php get_footer(); ?>
