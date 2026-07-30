<script lang="ts">
	import logo from '$lib/assets/images/group-1233620.svg';

	let open = $state<string | null>(null);

	function toggle(menu: string) {
		open = open === menu ? null : menu;
	}

	function close() {
		open = null;
	}
</script>

<svelte:window onclick={(e) => { if (!(e.target as Element).closest('.nav-item')) close(); }} />

<header class="nav">
	<a class="brand" href="/" aria-label="AgroPlus.ID home"><img src={logo} alt="AgroPlus.ID" /></a>
	<nav class="nav-links" aria-label="Main navigation">
		<a href="/">Home</a>
		<div class="nav-item" class:is-open={open === 'projects'}>
			<button class="nav-trigger" onclick={() => toggle('projects')} aria-expanded={open === 'projects'}>Projects</button>
			<div class="mega-menu projects-menu">
				<a class="mega-card" href="/agro-capture" onclick={close}><strong>AgroCapture</strong><span>Seeing every coffee field differently</span><i>›</i></a>
				<a class="mega-card" href="/ferroir" onclick={close}><strong>Ferroir</strong><span>Connected fermentation, thoughtfully designed</span><i>›</i></a>
				<a class="mega-card" href="/fermego" onclick={close}><strong>Fermego</strong><span>Modern monitoring for familiar fermentation.</span><i>›</i></a>
			</div>
		</div>
		<div class="nav-item" class:is-open={open === 'about'}>
			<button class="nav-trigger" onclick={() => toggle('about')} aria-expanded={open === 'about'}>About us</button>
			<div class="mega-menu about-menu">
				<a class="mega-card" href="/#about" onclick={close}><strong>Team</strong><i>›</i></a>
				<a class="mega-card" href="/#about" onclick={close}><strong>Roadmap</strong><i>›</i></a>
				<div class="mega-card mega-empty" aria-hidden="true"></div>
			</div>
		</div>
		<div class="nav-item tools-item" class:is-open={open === 'tools'}>
			<button class="nav-trigger" onclick={() => toggle('tools')} aria-expanded={open === 'tools'}>Tools</button>
			<div class="tools-menu">
				<a href="/#tools" onclick={close}>Supply Verification</a>
				<a href="/#tools" onclick={close}>Coffee Supply Maps</a>
				<a href="/#tools" onclick={close}>Species Checker</a>
				<a href="/#tools" onclick={close}>Coffee Identity Research</a>
			</div>
		</div>
	</nav>
	<a class="nav-cta" href="/#contact">Contact Us</a>
</header>

<style>
	.nav-trigger {
		background: none;
		border: none;
		cursor: pointer;
		font: inherit;
		font-weight: 600;
		padding: 0 8px;
		min-height: 38px;
		color: inherit;
	}

	.nav-item .mega-menu,
	.nav-item .tools-menu {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translate(-50%, -8px);
	}

	.nav-item.is-open .mega-menu,
	.nav-item.is-open .tools-menu {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transform: translate(-50%, 0);
	}

	.tools-item .tools-menu {
		transform: translate(-50%, -8px);
	}

	.tools-item.is-open .tools-menu {
		transform: translate(-50%, 0);
	}
</style>
