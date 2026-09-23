<?php
/**
 * Página 404 (não encontrado).
 *
 * @package Paroquia_Fe
 */

get_header();
?>

<div class="pf-container pf-layout-largura-total">
	<div class="pf-404">
		<h1><?php esc_html_e( 'Página não encontrada', 'paroquia-fe' ); ?></h1>
		<p><?php esc_html_e( 'O conteúdo que você procura não existe ou foi movido. Que tal voltar para a página inicial ou fazer uma busca?', 'paroquia-fe' ); ?></p>
		<?php get_search_form(); ?>
		<a class="pf-botao pf-botao-primario" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Voltar ao início', 'paroquia-fe' ); ?></a>
	</div>
</div>

<?php get_footer(); ?>
