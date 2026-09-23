<?php
/**
 * Template para um Evento individual.
 *
 * @package Paroquia_Fe
 */

get_header();

while ( have_posts() ) :
	the_post();

	$data  = get_post_meta( get_the_ID(), '_evento_data_inicio', true );
	$hora  = get_post_meta( get_the_ID(), '_evento_hora', true );
	$local = get_post_meta( get_the_ID(), '_evento_local', true );
	$timestamp = $data ? strtotime( $data ) : false;
	?>

	<div class="pf-container pf-layout-largura-total">
		<article id="post-<?php the_ID(); ?>" <?php post_class( 'pf-evento-single' ); ?>>

			<?php if ( has_post_thumbnail() ) : ?>
				<div class="pf-page-thumb"><?php the_post_thumbnail( 'large' ); ?></div>
			<?php endif; ?>

			<header class="pf-page-header">
				<span class="pf-eyebrow"><?php esc_html_e( 'Evento', 'paroquia-fe' ); ?></span>
				<h1 class="pf-page-titulo"><?php the_title(); ?></h1>
			</header>

			<div class="pf-evento-info-bar">
				<?php if ( $timestamp ) : ?>
					<div class="pf-evento-info-item">
						<span class="dashicons dashicons-calendar-alt" aria-hidden="true"></span>
						<?php echo esc_html( date_i18n( 'd \d\e F \d\e Y', $timestamp ) ); ?>
					</div>
				<?php endif; ?>
				<?php if ( $hora ) : ?>
					<div class="pf-evento-info-item">
						<span class="dashicons dashicons-clock" aria-hidden="true"></span>
						<?php echo esc_html( $hora ); ?>
					</div>
				<?php endif; ?>
				<?php if ( $local ) : ?>
					<div class="pf-evento-info-item">
						<span class="dashicons dashicons-location" aria-hidden="true"></span>
						<?php echo esc_html( $local ); ?>
					</div>
				<?php endif; ?>
			</div>

			<div class="pf-page-conteudo">
				<?php the_content(); ?>
			</div>
		</article>
	</div>

	<?php
endwhile;

get_footer();
