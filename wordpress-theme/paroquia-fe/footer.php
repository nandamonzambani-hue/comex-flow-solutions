<?php
/**
 * Rodapé do site.
 *
 * @package Paroquia_Fe
 */
?>
</div><!-- #conteudo -->

<footer id="rodape" class="pf-footer">
	<div class="pf-container pf-footer-colunas">
		<?php
		$colunas = array( 'rodape-1', 'rodape-2', 'rodape-3', 'rodape-4' );
		foreach ( $colunas as $coluna ) :
			if ( is_active_sidebar( $coluna ) ) :
				?>
				<div class="pf-footer-coluna">
					<?php dynamic_sidebar( $coluna ); ?>
				</div>
				<?php
			endif;
		endforeach;

		if ( ! is_active_sidebar( 'rodape-1' ) && ! is_active_sidebar( 'rodape-2' ) && ! is_active_sidebar( 'rodape-3' ) && ! is_active_sidebar( 'rodape-4' ) ) :
			?>
			<div class="pf-footer-coluna">
				<h4 class="footer-widget-title"><?php bloginfo( 'name' ); ?></h4>
				<?php $endereco = get_theme_mod( 'paroquiafe_endereco' ); ?>
				<?php if ( $endereco ) : ?><p><?php echo esc_html( $endereco ); ?></p><?php endif; ?>
				<?php $telefone = get_theme_mod( 'paroquiafe_telefone' ); ?>
				<?php if ( $telefone ) : ?><p><?php echo esc_html( $telefone ); ?></p><?php endif; ?>
				<?php $email = get_theme_mod( 'paroquiafe_email' ); ?>
				<?php if ( $email ) : ?><p><a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a></p><?php endif; ?>
			</div>
			<div class="pf-footer-coluna">
				<h4 class="footer-widget-title"><?php esc_html_e( 'Horário de Missas', 'paroquia-fe' ); ?></h4>
				<?php paroquiafe_render_horarios_missa(); ?>
			</div>
		<?php endif; ?>
	</div>

	<?php if ( has_nav_menu( 'footer' ) ) : ?>
		<div class="pf-container">
			<nav class="pf-nav-rodape" aria-label="<?php esc_attr_e( 'Menu do Rodapé', 'paroquia-fe' ); ?>">
				<?php
				wp_nav_menu( array(
					'theme_location' => 'footer',
					'container'      => false,
					'menu_class'     => 'menu-rodape',
				) );
				?>
			</nav>
		</div>
	<?php endif; ?>

	<div class="pf-copyright">
		<div class="pf-container">
			<p>
				&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>.
				<?php esc_html_e( 'Todos os direitos reservados.', 'paroquia-fe' ); ?>
			</p>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
