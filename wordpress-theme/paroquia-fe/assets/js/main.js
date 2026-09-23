/**
 * Paróquia Fé - interações do front-end (menu mobile e submenus).
 */
( function () {
	'use strict';

	document.addEventListener( 'DOMContentLoaded', function () {
		var toggle = document.querySelector( '.pf-menu-toggle' );
		var menu = document.getElementById( 'pf-menu-principal' );

		if ( toggle && menu ) {
			toggle.addEventListener( 'click', function () {
				var aberto = menu.classList.toggle( 'pf-menu-aberto' );
				toggle.setAttribute( 'aria-expanded', aberto ? 'true' : 'false' );
			} );
		}

		// Em telas pequenas, toque no item pai abre/fecha o submenu em vez de navegar direto.
		var itensComFilhos = document.querySelectorAll( '.pf-nav-principal li.menu-item-has-children > a' );
		itensComFilhos.forEach( function ( link ) {
			link.addEventListener( 'click', function ( evento ) {
				if ( window.innerWidth > 900 ) {
					return;
				}
				var pai = link.parentElement;
				if ( ! pai.classList.contains( 'pf-submenu-aberto' ) ) {
					evento.preventDefault();
					pai.classList.add( 'pf-submenu-aberto' );
				}
			} );
		} );
	} );
} )();
