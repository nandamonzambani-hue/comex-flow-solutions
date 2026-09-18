<?php
/**
 * Title: Partner logos + testimonial
 * Slug: flowcraft/testimonials
 * Categories: flowcraft
 * Description: A strip of partner or client logos followed by a single featured testimonial.
 */
?>
<!-- wp:group {"backgroundColor":"muted","style":{"spacing":{"padding":{"top":"3rem","bottom":"3rem"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-muted-background-color has-background" style="padding-top:3rem;padding-bottom:3rem">

	<!-- wp:paragraph {"align":"center","fontSize":"small","textColor":"muted-foreground"} -->
	<p class="has-text-align-center has-muted-foreground-color has-text-color has-small-font-size">Trusted by teams at</p>
	<!-- /wp:paragraph -->

	<!-- wp:columns {"verticalAlignment":"center"} -->
	<div class="wp-block-columns are-vertically-aligned-center">
		<!-- wp:column {"verticalAlignment":"center"} -->
		<div class="wp-block-column is-vertically-aligned-center"><!-- wp:image {"height":32,"sizeSlug":"full"} --><figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/partner-logo-1.png' ) ); ?>" alt="Northpeak" height="32"/></figure><!-- /wp:image --></div>
		<!-- /wp:column -->
		<!-- wp:column {"verticalAlignment":"center"} -->
		<div class="wp-block-column is-vertically-aligned-center"><!-- wp:image {"height":32,"sizeSlug":"full"} --><figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/partner-logo-2.png' ) ); ?>" alt="Vertex Works" height="32"/></figure><!-- /wp:image --></div>
		<!-- /wp:column -->
		<!-- wp:column {"verticalAlignment":"center"} -->
		<div class="wp-block-column is-vertically-aligned-center"><!-- wp:image {"height":32,"sizeSlug":"full"} --><figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/partner-logo-3.png' ) ); ?>" alt="Solstice Group" height="32"/></figure><!-- /wp:image --></div>
		<!-- /wp:column -->
		<!-- wp:column {"verticalAlignment":"center"} -->
		<div class="wp-block-column is-vertically-aligned-center"><!-- wp:image {"height":32,"sizeSlug":"full"} --><figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/partner-logo-4.png' ) ); ?>" alt="Meridian Co." height="32"/></figure><!-- /wp:image --></div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->

	<!-- wp:quote {"align":"center","style":{"typography":{"fontSize":"1.35rem","fontStyle":"italic"}}} -->
	<blockquote class="wp-block-quote has-text-align-center" style="font-style:italic;font-size:1.35rem">
		<p>“Replace this with a real quote from a happy client. Keep it short and specific about the result you delivered.”</p>
		<cite>Client Name, Company</cite>
	</blockquote>
	<!-- /wp:quote -->

</div>
<!-- /wp:group -->
