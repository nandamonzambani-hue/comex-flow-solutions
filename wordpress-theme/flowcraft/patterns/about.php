<?php
/**
 * Title: About with stats
 * Slug: flowcraft/about
 * Categories: flowcraft
 * Description: Two column section with an image on one side, text and a row of stats on the other.
 */
?>
<!-- wp:group {"anchor":"about","backgroundColor":"surface","style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-surface-background-color has-background" id="about" style="padding-top:4rem;padding-bottom:4rem">

	<!-- wp:columns {"verticalAlignment":"center"} -->
	<div class="wp-block-columns are-vertically-aligned-center">

		<!-- wp:column {"verticalAlignment":"center"} -->
		<div class="wp-block-column is-vertically-aligned-center">
			<!-- wp:image {"style":{"border":{"radius":"12px"}}} -->
			<figure class="wp-block-image"><img src="" alt="Team at work" style="border-radius:12px"/></figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"verticalAlignment":"center"} -->
		<div class="wp-block-column is-vertically-aligned-center">
			<!-- wp:paragraph {"textColor":"primary","style":{"typography":{"fontSize":"0.9rem","textTransform":"uppercase","letterSpacing":"0.08em"}}} -->
			<p class="has-primary-color has-text-color" style="letter-spacing:0.08em;font-size:0.9rem;text-transform:uppercase">About us</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"level":2} -->
			<h2 class="wp-block-heading">Years of experience, one clear focus</h2>
			<!-- /wp:heading -->

			<!-- wp:paragraph -->
			<p>Replace this with your company story: how you started, what you specialize in, and why customers choose you over the alternatives.</p>
			<!-- /wp:paragraph -->

			<!-- wp:columns -->
			<div class="wp-block-columns">
				<!-- wp:column -->
				<div class="wp-block-column">
					<!-- wp:heading {"level":3,"fontSize":"x-large","textColor":"primary"} -->
					<h3 class="wp-block-heading has-primary-color has-text-color has-x-large-font-size">10+</h3>
					<!-- /wp:heading -->
					<!-- wp:paragraph {"fontSize":"small"} -->
					<p class="has-small-font-size">Years in business</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:column -->
				<!-- wp:column -->
				<div class="wp-block-column">
					<!-- wp:heading {"level":3,"fontSize":"x-large","textColor":"primary"} -->
					<h3 class="wp-block-heading has-primary-color has-text-color has-x-large-font-size">500+</h3>
					<!-- /wp:heading -->
					<!-- wp:paragraph {"fontSize":"small"} -->
					<p class="has-small-font-size">Projects delivered</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:column -->
				<!-- wp:column -->
				<div class="wp-block-column">
					<!-- wp:heading {"level":3,"fontSize":"x-large","textColor":"primary"} -->
					<h3 class="wp-block-heading has-primary-color has-text-color has-x-large-font-size">98%</h3>
					<!-- /wp:heading -->
					<!-- wp:paragraph {"fontSize":"small"} -->
					<p class="has-small-font-size">Client satisfaction</p>
					<!-- /wp:paragraph -->
				</div>
				<!-- /wp:column -->
			</div>
			<!-- /wp:columns -->
		</div>
		<!-- /wp:column -->

	</div>
	<!-- /wp:columns -->

</div>
<!-- /wp:group -->
