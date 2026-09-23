<?php
/**
 * Funções auxiliares usadas nos templates.
 *
 * @package Paroquia_Fe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Meta do post (data + comentários) para posts de blog.
 */
function paroquiafe_meta_post() {
	echo '<span class="pf-meta-data">' . esc_html( get_the_date() ) . '</span>';
	if ( ! post_password_required() && ( comments_open() || get_comments_number() ) ) {
		echo '<span class="pf-meta-comentarios">';
		comments_popup_link(
			esc_html__( 'Deixe um comentário', 'paroquia-fe' ),
			esc_html__( '1 Comentário', 'paroquia-fe' ),
			esc_html__( '% Comentários', 'paroquia-fe' )
		);
		echo '</span>';
	}
}

/**
 * Retorna os horários de missa agrupados por dia da semana, em ordem.
 *
 * @return array<string, array<int, array>>
 */
function paroquiafe_get_horarios_missa() {
	$ordem_dias = array( 'domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado' );
	$rotulos    = array(
		'domingo' => __( 'Domingo', 'paroquia-fe' ),
		'segunda' => __( 'Segunda-feira', 'paroquia-fe' ),
		'terca'   => __( 'Terça-feira', 'paroquia-fe' ),
		'quarta'  => __( 'Quarta-feira', 'paroquia-fe' ),
		'quinta'  => __( 'Quinta-feira', 'paroquia-fe' ),
		'sexta'   => __( 'Sexta-feira', 'paroquia-fe' ),
		'sabado'  => __( 'Sábado', 'paroquia-fe' ),
	);

	$horarios = get_posts( array(
		'post_type'      => 'horario_missa',
		'posts_per_page' => -1,
		'orderby'        => 'meta_value',
		'meta_key'       => '_horario_hora',
		'order'          => 'ASC',
	) );

	$agrupado = array();
	foreach ( $ordem_dias as $dia ) {
		$agrupado[ $dia ] = array(
			'rotulo'   => $rotulos[ $dia ],
			'horarios' => array(),
		);
	}

	foreach ( $horarios as $horario ) {
		$dia = get_post_meta( $horario->ID, '_horario_dia', true );
		if ( ! isset( $agrupado[ $dia ] ) ) {
			continue;
		}
		$agrupado[ $dia ]['horarios'][] = array(
			'hora'  => get_post_meta( $horario->ID, '_horario_hora', true ),
			'local' => get_post_meta( $horario->ID, '_horario_local', true ),
			'tipo'  => get_post_meta( $horario->ID, '_horario_tipo', true ),
		);
	}

	return $agrupado;
}

/**
 * Exibe o quadro de horários de missa (usado na home e no widget).
 */
function paroquiafe_render_horarios_missa() {
	$dias = paroquiafe_get_horarios_missa();
	?>
	<div class="pf-horarios-missa">
		<?php foreach ( $dias as $dia ) :
			if ( empty( $dia['horarios'] ) ) {
				continue;
			}
			?>
			<div class="pf-horario-dia">
				<h4><?php echo esc_html( $dia['rotulo'] ); ?></h4>
				<ul>
					<?php foreach ( $dia['horarios'] as $item ) : ?>
						<li>
							<span class="pf-horario-hora"><?php echo esc_html( $item['hora'] ); ?></span>
							<?php if ( ! empty( $item['local'] ) ) : ?>
								<span class="pf-horario-local"><?php echo esc_html( $item['local'] ); ?></span>
							<?php endif; ?>
							<?php if ( ! empty( $item['tipo'] ) ) : ?>
								<span class="pf-horario-tipo"><?php echo esc_html( $item['tipo'] ); ?></span>
							<?php endif; ?>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endforeach; ?>
	</div>
	<?php
}

/**
 * Exibe uma lista de próximos eventos (a partir de hoje).
 */
function paroquiafe_render_proximos_eventos( $quantidade = 3 ) {
	$eventos = get_posts( array(
		'post_type'      => 'evento',
		'posts_per_page' => $quantidade,
		'orderby'        => 'meta_value',
		'meta_key'       => '_evento_data_inicio',
		'order'          => 'ASC',
		'meta_query'     => array(
			array(
				'key'     => '_evento_data_inicio',
				'value'   => gmdate( 'Y-m-d' ),
				'compare' => '>=',
				'type'    => 'DATE',
			),
		),
	) );

	if ( empty( $eventos ) ) {
		echo '<p class="pf-sem-eventos">' . esc_html__( 'Nenhum evento programado no momento.', 'paroquia-fe' ) . '</p>';
		return;
	}
	?>
	<div class="pf-lista-eventos">
		<?php foreach ( $eventos as $evento ) :
			$data  = get_post_meta( $evento->ID, '_evento_data_inicio', true );
			$hora  = get_post_meta( $evento->ID, '_evento_hora', true );
			$local = get_post_meta( $evento->ID, '_evento_local', true );
			$timestamp = $data ? strtotime( $data ) : false;
			?>
			<a class="pf-card-evento" href="<?php echo esc_url( get_permalink( $evento ) ); ?>">
				<?php if ( $timestamp ) : ?>
					<div class="pf-card-evento-data">
						<span class="pf-dia"><?php echo esc_html( gmdate( 'd', $timestamp ) ); ?></span>
						<span class="pf-mes"><?php echo esc_html( date_i18n( 'M', $timestamp ) ); ?></span>
					</div>
				<?php endif; ?>
				<div class="pf-card-evento-info">
					<h4><?php echo esc_html( get_the_title( $evento ) ); ?></h4>
					<p>
						<?php if ( $hora ) : ?><span><?php echo esc_html( $hora ); ?></span><?php endif; ?>
						<?php if ( $local ) : ?><span> · <?php echo esc_html( $local ); ?></span><?php endif; ?>
					</p>
				</div>
			</a>
		<?php endforeach; ?>
	</div>
	<?php
}

/**
 * Navegação simples entre páginas de listagem.
 */
function paroquiafe_paginacao() {
	the_posts_pagination( array(
		'mid_size'  => 1,
		'prev_text' => __( '&larr; Anterior', 'paroquia-fe' ),
		'next_text' => __( 'Próxima &rarr;', 'paroquia-fe' ),
	) );
}
