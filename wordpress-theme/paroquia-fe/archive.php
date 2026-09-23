<?php
/**
 * Arquivo genérico (usado por Clero, Pastorais, categorias, tags...).
 *
 * @package Paroquia_Fe
 */

get_header();

$titulos_cpt = array(
	'clero'    => __( 'Clero e Equipe Pastoral', 'paroquia-fe' ),
	'pastoral' => __( 'Pastorais e Grupos', 'paroquia-fe' ),
);
$post_type = get_post_type();
$titulo    = isset( $titulos_cpt[ $post_type ] ) ? $titulos_cpt[ $post_type ] : get_the_archive_title();
?>

<div class="pf-container pf-layout-largura-total">
	<header class="pf-arquivo-header">
		<h1><?php echo wp_kses_post( $titulo ); ?></h1>
		<?php the_archive_description( '<div class="pf-arquivo-descricao">', '</div>' ); ?>
	</header>

	<?php if ( have_posts() ) : ?>
		<div class="pf-grid-cards">
			<?php
			while ( have_posts() ) :
				the_post();
				?>
				<a class="pf-card" href="<?php the_permalink(); ?>">
					<?php if ( has_post_thumbnail() ) : ?>
						<div class="pf-card-imagem"><?php the_post_thumbnail( 'medium' ); ?></div>
					<?php endif; ?>
					<h3><?php the_title(); ?></h3>
					<?php if ( 'clero' === $post_type ) : ?>
						<p><?php echo esc_html( get_post_meta( get_the_ID(), '_clero_cargo', true ) ); ?></p>
					<?php else : ?>
						<p><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></p>
					<?php endif; ?>
				</a>
			<?php endwhile; ?>
		</div>
		<?php paroquiafe_paginacao(); ?>
	<?php else : ?>
		<?php get_template_part( 'template-parts/content', 'none' ); ?>
	<?php endif; ?>
</div>

<?php get_footer(); ?>
