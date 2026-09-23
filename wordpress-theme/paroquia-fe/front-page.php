<?php
/**
 * Template da página inicial.
 *
 * @package Paroquia_Fe
 */

get_header();

$banner_imagem = get_theme_mod( 'paroquiafe_banner_imagem' );
?>

<section class="pf-hero" <?php if ( $banner_imagem ) : ?>style="background-image:url('<?php echo esc_url( $banner_imagem ); ?>');"<?php endif; ?>>
	<div class="pf-hero-overlay">
		<div class="pf-container pf-hero-conteudo">
			<h1><?php echo esc_html( get_theme_mod( 'paroquiafe_banner_titulo', get_bloginfo( 'name' ) ) ); ?></h1>
			<p><?php echo esc_html( get_theme_mod( 'paroquiafe_banner_subtitulo', '' ) ); ?></p>
			<div class="pf-hero-acoes">
				<a class="pf-botao pf-botao-primario" href="#horarios"><?php esc_html_e( 'Horário de Missas', 'paroquia-fe' ); ?></a>
				<a class="pf-botao pf-botao-secundario" href="#eventos"><?php esc_html_e( 'Próximos Eventos', 'paroquia-fe' ); ?></a>
			</div>
		</div>
	</div>
</section>

<?php $texto_sobre = get_theme_mod( 'paroquiafe_texto_sobre' ); ?>
<?php if ( $texto_sobre ) : ?>
<section class="pf-secao pf-secao-sobre">
	<div class="pf-container pf-sobre-grid">
		<div class="pf-sobre-texto">
			<span class="pf-eyebrow"><?php esc_html_e( 'Bem-vindo', 'paroquia-fe' ); ?></span>
			<h2><?php esc_html_e( 'Nossa Comunidade', 'paroquia-fe' ); ?></h2>
			<div class="pf-sobre-conteudo"><?php echo wp_kses_post( wpautop( $texto_sobre ) ); ?></div>
			<?php
			$pagina_sobre = get_page_by_path( 'sobre' );
			$link_sobre   = $pagina_sobre ? get_permalink( $pagina_sobre ) : home_url( '/' );
			?>
			<a class="pf-link-saiba-mais" href="<?php echo esc_url( $link_sobre ); ?>"><?php esc_html_e( 'Saiba mais →', 'paroquia-fe' ); ?></a>
		</div>
	</div>
</section>
<?php endif; ?>

<section id="horarios" class="pf-secao pf-secao-horarios">
	<div class="pf-container">
		<span class="pf-eyebrow"><?php esc_html_e( 'Participe', 'paroquia-fe' ); ?></span>
		<h2><?php esc_html_e( 'Horário de Missas', 'paroquia-fe' ); ?></h2>
		<?php paroquiafe_render_horarios_missa(); ?>
	</div>
</section>

<section id="eventos" class="pf-secao pf-secao-eventos">
	<div class="pf-container">
		<span class="pf-eyebrow"><?php esc_html_e( 'Agenda', 'paroquia-fe' ); ?></span>
		<h2><?php esc_html_e( 'Próximos Eventos', 'paroquia-fe' ); ?></h2>
		<?php paroquiafe_render_proximos_eventos( 6 ); ?>
		<div class="pf-secao-acao">
			<a class="pf-botao pf-botao-outline" href="<?php echo esc_url( get_post_type_archive_link( 'evento' ) ); ?>"><?php esc_html_e( 'Ver todos os eventos', 'paroquia-fe' ); ?></a>
		</div>
	</div>
</section>

<?php
$pastorais = get_posts( array( 'post_type' => 'pastoral', 'posts_per_page' => 4 ) );
if ( ! empty( $pastorais ) ) :
	?>
	<section class="pf-secao pf-secao-pastorais">
		<div class="pf-container">
			<span class="pf-eyebrow"><?php esc_html_e( 'Comunidade', 'paroquia-fe' ); ?></span>
			<h2><?php esc_html_e( 'Pastorais e Grupos', 'paroquia-fe' ); ?></h2>
			<div class="pf-grid-cards">
				<?php foreach ( $pastorais as $pastoral ) : ?>
					<a class="pf-card" href="<?php echo esc_url( get_permalink( $pastoral ) ); ?>">
						<?php if ( has_post_thumbnail( $pastoral ) ) : ?>
							<div class="pf-card-imagem"><?php echo get_the_post_thumbnail( $pastoral, 'medium' ); ?></div>
						<?php endif; ?>
						<h3><?php echo esc_html( get_the_title( $pastoral ) ); ?></h3>
						<p><?php echo esc_html( wp_trim_words( get_the_excerpt( $pastoral ), 18 ) ); ?></p>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php if ( get_theme_mod( 'paroquiafe_doacoes_ativo' ) ) : ?>
	<section class="pf-secao pf-secao-doacoes">
		<div class="pf-container pf-doacoes-conteudo">
			<h2><?php esc_html_e( 'Contribua com a Paróquia', 'paroquia-fe' ); ?></h2>
			<p><?php echo esc_html( get_theme_mod( 'paroquiafe_doacoes_texto' ) ); ?></p>
			<?php $chave_pix = get_theme_mod( 'paroquiafe_chave_pix' ); ?>
			<?php if ( $chave_pix ) : ?>
				<p class="pf-chave-pix"><strong><?php esc_html_e( 'Chave Pix:', 'paroquia-fe' ); ?></strong> <?php echo esc_html( $chave_pix ); ?></p>
			<?php endif; ?>
			<?php $link_doacao = get_theme_mod( 'paroquiafe_doacoes_link' ); ?>
			<?php if ( $link_doacao ) : ?>
				<a class="pf-botao pf-botao-primario" href="<?php echo esc_url( $link_doacao ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Fazer uma doação', 'paroquia-fe' ); ?></a>
			<?php endif; ?>
		</div>
	</section>
<?php endif; ?>

<?php
$ultimos_posts = get_posts( array( 'posts_per_page' => 3 ) );
if ( ! empty( $ultimos_posts ) ) :
	?>
	<section class="pf-secao pf-secao-blog">
		<div class="pf-container">
			<span class="pf-eyebrow"><?php esc_html_e( 'Notícias', 'paroquia-fe' ); ?></span>
			<h2><?php esc_html_e( 'Últimas Publicações', 'paroquia-fe' ); ?></h2>
			<div class="pf-grid-cards">
				<?php foreach ( $ultimos_posts as $post ) : setup_postdata( $post ); ?>
					<a class="pf-card" href="<?php the_permalink(); ?>">
						<?php if ( has_post_thumbnail() ) : ?>
							<div class="pf-card-imagem"><?php the_post_thumbnail( 'medium' ); ?></div>
						<?php endif; ?>
						<h3><?php the_title(); ?></h3>
						<p><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></p>
					</a>
				<?php endforeach; wp_reset_postdata(); ?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php get_footer(); ?>
