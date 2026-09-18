<?php
/**
 * Title: Hero with CTA
 * Slug: flowcraft/hero
 * Categories: flowcraft
 * Description: Full-width hero banner with headline, supporting text and two call-to-action buttons.
 */
?>
<!-- wp:cover {"overlayColor":"contrast","dimRatio":40,"minHeight":560,"minHeightUnit":"px","gradient":"hero-gradient","align":"full","style":{"spacing":{"padding":{"top":"6rem","bottom":"6rem","left":"1.5rem","right":"1.5rem"}}}} -->
<div class="wp-block-cover alignfull" style="padding-top:6rem;padding-right:1.5rem;padding-bottom:6rem;padding-left:1.5rem;min-height:560px">
	<span aria-hidden="true" class="wp-block-cover__background has-background-dim-40 has-background-dim has-background-gradient has-hero-gradient-gradient-background"></span>
	<div class="wp-block-cover__inner-container">
		<!-- wp:group {"layout":{"type":"constrained","contentSize":"760px"}} -->
		<div class="wp-block-group">

			<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.9rem","textTransform":"uppercase","letterSpacing":"0.08em"}},"textColor":"accent"} -->
			<p class="has-accent-color has-text-color" style="letter-spacing:0.08em;font-size:0.9rem;text-transform:uppercase">Trusted by growing businesses</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"level":1,"textColor":"surface","fontSize":"xx-large"} -->
			<h1 class="has-surface-color has-text-color has-xx-large-font-size">Solutions engineered for your industry</h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"textColor":"surface","style":{"typography":{"fontSize":"1.15rem"}}} -->
			<p class="has-surface-color has-text-color" style="font-size:1.15rem">Replace this with a short pitch: what you do, who you help, and why it matters. Two or three sentences is enough.</p>
			<!-- /wp:paragraph -->

			<!-- wp:buttons -->
			<div class="wp-block-buttons">
				<!-- wp:button {"backgroundColor":"accent","textColor":"contrast"} -->
				<div class="wp-block-button">
					<a class="wp-block-button__link has-contrast-color has-accent-background-color has-text-color has-background wp-element-button" href="#contact">Request a quote</a>
				</div>
				<!-- /wp:button -->

				<!-- wp:button {"className":"is-style-outline","textColor":"surface"} -->
				<div class="wp-block-button is-style-outline">
					<a class="wp-block-button__link has-surface-color has-text-color wp-element-button" href="#services">See what we offer</a>
				</div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->

		</div>
		<!-- /wp:group -->
	</div>
</div>
<!-- /wp:cover -->
