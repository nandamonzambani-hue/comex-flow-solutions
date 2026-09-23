<?php
/**
 * Exibido quando nenhum conteúdo é encontrado.
 *
 * @package Paroquia_Fe
 */
?>
<div class="pf-sem-resultado">
	<h2><?php esc_html_e( 'Nada encontrado', 'paroquia-fe' ); ?></h2>
	<?php if ( is_search() ) : ?>
		<p><?php esc_html_e( 'Desculpe, nenhum resultado corresponde à sua busca. Tente outros termos.', 'paroquia-fe' ); ?></p>
		<?php get_search_form(); ?>
	<?php else : ?>
		<p><?php esc_html_e( 'Nenhum conteúdo foi publicado ainda.', 'paroquia-fe' ); ?></p>
	<?php endif; ?>
</div>
