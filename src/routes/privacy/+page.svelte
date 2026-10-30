<script lang="ts">
	import Legal from '$lib/components/account/Legal.svelte';
</script>

<svelte:head>
	<title>Privacy Policy — AgroPlus.ID</title>
</svelte:head>

<Legal title="Privacy Policy" updated="October 2026">
	<p>This policy explains what personal data AgroPlus.ID collects when you create an account and how we use it.</p>

	<h2>What we collect</h2>
	<ul>
		<li><strong>Account details:</strong> your name, email address and phone number.</li>
		<li><strong>Addresses:</strong> shipping addresses you choose to save, including an optional map pin.</li>
		<li><strong>Preferences:</strong> your email notification choices and when you accepted our terms.</li>
		<li><strong>Orders:</strong> CoffeeID orders linked to your verified email address.</li>
	</ul>

	<h2>How we use it</h2>
	<ul>
		<li>To let you sign in and see your orders and coffee passports.</li>
		<li>To coordinate delivery. Your phone number may be shared with the courier handling your order, who often coordinate through WhatsApp.</li>
		<li>To email you about orders and, if you allow it, product updates and announcements.</li>
	</ul>

	<h2>Where it is stored</h2>
	<p>Account data is stored with Google Firebase (Authentication and Firestore). Only you and authorised AgroPlus.ID administrators can read it.</p>

	<h2>Your choices</h2>
	<ul>
		<li>Turn email notifications on or off at any time on your account page.</li>
		<li>Download a copy of your data from the Privacy &amp; data section.</li>
		<li>Delete your account there too, which removes your profile and saved addresses.</li>
	</ul>

	<h2>Contact</h2>
	<p>For privacy questions, reach us through the <a href="/#contact">contact section</a> of the website.</p>
</Legal>
