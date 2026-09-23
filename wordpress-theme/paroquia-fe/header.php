<?php
/**
 * Cabeçalho do site.
 *
 * @package Paroquia_Fe
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="profile" href="https://gmpg.org/xfn/11" />
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div class="pf-topbar">
	<div class="pf-container pf-topbar-inner">
		<div class="pf-topbar-contato">
			<?php $telefone = get_theme_mod( 'paroquiafe_telefone' ); ?>
			<?php if ( $telefone ) : ?>
				<a href="tel:<?php echo esc_attr( preg_replace( '/[^0-9+]/', '', $telefone ) ); ?>">
					<span class="dashicons dashicons-phone" aria-hidden="true"></span> <?php echo esc_html( $telefone ); ?>
				</a>
			<?php endif; ?>
			<?php $endereco = get_theme_mod( 'paroquiafe_endereco' ); ?>
			<?php if ( $endereco ) : ?>
				<span class="pf-topbar-endereco"><span class="dashicons dashicons-location" aria-hidden="true"></span> <?php echo esc_html( $endereco ); ?></span>
			<?php endif; ?>
		</div>
		<div class="pf-topbar-redes">
			<?php
			$redes = array(
				'facebook'  => 'facebook',
				'instagram' => 'instagram',
				'youtube'   => 'youtube',
			);
			foreach ( $redes as $id => $icone ) :
				$link = get_theme_mod( 'paroquiafe_' . $id );
				if ( $link ) :
					?>
					<a href="<?php echo esc_url( $link ); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr( ucfirst( $id ) ); ?>">
						<span class="dashicons dashicons-<?php echo esc_attr( $icone ); ?>" aria-hidden="true"></span>
					</a>
					<?php
				endif;
			endforeach;
			?>
		</div>
	</div>
</div>

<header id="masthead" class="pf-header">
	<div class="pf-container pf-header-inner">
		<div class="pf-branding">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<a class="pf-site-title" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
				<?php $descricao = get_bloginfo( 'description', 'display' ); ?>
				<?php if ( $descricao ) : ?>
					<p class="pf-site-descricao"><?php echo esc_html( $descricao ); ?></p>
				<?php endif; ?>
			<?php endif; ?>
		</div>

		<button class="pf-menu-toggle" aria-controls="pf-menu-principal" aria-expanded="false">
			<span class="screen-reader-text"><?php esc_html_e( 'Abrir menu', 'paroquia-fe' ); ?></span>
			<span class="pf-menu-toggle-barra"></span>
			<span class="pf-menu-toggle-barra"></span>
			<span class="pf-menu-toggle-barra"></span>
		</button>

		<nav id="pf-menu-principal" class="pf-nav-principal" aria-label="<?php esc_attr_e( 'Menu Principal', 'paroquia-fe' ); ?>">
			<?php
			if ( has_nav_menu( 'primary' ) ) {
				wp_nav_menu( array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'menu-principal',
				) );
			} else {
				paroquiafe_default_menu();
			}
			?>
		</nav>
	</div>
</header>

<div id="conteudo" class="site-content">
