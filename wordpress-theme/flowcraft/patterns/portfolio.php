<?php
/**
 * Title: Product / portfolio grid
 * Slug: flowcraft/portfolio
 * Categories: flowcraft
 * Description: Grid of product or project cards with an image, title and short description.
 */
?>
<!-- wp:group {"anchor":"portfolio","style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" id="portfolio" style="padding-top:4rem;padding-bottom:4rem">

	<!-- wp:heading {"level":2,"align":"center"} -->
	<h2 class="wp-block-heading has-text-align-center">Products &amp; solutions</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center"} -->
	<p class="has-text-align-center">Showcase up to six of your top products, projects or case studies here.</p>
	<!-- /wp:paragraph -->

	<!-- wp:gallery {"columns":3,"linkTo":"none"} -->
	<figure class="wp-block-gallery has-nested-images columns-3 is-cropped">
		<!-- wp:image {"sizeSlug":"large"} -->
		<figure class="wp-block-image size-large"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/product-1.jpg' ) ); ?>" alt=""/><figcaption class="wp-element-caption">Product name</figcaption></figure>
		<!-- /wp:image -->
		<!-- wp:image {"sizeSlug":"large"} -->
		<figure class="wp-block-image size-large"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/product-2.jpg' ) ); ?>" alt=""/><figcaption class="wp-element-caption">Product name</figcaption></figure>
		<!-- /wp:image -->
		<!-- wp:image {"sizeSlug":"large"} -->
		<figure class="wp-block-image size-large"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/product-3.jpg' ) ); ?>" alt=""/><figcaption class="wp-element-caption">Product name</figcaption></figure>
		<!-- /wp:image -->
	</figure>
	<!-- /wp:gallery -->

</div>
<!-- /wp:group -->
