<?php
/**
 * Widgets nativos do tema: Horário de Missas e Próximos Eventos.
 *
 * @package Paroquia_Fe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Paroquiafe_Widget_Horarios extends WP_Widget {

	public function __construct() {
		parent::__construct(
			'paroquiafe_widget_horarios',
			__( 'Paróquia Fé - Horário de Missas', 'paroquia-fe' ),
			array( 'description' => __( 'Exibe o quadro de horários de missa cadastrado no admin.', 'paroquia-fe' ) )
		);
	}

	public function widget( $args, $instance ) {
		echo $args['before_widget'];
		$titulo = ! empty( $instance['titulo'] ) ? $instance['titulo'] : __( 'Horário de Missas', 'paroquia-fe' );
		echo $args['before_title'] . esc_html( $titulo ) . $args['after_title'];
		paroquiafe_render_horarios_missa();
		echo $args['after_widget'];
	}

	public function form( $instance ) {
		$titulo = ! empty( $instance['titulo'] ) ? $instance['titulo'] : __( 'Horário de Missas', 'paroquia-fe' );
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'titulo' ) ); ?>"><?php esc_html_e( 'Título:', 'paroquia-fe' ); ?></label>
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'titulo' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'titulo' ) ); ?>" type="text" value="<?php echo esc_attr( $titulo ); ?>" />
		</p>
		<?php
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['titulo'] = ! empty( $new_instance['titulo'] ) ? sanitize_text_field( $new_instance['titulo'] ) : '';
		return $instance;
	}
}

class Paroquiafe_Widget_Eventos extends WP_Widget {

	public function __construct() {
		parent::__construct(
			'paroquiafe_widget_eventos',
			__( 'Paróquia Fé - Próximos Eventos', 'paroquia-fe' ),
			array( 'description' => __( 'Exibe os próximos eventos cadastrados.', 'paroquia-fe' ) )
		);
	}

	public function widget( $args, $instance ) {
		echo $args['before_widget'];
		$titulo = ! empty( $instance['titulo'] ) ? $instance['titulo'] : __( 'Próximos Eventos', 'paroquia-fe' );
		echo $args['before_title'] . esc_html( $titulo ) . $args['after_title'];
		$quantidade = ! empty( $instance['quantidade'] ) ? absint( $instance['quantidade'] ) : 3;
		paroquiafe_render_proximos_eventos( $quantidade );
		echo $args['after_widget'];
	}

	public function form( $instance ) {
		$titulo     = ! empty( $instance['titulo'] ) ? $instance['titulo'] : __( 'Próximos Eventos', 'paroquia-fe' );
		$quantidade = ! empty( $instance['quantidade'] ) ? absint( $instance['quantidade'] ) : 3;
		?>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'titulo' ) ); ?>"><?php esc_html_e( 'Título:', 'paroquia-fe' ); ?></label>
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'titulo' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'titulo' ) ); ?>" type="text" value="<?php echo esc_attr( $titulo ); ?>" />
		</p>
		<p>
			<label for="<?php echo esc_attr( $this->get_field_id( 'quantidade' ) ); ?>"><?php esc_html_e( 'Quantidade de eventos:', 'paroquia-fe' ); ?></label>
			<input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'quantidade' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'quantidade' ) ); ?>" type="number" min="1" max="10" value="<?php echo esc_attr( $quantidade ); ?>" />
		</p>
		<?php
	}

	public function update( $new_instance, $old_instance ) {
		$instance = array();
		$instance['titulo']     = ! empty( $new_instance['titulo'] ) ? sanitize_text_field( $new_instance['titulo'] ) : '';
		$instance['quantidade'] = ! empty( $new_instance['quantidade'] ) ? absint( $new_instance['quantidade'] ) : 3;
		return $instance;
	}
}

function paroquiafe_registrar_widgets() {
	register_widget( 'Paroquiafe_Widget_Horarios' );
	register_widget( 'Paroquiafe_Widget_Eventos' );
}
add_action( 'widgets_init', 'paroquiafe_registrar_widgets' );
