<?php
/**
 * Barra lateral.
 *
 * @package Paroquia_Fe
 */

if ( ! is_active_sidebar( 'sidebar-principal' ) ) {
	return;
}
?>
<aside id="barra-lateral" class="pf-sidebar" role="complementary">
	<?php dynamic_sidebar( 'sidebar-principal' ); ?>
</aside>
