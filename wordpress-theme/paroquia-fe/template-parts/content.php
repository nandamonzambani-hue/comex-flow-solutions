<?php
/**
 * Bloco de exibição de um post no loop padrão (blog/arquivo).
 *
 * @package Paroquia_Fe
 */
?>
<article id="post-<?php the_ID(); ?>" <?php post_class( 'pf-post' ); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
		<div class="pf-post-thumb">
			<a href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'medium_large' ); ?></a>
		</div>
	<?php endif; ?>

	<div class="pf-post-corpo">
		<header class="pf-post-header">
			<?php if ( is_singular() ) : ?>
				<h1 class="pf-post-titulo"><?php the_title(); ?></h1>
			<?php else : ?>
				<h2 class="pf-post-titulo"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
			<?php endif; ?>
			<div class="pf-post-meta"><?php paroquiafe_meta_post(); ?></div>
		</header>

		<div class="pf-post-conteudo">
			<?php
			if ( is_singular() ) {
				the_content();
				wp_link_pages( array(
					'before' => '<div class="pf-paginas-post">' . esc_html__( 'Páginas:', 'paroquia-fe' ),
					'after'  => '</div>',
				) );
			} else {
				the_excerpt();
				?>
				<p><a class="pf-link-saiba-mais" href="<?php the_permalink(); ?>"><?php esc_html_e( 'Leia mais →', 'paroquia-fe' ); ?></a></p>
				<?php
			}
			?>
		</div>
	</div>
</article>
