<?php
/**
 * Área de comentários.
 *
 * @package Paroquia_Fe
 */

if ( post_password_required() ) {
	return;
}
?>
<div id="comentarios" class="pf-comentarios">

	<?php if ( have_comments() ) : ?>
		<h2 class="pf-comentarios-titulo">
			<?php
			$num_comentarios = get_comments_number();
			if ( 1 === (int) $num_comentarios ) {
				esc_html_e( '1 comentário', 'paroquia-fe' );
			} else {
				echo esc_html( sprintf(
					/* translators: %s: número de comentários */
					_n( '%s comentário', '%s comentários', $num_comentarios, 'paroquia-fe' ),
					number_format_i18n( $num_comentarios )
				) );
			}
			?>
		</h2>

		<ol class="pf-lista-comentarios">
			<?php
			wp_list_comments( array(
				'style'      => 'ol',
				'short_ping' => true,
			) );
			?>
		</ol>

		<?php the_comments_pagination(); ?>
	<?php endif; ?>

	<?php if ( ! comments_open() && get_comments_number() ) : ?>
		<p class="pf-comentarios-fechados"><?php esc_html_e( 'Os comentários estão fechados.', 'paroquia-fe' ); ?></p>
	<?php endif; ?>

	<?php
	comment_form( array(
		'class_submit' => 'pf-botao pf-botao-primario',
	) );
	?>
</div>
