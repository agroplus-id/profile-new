<script lang="ts">
	import { slideDown, magneticHover } from '$lib/motion';
	import logo from '$lib/assets/images/group-1233620.svg';

	let open = $state<string | null>(null);
	let mobileNavOpen = $state(false);

	function toggle(menu: string) {
		open = open === menu ? null : menu;
	}

	function close() {
		open = null;
		mobileNavOpen = false;
	}

	function toggleMobile() {
		mobileNavOpen = !mobileNavOpen;
	}
</script>

<svelte:window onclick={(e) => { 
	if (!(e.target as Element).closest('.nav') && !(e.target as Element).closest('.mobile-menu-drawer')) {
		close(); 
	}
}} />

<header class="nav" use:slideDown={{ duration: 0.65 }}>
	<a class="brand" href="/" onclick={close} aria-label="AgroPlus.ID home"><img src={logo} alt="AgroPlus.ID" /></a>
	
	<!-- Desktop Nav Links -->
	<nav class="nav-links desktop-only" aria-label="Main navigation">
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
				<a class="mega-card" href="/team" onclick={close}><strong>Team</strong><i>›</i></a>
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

	<div class="nav-actions">
		<a use:magneticHover class="nav-cta" href="/#contact" onclick={close}>Contact Us</a>
		<button
			type="button"
			class="mobile-toggle"
			class:is-active={mobileNavOpen}
			onclick={toggleMobile}
			aria-label="Toggle navigation menu"
			aria-expanded={mobileNavOpen}
		>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
		</button>
	</div>

	<!-- Mobile Menu Drawer -->
	{#if mobileNavOpen}
		<div class="mobile-menu-drawer" use:slideDown={{ duration: 0.35 }}>
			<a class="mobile-link" href="/" onclick={close}>Home</a>
			
			<div class="mobile-accordion">
				<button class="mobile-accordion-title" onclick={() => toggle('projects')}>
					Projects <span>{open === 'projects' ? '−' : '+'}</span>
				</button>
				{#if open === 'projects'}
					<div class="mobile-sublinks">
						<a href="/agro-capture" onclick={close}>AgroCapture <span>Field intelligence</span></a>
						<a href="/ferroir" onclick={close}>Ferroir <span>Connected fermentation</span></a>
						<a href="/fermego" onclick={close}>Fermego <span>Fermentation monitoring</span></a>
					</div>
				{/if}
			</div>

			<div class="mobile-accordion">
				<button class="mobile-accordion-title" onclick={() => toggle('about')}>
					About us <span>{open === 'about' ? '−' : '+'}</span>
				</button>
				{#if open === 'about'}
					<div class="mobile-sublinks">
						<a href="/team" onclick={close}>Team</a>
						<a href="/#about" onclick={close}>Roadmap</a>
					</div>
				{/if}
			</div>

			<div class="mobile-accordion">
				<button class="mobile-accordion-title" onclick={() => toggle('tools')}>
					Tools <span>{open === 'tools' ? '−' : '+'}</span>
				</button>
				{#if open === 'tools'}
					<div class="mobile-sublinks">
						<a href="/#tools" onclick={close}>Supply Verification</a>
						<a href="/#tools" onclick={close}>Coffee Supply Maps</a>
						<a href="/#tools" onclick={close}>Species Checker</a>
						<a href="/#tools" onclick={close}>Coffee Identity Research</a>
					</div>
				{/if}
			</div>

			<a class="mobile-cta-btn" href="/#contact" onclick={close}>Contact Us</a>
		</div>
	{/if}
</header>

<style>
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.nav-trigger {
		background: none;
		border: none;
		cursor: pointer;
		font: inherit;
		font-weight: 600;
		padding: 0 8px;
		min-height: 38px;
		color: inherit;
		transition: color 0.2s ease, transform 0.2s ease;
	}

	.nav-trigger:hover {
		transform: translateY(-1px);
	}

	.nav-item .mega-menu,
	.nav-item .tools-menu {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translate(-50%, -12px) scale(0.98);
		transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s ease;
	}

	.nav-item.is-open .mega-menu,
	.nav-item.is-open .tools-menu {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transform: translate(-50%, 0) scale(1);
	}

	.tools-item .tools-menu {
		transform: translate(-50%, -12px) scale(0.98);
	}

	.tools-item.is-open .tools-menu {
		transform: translate(-50%, 0) scale(1);
	}

	/* Hamburger Button */
	.mobile-toggle {
		display: none;
		flex-direction: column;
		justify-content: space-between;
		width: 40px;
		height: 38px;
		padding: 10px 8px;
		background: rgba(216, 228, 198, 0.6);
		border: 1px solid rgba(37, 51, 15, 0.2);
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.mobile-toggle:hover {
		background: rgba(216, 228, 198, 0.9);
	}

	.hamburger-line {
		display: block;
		width: 100%;
		height: 2px;
		background-color: #25330f;
		border-radius: 2px;
		transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
	}

	.mobile-toggle.is-active .hamburger-line:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.mobile-toggle.is-active .hamburger-line:nth-child(2) {
		opacity: 0;
	}

	.mobile-toggle.is-active .hamburger-line:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	/* Mobile Drawer */
	.mobile-menu-drawer {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 24px;
		background: rgba(240, 243, 241, 0.98);
		border-bottom: 1px solid rgba(37, 51, 15, 0.2);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(20px);
		z-index: 100;
	}

	.mobile-link {
		font-size: 1.25rem;
		font-weight: 700;
		color: #25330f;
		padding: 8px 0;
	}

	.mobile-accordion {
		border-top: 1px solid rgba(37, 51, 15, 0.12);
		padding-top: 12px;
	}

	.mobile-accordion-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		background: none;
		border: none;
		font: inherit;
		font-size: 1.25rem;
		font-weight: 700;
		color: #25330f;
		padding: 8px 0;
		cursor: pointer;
	}

	.mobile-sublinks {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px 0 8px 16px;
	}

	.mobile-sublinks a {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 1.05rem;
		font-weight: 700;
		color: #45552d;
	}

	.mobile-sublinks a span {
		font-size: 0.85rem;
		font-weight: 500;
		color: #6a7d50;
	}

	.mobile-cta-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		margin-top: 12px;
		background: #25330f;
		color: #f0f3f1;
		font-weight: 700;
		border-radius: 8px;
		text-align: center;
	}

	@media (max-width: 960px) {
		.desktop-only {
			display: none !important;
		}

		.mobile-toggle {
			display: flex;
		}

		.nav-cta {
			display: none;
		}
	}
</style>
