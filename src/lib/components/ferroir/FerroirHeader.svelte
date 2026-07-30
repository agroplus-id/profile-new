<script lang="ts">import logo from '$lib/assets/images/desktop 9/group-1233620.svg';</script>
<header class="ferroir-nav">
	<a href="/" aria-label="AgroPlus home"><img src={logo} alt="AgroPlus.ID" /></a>
	<nav aria-label="Main navigation">
		<a href="/">Home</a>
		<a href="/#projects">Projects</a>
		<a href="/#about">About us</a>
	</nav>
	<a class="tools-link" href="/#tools">Tools</a>
	<a class="contact-button" href="#contact">Contact Us</a>
</header>

<style>
	.ferroir-nav {
		position: sticky;
		top: 0;
		z-index: 20;
		display: grid;
		grid-template-columns: auto auto 1fr auto auto;
		align-items: center;
		gap: clamp(20px, 3.7vw, 62px);
		min-height: 76px;
		padding: 12px clamp(24px, 7vw, 112px);
		background: #f6f8f6;
		color: #24330e;
		box-shadow: 0 1px 0 rgba(37, 51, 15, 0.16);
	}

	.ferroir-nav img { display: block; width: clamp(145px, 12vw, 180px); }
	.ferroir-nav nav { display: flex; gap: clamp(24px, 3.2vw, 56px); font-weight: 700; }
	.tools-link { justify-self: end; font-weight: 700; }
	.contact-button { padding: 10px 24px; border-radius: 8px; background: #25350d; color: #fff; font-weight: 700; }

	@media (max-width: 720px) {
		.ferroir-nav { grid-template-columns: 1fr auto; gap: 14px; min-height: 68px; padding: 10px 20px; }
		.ferroir-nav img { width: 142px; }
		.ferroir-nav nav { grid-column: 1 / -1; grid-row: 2; justify-content: flex-start; overflow: auto; gap: 22px; font-size: 0.9rem; }
		.tools-link { display: none; }
		.contact-button { padding: 10px 14px; font-size: 0.88rem; }
	}
</style>
