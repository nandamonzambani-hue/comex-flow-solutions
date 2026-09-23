<?php
/**
 * Arquivo de Eventos.
 *
 * @package Paroquia_Fe
 */

get_header();
?>

<div class="pf-container pf-layout-largura-total">
	<header class="pf-arquivo-header">
		<span class="pf-eyebrow"><?php esc_html_e( 'Agenda Paroquial', 'paroquia-fe' ); ?></span>
		<h1><?php esc_html_e( 'Todos os Eventos', 'paroquia-fe' ); ?></h1>
	</header>

	<?php if ( have_posts() ) : ?>
		<div class="pf-grid-eventos">
			<?php
			while ( have_posts() ) :
				the_post();
				$data  = get_post_meta( get_the_ID(), '_evento_data_inicio', true );
				$hora  = get_post_meta( get_the_ID(), '_evento_hora', true );
				$local = get_post_meta( get_the_ID(), '_evento_local', true );
				$timestamp = $data ? strtotime( $data ) : false;
				?>
				<a class="pf-card pf-card-evento-grid" href="<?php the_permalink(); ?>">
					<?php if ( has_post_thumbnail() ) : ?>
						<div class="pf-card-imagem"><?php the_post_thumbnail( 'medium' ); ?></div>
					<?php endif; ?>
					<div class="pf-card-corpo">
						<?php if ( $timestamp ) : ?>
							<span class="pf-card-data"><?php echo esc_html( date_i18n( 'd \d\e F \d\e Y', $timestamp ) ); ?></span>
						<?php endif; ?>
						<h3><?php the_title(); ?></h3>
						<p>
							<?php if ( $hora ) : ?><span><?php echo esc_html( $hora ); ?></span><?php endif; ?>
							<?php if ( $local ) : ?><span> · <?php echo esc_html( $local ); ?></span><?php endif; ?>
						</p>
					</div>
				</a>
			<?php endwhile; ?>
		</div>
		<?php paroquiafe_paginacao(); ?>
	<?php else : ?>
		<?php get_template_part( 'template-parts/content', 'none' ); ?>
	<?php endif; ?>
</div>

<?php get_footer(); ?>
