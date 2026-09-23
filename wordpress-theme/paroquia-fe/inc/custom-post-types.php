<?php
/**
 * Custom Post Types e Taxonomias do tema Paróquia Fé.
 *
 * @package Paroquia_Fe
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function paroquiafe_registrar_cpts() {

	// Eventos (missas especiais, novenas, festas, retiros...).
	register_post_type( 'evento', array(
		'labels' => array(
			'name'               => __( 'Eventos', 'paroquia-fe' ),
			'singular_name'      => __( 'Evento', 'paroquia-fe' ),
			'add_new_item'       => __( 'Adicionar Novo Evento', 'paroquia-fe' ),
			'edit_item'          => __( 'Editar Evento', 'paroquia-fe' ),
			'new_item'           => __( 'Novo Evento', 'paroquia-fe' ),
			'view_item'          => __( 'Ver Evento', 'paroquia-fe' ),
			'search_items'       => __( 'Buscar Eventos', 'paroquia-fe' ),
			'not_found'          => __( 'Nenhum evento encontrado.', 'paroquia-fe' ),
			'menu_name'          => __( 'Eventos', 'paroquia-fe' ),
		),
		'public'       => true,
		'menu_icon'    => 'dashicons-calendar-alt',
		'has_archive'  => true,
		'rewrite'      => array( 'slug' => 'eventos' ),
		'show_in_rest' => true,
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
	) );

	// Horários de Missa.
	register_post_type( 'horario_missa', array(
		'labels' => array(
			'name'          => __( 'Horários de Missa', 'paroquia-fe' ),
			'singular_name' => __( 'Horário de Missa', 'paroquia-fe' ),
			'add_new_item'  => __( 'Adicionar Horário', 'paroquia-fe' ),
			'edit_item'     => __( 'Editar Horário', 'paroquia-fe' ),
			'menu_name'     => __( 'Horários de Missa', 'paroquia-fe' ),
			'not_found'     => __( 'Nenhum horário cadastrado.', 'paroquia-fe' ),
		),
		'public'       => true,
		'menu_icon'    => 'dashicons-clock',
		'has_archive'  => false,
		'rewrite'      => array( 'slug' => 'horarios-missa' ),
		'show_in_rest' => true,
		'supports'     => array( 'title' ),
	) );

	// Clero / equipe pastoral.
	register_post_type( 'clero', array(
		'labels' => array(
			'name'          => __( 'Clero e Equipe', 'paroquia-fe' ),
			'singular_name' => __( 'Membro do Clero', 'paroquia-fe' ),
			'add_new_item'  => __( 'Adicionar Membro', 'paroquia-fe' ),
			'edit_item'     => __( 'Editar Membro', 'paroquia-fe' ),
			'menu_name'     => __( 'Clero e Equipe', 'paroquia-fe' ),
			'not_found'     => __( 'Nenhum membro cadastrado.', 'paroquia-fe' ),
		),
		'public'       => true,
		'menu_icon'    => 'dashicons-groups',
		'has_archive'  => true,
		'rewrite'      => array( 'slug' => 'clero' ),
		'show_in_rest' => true,
		'supports'     => array( 'title', 'editor', 'thumbnail' ),
	) );

	// Pastorais e movimentos.
	register_post_type( 'pastoral', array(
		'labels' => array(
			'name'          => __( 'Pastorais e Grupos', 'paroquia-fe' ),
			'singular_name' => __( 'Pastoral/Grupo', 'paroquia-fe' ),
			'add_new_item'  => __( 'Adicionar Pastoral', 'paroquia-fe' ),
			'edit_item'     => __( 'Editar Pastoral', 'paroquia-fe' ),
			'menu_name'     => __( 'Pastorais e Grupos', 'paroquia-fe' ),
			'not_found'     => __( 'Nenhuma pastoral cadastrada.', 'paroquia-fe' ),
		),
		'public'       => true,
		'menu_icon'    => 'dashicons-groups',
		'has_archive'  => true,
		'rewrite'      => array( 'slug' => 'pastorais' ),
		'show_in_rest' => true,
		'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
	) );
}
add_action( 'init', 'paroquiafe_registrar_cpts' );

/**
 * Taxonomia de tipo de evento (ex: Novena, Festa, Retiro, Celebração).
 */
function paroquiafe_registrar_taxonomias() {
	register_taxonomy( 'tipo_evento', 'evento', array(
		'labels' => array(
			'name'          => __( 'Tipos de Evento', 'paroquia-fe' ),
			'singular_name' => __( 'Tipo de Evento', 'paroquia-fe' ),
		),
		'hierarchical'      => true,
		'show_admin_column' => true,
		'show_in_rest'      => true,
		'rewrite'           => array( 'slug' => 'tipo-evento' ),
	) );
}
add_action( 'init', 'paroquiafe_registrar_taxonomias' );
