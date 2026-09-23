<?php
/**
 * Formulário de busca.
 *
 * @package Paroquia_Fe
 */
?>
<form role="search" method="get" class="pf-form-busca" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label for="pf-busca-campo" class="screen-reader-text"><?php esc_html_e( 'Buscar por:', 'paroquia-fe' ); ?></label>
	<input type="search" id="pf-busca-campo" class="pf-busca-campo" placeholder="<?php esc_attr_e( 'Buscar no site...', 'paroquia-fe' ); ?>" value="<?php echo esc_attr( get_search_query() ); ?>" name="s" />
	<button type="submit" class="pf-busca-botao">
		<span class="dashicons dashicons-search" aria-hidden="true"></span>
		<span class="screen-reader-text"><?php esc_html_e( 'Buscar', 'paroquia-fe' ); ?></span>
	</button>
</form>
