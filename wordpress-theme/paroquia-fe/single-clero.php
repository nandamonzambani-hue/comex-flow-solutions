<?php
/**
 * Template para um membro do clero/equipe individual.
 *
 * @package Paroquia_Fe
 */

get_header();

while ( have_posts() ) :
	the_post();

	$cargo    = get_post_meta( get_the_ID(), '_clero_cargo', true );
	$telefone = get_post_meta( get_the_ID(), '_clero_telefone', true );
	$email    = get_post_meta( get_the_ID(), '_clero_email', true );
	?>

	<div class="pf-container pf-layout-largura-total">
		<article id="post-<?php the_ID(); ?>" <?php post_class( 'pf-clero-single' ); ?>>
			<div class="pf-clero-grid">
				<?php if ( has_post_thumbnail() ) : ?>
					<div class="pf-clero-foto"><?php the_post_thumbnail( 'medium' ); ?></div>
				<?php endif; ?>
				<div class="pf-clero-info">
					<h1 class="pf-page-titulo"><?php the_title(); ?></h1>
					<?php if ( $cargo ) : ?><p class="pf-clero-cargo"><?php echo esc_html( $cargo ); ?></p><?php endif; ?>
					<ul class="pf-clero-contato">
						<?php if ( $telefone ) : ?><li><span class="dashicons dashicons-phone" aria-hidden="true"></span> <?php echo esc_html( $telefone ); ?></li><?php endif; ?>
						<?php if ( $email ) : ?><li><span class="dashicons dashicons-email" aria-hidden="true"></span> <a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a></li><?php endif; ?>
					</ul>
					<div class="pf-page-conteudo"><?php the_content(); ?></div>
				</div>
			</div>
		</article>
	</div>

	<?php
endwhile;

get_footer();
