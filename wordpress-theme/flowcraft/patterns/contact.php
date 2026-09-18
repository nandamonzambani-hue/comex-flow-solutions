<?php
/**
 * Title: Contact details
 * Slug: flowcraft/contact
 * Categories: flowcraft
 * Description: Contact section with address, phone and email columns. Add your favorite form plugin's block inside this section for a working form.
 */
?>
<!-- wp:group {"anchor":"contact","backgroundColor":"surface","style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-surface-background-color has-background" id="contact" style="padding-top:4rem;padding-bottom:4rem">

	<!-- wp:heading {"level":2,"align":"center"} -->
	<h2 class="wp-block-heading has-text-align-center">Get in touch</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph {"align":"center"} -->
	<p class="has-text-align-center">Add your form plugin's block below this section, or edit the details here.</p>
	<!-- /wp:paragraph -->

	<!-- wp:columns -->
	<div class="wp-block-columns">

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3,"fontSize":"medium"} -->
			<h3 class="wp-block-heading has-medium-font-size">Address</h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p>123 Main Street<br>Your City, Country</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3,"fontSize":"medium"} -->
			<h3 class="wp-block-heading has-medium-font-size">Phone</h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p>+1 (000) 000-0000</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":3,"fontSize":"medium"} -->
			<h3 class="wp-block-heading has-medium-font-size">Email</h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p>hello@example.com</p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

	</div>
	<!-- /wp:columns -->

</div>
<!-- /wp:group -->
