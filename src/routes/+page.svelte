<script lang="ts">
	import { onMount } from 'svelte';

	type Product = {
		name: string;
		kicker: string;
		year: string;
		titleSvg: string;
		mainImage: string;
		mainAlt: string;
		tagline: string;
		specs: { label: string; value: string }[];
	};

	const products: Product[] = [
		{
			name: 'Ferroir',
			kicker: 'Ferroir-V2',
			year: 'Launching 2027',
			titleSvg: '/images/ferroir-v-20.svg',
			mainImage: '/images/_673257-ea-35-e-3-416-e-ae-0-c-c-4254710-b-3-ca-20.png',
			mainAlt: 'Ferroir fermentation kit',
			tagline: 'The Next-Gen Fermentation Kit for Beginners',
			specs: [
				{ label: 'Capacity', value: '60 Liters' },
				{ label: 'Energy Consumption', value: '2.3 KWH' },
				{ label: 'Connectivity', value: 'Bluetooth & Wi-Fi' },
				{ label: 'Pressure Tolerance', value: '35 PSI' },
				{ label: 'Height', value: '120 CM' },
				{ label: 'Mass', value: '23 KG' }
			]
		},
		{
			name: 'Fermego',
			kicker: 'Fermego',
			year: 'Launching 2026',
			titleSvg: '/images/fermego1.svg',
			mainImage: '/images/_8-bcd-8-b-63-7-ad-7-431-c-87-ce-882-a-48-a-88-eee-10.png',
			mainAlt: 'Fermego smart fermentation barrel',
			tagline: 'Smarter Fermentation Starts Here.',
			specs: [
				{ label: 'Material', value: '3D printed ASA' },
				{ label: 'Dimension', value: '15 x 10 x 5 cm' },
				{ label: 'Energy Consumption', value: '5 V' },
				{ label: 'Connection', value: 'Bluetooth & Wifi' },
				{ label: 'Sensor Width', value: '60 CM' },
				{ label: 'Mass', value: '1 KG' }
			]
		},
		{
			name: 'AgroCapture',
			kicker: 'AgroCapture',
			year: 'Launching 2026',
			titleSvg: '/images/agro-capture1.svg',
			mainImage: '/images/i-phone-13-pro0.png',
			mainAlt: 'AgroCapture mobile app screens',
			tagline: 'Better Coffee Begins with Better Insights.',
			specs: [{ label: 'Device Support', value: 'Ios & Android' }]
		}
	];

	const updates = Array.from({ length: 6 }, (_, index) => ({
		title: 'The Next-Gen Fermentation Kit for Beginners',
		date: index < 3 ? 'June 24, 2025' : 'June 26, 2025'
	}));

	const pressItems = [
		{
			title: 'Press Logo',
			body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		},
		{
			title: 'Press Logo',
			body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		},
		{
			title: 'Press Logo',
			body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
		}
	];

	const partnerLogos = [
		'/images/kedutaan-besar-inggris-di-jakarta-02-1-10.png',
		'/images/images-100.png',
		'/images/images-1-30.png',
		'/images/logo-instellar-impact-20.png',
		'/images/images-2-30.png',
		'/images/uk-indonesia-tech-hub-20.png',
		'/images/kedutaan-besar-inggris-di-jakarta-02-1-20.png'
	];

	let activeProduct = $state(0);
	let heroVideo = $state<HTMLVideoElement>();
	let heroMuted = $state(true);
	const active = $derived(products[activeProduct]);

	onMount(() => {
		if (!heroVideo) return;

		heroVideo.muted = true;
		heroVideo.play().catch(() => {
			// Browsers may still wait for user interaction.
		});
	});

	function nextProduct() {
		activeProduct = (activeProduct + 1) % products.length;
	}

	function previousProduct() {
		activeProduct = (activeProduct - 1 + products.length) % products.length;
	}

	function playHeroWithSound() {
		if (!heroVideo) return;

		heroMuted = false;
		heroVideo.muted = false;
		heroVideo.play().catch(() => {
			// If the browser blocks it, the native controls are still available.
		});
	}
</script>

<svelte:head>
	<title>AgroPlus.ID</title>
	<meta
		name="description"
		content="AgroPlus.ID landing page for upstream coffee technology products."
	/>
</svelte:head>

<main class="site-shell">
	<header class="nav">
		<a class="brand" href="#home" aria-label="AgroPlus.ID home">
			<img src="/images/group-1233620.svg" alt="AgroPlus.ID" />
		</a>

		<nav class="nav-links" aria-label="Main navigation">
			<a href="#home">Home</a>
			<div class="nav-item">
				<a class="nav-trigger" href="#projects">Projects</a>
				<div class="mega-menu projects-menu">
					<a class="mega-card" href="#tools">
						<strong>AgroCapture</strong>
						<span>Seeing every coffee field differently</span>
						<i>›</i>
					</a>
					<a class="mega-card" href="#tools">
						<strong>Ferroir</strong>
						<span>Connected fermentation, thoughtfully designed</span>
						<i>›</i>
					</a>
					<a class="mega-card" href="#tools">
						<strong>Fermego</strong>
						<span>Modern monitoring for familiar fermentation.</span>
						<i>›</i>
					</a>
				</div>
			</div>
			<div class="nav-item">
				<a class="nav-trigger" href="#about">About us</a>
				<div class="mega-menu about-menu">
					<a class="mega-card" href="#about">
						<strong>Team</strong>
						<i>›</i>
					</a>
					<a class="mega-card" href="#about">
						<strong>Roadmap</strong>
						<i>›</i>
					</a>
					<div class="mega-card mega-empty" aria-hidden="true"></div>
				</div>
			</div>
			<div class="nav-item tools-item">
				<a class="nav-trigger" href="#tools">Tools</a>
				<div class="tools-menu">
					<a href="#tools">Supply Verication</a>
					<a href="#tools">Coffee Supply Maps</a>
					<a href="#tools">Species Checker</a>
					<a href="#tools">Coffee Identity Research</a>
				</div>
			</div>
		</nav>

		<a class="nav-cta" href="#contact">Contact Us</a>
	</header>

	<section class="hero" id="home" aria-labelledby="hero-title">
		<video
			bind:this={heroVideo}
			class="hero-video"
			autoplay
			loop
			muted={heroMuted}
			playsinline
			controls
			poster="/images/image-940.png"
		>
			<source src="/videos/comprof-landscape.mp4" type="video/mp4" />
		</video>
		<div class="hero-overlay"></div>
		<div class="hero-content">
			<h1 id="hero-title">Building next-generation upstream coffee tech industry</h1>
			<button class="video-link" type="button" onclick={playHeroWithSound}>
				<span></span>
				<img src="/images/chevron-right0.png" alt="" aria-hidden="true" />
				Watch full video
			</button>
		</div>
	</section>

	<section class="intro-section" aria-labelledby="intro-title">
		<img class="corner corner-top-left" src="/images/group-1234980.svg" alt="" aria-hidden="true" />
		<img class="corner corner-top-right" src="/images/group-1234990.svg" alt="" aria-hidden="true" />
		<img class="corner corner-bottom-left" src="/images/group-1235000.svg" alt="" aria-hidden="true" />
		<img class="corner corner-bottom-right" src="/images/group-1235010.svg" alt="" aria-hidden="true" />
		<h2 id="intro-title">
			Agroplus is developing next-gen upstream technology of coffee industry based on easiness
			user experience.
		</h2>
	</section>

	<section class="proof-section" id="projects" aria-labelledby="proof-title">
		<div class="proof-card">
			<div class="proof-copy">
				<h2 id="proof-title">
					Agroplus Proving: Coffee land origin visit for Agroplus technologies product
				</h2>
				<div>
					<p>
						In Desember 2025, Agroplus Demo achieved a review success after market validation
						from the Wandhe Estate Family Ecosystem. The result is Ferroir, the fermentation
						tools for newborn coffee processor, and the ferment-tank will launch at August 2026.
					</p>
					<a class="text-link" href="#tools">Learn more</a>
				</div>
			</div>

			<div class="proof-video" aria-label="Video placeholder">
				<button class="video-link proof-video-link" type="button" onclick={playHeroWithSound}>
					<span></span>
					<img src="/images/chevron-right0.png" alt="" aria-hidden="true" />
					Watch full video
				</button>
			</div>
		</div>
	</section>

	<section class="product-showcase" id="tools" aria-labelledby="product-title">
		<div class="product-stage">
			<div class="product-meta">
				<p>{active.kicker}</p>
				<strong>{active.year}</strong>
			</div>

			<div class="product-specs" aria-label={`${active.name} specifications`}>
				{#each active.specs as spec}
					<div>
						<span>{spec.label} :</span>
						<strong>{spec.value}</strong>
					</div>
				{/each}
			</div>

			<div class="product-title-bg" aria-hidden="true">
				<img src={active.titleSvg} alt="" />
			</div>
			<div class="dial" aria-hidden="true"></div>
			<img class:phone-product={active.name === 'AgroCapture'} class="product-image" src={active.mainImage} alt={active.mainAlt} />

			<h2 id="product-title">{active.tagline}</h2>

			<div class="product-controls" aria-label="Product carousel controls">
				<button type="button" onclick={previousProduct} aria-label="Previous product">‹</button>
				<div class="product-dots" aria-label="Choose product">
					{#each products as product, index}
						<button
							type="button"
							class:active-dot={index === activeProduct}
							onclick={() => (activeProduct = index)}
							aria-label={`Show ${product.name}`}
							aria-current={index === activeProduct ? 'true' : undefined}
						></button>
					{/each}
				</div>
				<button type="button" onclick={nextProduct} aria-label="Next product">›</button>
			</div>
		</div>
	</section>

	<section class="mission" id="about" aria-labelledby="mission-title">
		<div class="mission-heading">
			<p>Mission &amp; Vision</p>
			<h2 id="mission-title">Designed for Better Coffee Quality.</h2>
			<a href="#contact">GET IN TOUCH</a>
		</div>

		<img
			class="coffee-plant"
			src="/images/pngtree-coffee-plant-vector-image-png-image-12181044-10.png"
			alt="Coffee plant illustration"
		/>

		<div class="mission-copy">
			<p>
				We believe the future of coffee isn't built by adding complexity, but by designing
				technology that feels effortless to use. Our mission is to create connected solutions
				that make upstream coffee production more visible, more manageable, and naturally
				integrated into everyday work.
			</p>
			<p>
				At <em>AgroPlus</em>, we imagine a future where every coffee grower and processor has
				access to thoughtfully designed technology. By combining practical innovation with
				connected systems, we strive to make the upstream coffee industry more transparent, more
				efficient, and ready for the next generation.
			</p>
		</div>
	</section>

	<section class="updates-section" aria-labelledby="updates-title">
		<div class="section-heading">
			<h2 id="updates-title">Updates</h2>
			<a href="/">More Updates</a>
		</div>

		<div class="updates-grid">
			{#each updates as update}
				<article class="update-card">
					<div class="update-thumb"></div>
					<p><span>Press Release</span><i></i>{update.date}</p>
					<h3>{update.title}</h3>
				</article>
			{/each}
		</div>
	</section>

	<section class="press-section" aria-labelledby="press-title">
		<div class="section-heading">
			<h2 id="press-title">In the press</h2>
			<div class="press-arrows" aria-hidden="true">
				<span>‹</span>
				<span>›</span>
			</div>
		</div>

		<div class="press-grid">
			{#each pressItems as item}
				<article>
					<h3>{item.title}</h3>
					<p>"{item.body}</p>
				</article>
			{/each}
		</div>

		<div class="logo-strip" aria-label="Partner logos">
			{#each partnerLogos as logo}
				<img src={logo} alt="Partner logo" />
			{/each}
		</div>
	</section>

	<section class="signup-section" aria-labelledby="signup-title">
		<h2 id="signup-title">Sign up<br />for updates</h2>
		<form class="signup-form">
			<label for="email">Email</label>
			<div>
				<input id="email" type="email" placeholder="Enter your email" />
				<button type="submit">Sign up</button>
			</div>
			<p>
				By subscribing you agree to our Privacy Policy and provide consent to receive updates
				from Agroplus.
			</p>
		</form>
	</section>

	<footer class="footer" id="contact">
		<div class="footer-contact">
			<h2>Contact</h2>
			<p>Jl. MT. Haryono No.169,<br />Malang, East Java 65145<br />Indonesia</p>
			<a href="mailto:inquiries@agroplusid.com">inquiries@agroplusid.com</a>
			<img src="/images/group-1233621.svg" alt="AgroPlus.ID" />
			<div class="legal-links">
				<a href="/">Privacy Police</a>
				<a href="/">Terms of Use</a>
			</div>
		</div>

		<div class="footer-links">
			<div>
				<h2>Product</h2>
				<a href="#tools">Ferroir</a>
				<a href="#tools">Fermego</a>
				<a href="#tools">Agro-Capture</a>
			</div>
			<div>
				<h2>About Agroplus</h2>
				<a href="#about">Team</a>
				<a href="#about">Roadmap</a>
				<a href="#contact">Contact</a>
				<a href="/">Media Assets</a>
				<a href="/">Suppliers</a>
			</div>
		</div>

		<div class="socials">
			<img src="/images/linked-in-20.png" alt="LinkedIn" />
			<img src="/images/instagram0.png" alt="Instagram" />
			<span>© 2025 AgroPlus.ID, Inc. All rights reserved.</span>
		</div>
	</footer>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		margin: 0;
		background: #f0f3f1;
		color: #25330f;
		font-family:
			Poppins,
			Inter,
			Arial,
			sans-serif;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	:global(button),
	:global(input) {
		font: inherit;
	}

	.site-shell {
		width: 100%;
		margin: 0;
		background: #f0f3f1;
		overflow: hidden;
	}

	.nav {
		position: sticky;
		top: 0;
		z-index: 20;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 32px;
		min-height: 100px;
		padding: 22px clamp(24px, 7vw, 120px);
		background: rgba(240, 243, 241, 0.96);
		box-shadow: 0 10px 30px rgba(21, 28, 12, 0.08);
		backdrop-filter: blur(18px);
	}

	.brand img {
		display: block;
		width: clamp(148px, 14vw, 200px);
		height: auto;
	}

	.nav-links {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(20px, 3.2vw, 48px);
		font-size: clamp(0.9rem, 1.15vw, 1.5rem);
		font-weight: 600;
	}

	.nav-links > a,
	.nav-trigger {
		display: inline-flex;
		align-items: center;
		min-height: 38px;
		padding: 0 8px;
	}

	.nav-item {
		position: relative;
		display: inline-flex;
		align-items: center;
	}

	.nav-item:hover .nav-trigger,
	.nav-item:focus-within .nav-trigger {
		background: #d8e4c6;
		color: #45552d;
	}

	.mega-menu,
	.tools-menu {
		position: absolute;
		top: calc(100% + 22px);
		z-index: 30;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translateY(-8px);
		transition:
			opacity 160ms ease,
			transform 160ms ease,
			visibility 160ms ease;
	}

	.nav-item:hover .mega-menu,
	.nav-item:focus-within .mega-menu,
	.nav-item:hover .tools-menu,
	.nav-item:focus-within .tools-menu {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transform: translateY(0);
	}

	.mega-menu {
		position: fixed;
		top: 100px;
		left: 50%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: min(1512px, calc(100vw - 56px));
		min-height: 170px;
		overflow: hidden;
		border: 1px solid rgba(37, 51, 15, 0.35);
		border-radius: 0 0 28px 28px;
		background: rgba(240, 243, 241, 0.98);
		box-shadow: 0 22px 34px rgba(0, 0, 0, 0.2);
		transform: translate(-50%, -8px);
		backdrop-filter: blur(16px);
	}

	.nav-item:hover .mega-menu,
	.nav-item:focus-within .mega-menu {
		transform: translate(-50%, 0);
	}

	.mega-card {
		display: grid;
		align-content: start;
		gap: 18px;
		min-height: 170px;
		padding: 46px clamp(34px, 4.4vw, 70px) 34px;
		border-right: 1px solid rgba(37, 51, 15, 0.35);
		color: #45552d;
		font-size: 0.9rem;
		line-height: 1.05;
	}

	.mega-card:last-child {
		border-right: 0;
	}

	.mega-card strong {
		color: #45552d;
		font-size: clamp(1.15rem, 1.75vw, 1.9rem);
		line-height: 1;
	}

	.mega-card span {
		max-width: 280px;
		color: #25330f;
		font-size: clamp(0.82rem, 1vw, 1.05rem);
		font-weight: 700;
	}

	.mega-card i {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		margin-top: 8px;
		border: 1px solid #c9d7b7;
		color: #849962;
		font-style: normal;
		font-size: 1.25rem;
		line-height: 1;
	}

	.mega-empty {
		pointer-events: none;
	}

	.tools-menu {
		left: 50%;
		right: auto;
		display: grid;
		gap: 24px;
		width: min(380px, calc(100vw - 48px));
		padding: 38px 42px 36px;
		border: 1px solid rgba(37, 51, 15, 0.18);
		border-radius: 0 0 28px 28px;
		background: rgba(240, 243, 241, 0.98);
		box-shadow: 0 18px 30px rgba(0, 0, 0, 0.18);
		color: #45552d;
		font-size: clamp(1rem, 1.35vw, 1.55rem);
		font-weight: 800;
		line-height: 1.05;
		transform: translate(-50%, -8px);
		backdrop-filter: blur(16px);
	}

	.tools-item:hover .tools-menu,
	.tools-item:focus-within .tools-menu {
		transform: translate(-50%, 0);
	}

	.nav-cta,
	.mission-heading a,
	.section-heading a,
	.signup-form button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 50px;
		padding: 0 28px;
		border-radius: 8px;
		background: #25330f;
		color: #f0f3f1;
		font-weight: 700;
		box-shadow: 0 8px 14px rgba(37, 51, 15, 0.22);
	}

	.hero {
		position: relative;
		min-height: min(882px, calc(100svh - 100px));
		background: #030403;
		overflow: hidden;
	}

	.hero-video,
	.hero-overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.hero-video {
		object-fit: cover;
		opacity: 0.62;
	}

	.hero-overlay {
		background:
			linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.86)),
			radial-gradient(circle at 78% 22%, rgba(132, 153, 98, 0.18), transparent 26%);
		pointer-events: none;
	}

	.hero-content {
		position: absolute;
		z-index: 3;
		left: clamp(28px, 7vw, 120px);
		bottom: clamp(48px, 8vw, 98px);
		width: min(720px, 78vw);
	}

	.hero h1 {
		margin: 0 0 34px;
		color: #849962;
		font-size: clamp(3rem, 4.9vw, 5rem);
		font-weight: 800;
		letter-spacing: 0;
		line-height: 0.86;
	}

	.video-link {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		min-height: 50px;
		padding: 0 18px 0 0;
		background: rgba(240, 243, 241, 0.52);
		color: #25330f;
		border: 0;
		cursor: pointer;
		font-weight: 700;
		backdrop-filter: blur(18px);
	}

	.video-link span {
		width: 50px;
		height: 50px;
		background: rgba(240, 243, 241, 0.58);
	}

	.video-link img {
		width: 20px;
		height: 20px;
		object-fit: contain;
		flex: 0 0 auto;
	}

	.intro-section {
		position: relative;
		min-height: 720px;
		display: grid;
		align-items: center;
		padding: clamp(90px, 12vw, 160px) clamp(28px, 9vw, 140px) clamp(120px, 14vw, 190px);
		background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f3f1 72%);
	}

	.intro-section h2 {
		max-width: 820px;
		margin: 0;
		color: #849962;
		font-size: clamp(2.6rem, 4.2vw, 5.1rem);
		font-weight: 800;
		line-height: 0.98;
		letter-spacing: 0;
	}

	.corner {
		position: absolute;
		width: 20px;
		height: 20px;
		pointer-events: none;
	}

	.corner-top-left,
	.corner-bottom-left {
		left: clamp(30px, 7vw, 100px);
	}

	.corner-top-right,
	.corner-bottom-right {
		right: clamp(30px, 7vw, 100px);
	}

	.corner-top-left,
	.corner-top-right {
		top: clamp(40px, 6vw, 80px);
	}

	.corner-bottom-left,
	.corner-bottom-right {
		bottom: clamp(50px, 7vw, 95px);
	}

	.proof-section {
		padding: 0 clamp(24px, 7vw, 120px) clamp(90px, 10vw, 150px);
		background: #f0f3f1;
	}

	.proof-card {
		border: 1px solid rgba(37, 51, 15, 0.68);
		padding: clamp(32px, 4.5vw, 58px);
	}

	.proof-copy {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
		gap: clamp(28px, 7vw, 96px);
		margin-bottom: 54px;
	}

	.proof-copy h2 {
		margin: 0;
		color: #849962;
		font-size: clamp(2rem, 3.3vw, 3.75rem);
		line-height: 0.98;
		font-weight: 800;
	}

	.proof-copy p {
		margin: 0 0 24px;
		font-size: clamp(0.95rem, 1.2vw, 1.08rem);
		font-weight: 700;
		line-height: 1.45;
	}

	.text-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 700;
	}

	.text-link::before {
		content: '›';
		font-size: 24px;
		line-height: 1;
	}

	.proof-video {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #d9d9d9;
		overflow: hidden;
	}

	.proof-video-link {
		position: absolute;
		left: clamp(20px, 3vw, 46px);
		bottom: clamp(20px, 3vw, 46px);
		min-height: 48px;
		background: rgba(240, 243, 241, 0.78);
	}

	.proof-video-link span {
		width: 48px;
		height: 48px;
		background: rgba(255, 255, 255, 0.58);
	}

	.product-showcase {
		background: #f0f3f1;
	}

	.product-stage {
		position: relative;
		min-height: clamp(680px, 76vw, 980px);
		padding: clamp(32px, 5.3vw, 70px) clamp(24px, 6vw, 96px);
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	.product-meta,
	.product-specs,
	.product-controls,
	.product-stage h2 {
		position: absolute;
		z-index: 4;
	}

	.product-meta {
		top: clamp(24px, 5vw, 70px);
		left: clamp(24px, 6vw, 96px);
		color: #849962;
		font-size: clamp(0.95rem, 1.1vw, 1.1rem);
		font-weight: 800;
		line-height: 0.95;
	}

	.product-meta p,
	.product-meta strong {
		display: block;
		margin: 0;
	}

	.product-meta strong {
		color: #945600;
	}

	.product-specs {
		top: clamp(24px, 5vw, 70px);
		right: clamp(24px, 6vw, 96px);
		display: grid;
		gap: 2px;
		width: min(420px, 42vw);
		color: #849962;
		font-size: clamp(0.88rem, 1vw, 1rem);
		font-weight: 800;
		line-height: 0.98;
		text-align: right;
	}

	.product-specs div {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 16px;
	}

	.product-specs strong {
		min-width: 110px;
		color: #45552d;
		text-align: left;
	}

	.product-title-bg {
		position: absolute;
		left: 50%;
		top: 50%;
		width: min(1230px, 112vw);
		transform: translate(-50%, -51%);
		z-index: 1;
		pointer-events: none;
	}

	.product-title-bg img {
		display: block;
		width: 100%;
		height: auto;
	}

	.dial {
		position: absolute;
		width: min(720px, 72vw);
		aspect-ratio: 1;
		border-radius: 50%;
		z-index: 2;
		background: repeating-conic-gradient(
			from 0deg,
			rgba(132, 153, 98, 0.84) 0deg 0.5deg,
			transparent 0.5deg 3.5deg
		);
		mask: radial-gradient(circle, transparent 63%, #000 64% 65%, transparent 66%);
		-webkit-mask: radial-gradient(circle, transparent 63%, #000 64% 65%, transparent 66%);
		animation: slow-spin 42s linear infinite;
	}

	.product-image {
		position: relative;
		z-index: 3;
		width: min(430px, 37vw);
		max-height: 620px;
		object-fit: contain;
		filter: drop-shadow(0 28px 28px rgba(37, 51, 15, 0.12));
	}

	.phone-product {
		width: min(680px, 58vw);
	}

	.product-stage h2 {
		left: clamp(24px, 6vw, 96px);
		bottom: clamp(92px, 11vw, 168px);
		max-width: 420px;
		margin: 0;
		color: #25330f;
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		line-height: 1.16;
	}

	.product-controls {
		left: 50%;
		bottom: clamp(26px, 4vw, 58px);
		display: inline-flex;
		align-items: center;
		gap: 18px;
		transform: translateX(-50%);
		padding: 10px 14px;
		border: 1px solid rgba(132, 153, 98, 0.36);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.62);
		backdrop-filter: blur(12px);
	}

	.product-controls button {
		border: 0;
		background: transparent;
		color: #25330f;
		cursor: pointer;
	}

	.product-controls > button {
		width: 36px;
		height: 36px;
		border-radius: 999px;
		background: #f0f3f1;
		font-size: 26px;
		line-height: 1;
	}

	.product-dots {
		display: flex;
		gap: 10px;
	}

	.product-dots button {
		width: 10px;
		height: 10px;
		padding: 0;
		border-radius: 999px;
		background: rgba(132, 153, 98, 0.42);
	}

	.product-dots .active-dot {
		width: 28px;
		background: #25330f;
	}

	.mission {
		position: relative;
		min-height: clamp(760px, 63vw, 920px);
		padding: clamp(82px, 7vw, 112px) clamp(28px, 9vw, 140px) clamp(88px, 8vw, 120px);
		background: #f0f3f1;
		overflow: hidden;
	}

	.mission-heading {
		position: relative;
		z-index: 2;
		width: min(600px, 48vw);
	}

	.mission-heading p {
		margin: 0 0 8px;
		color: #25330f;
		font-size: clamp(1.25rem, 1.55vw, 1.75rem);
		font-weight: 800;
	}

	.mission-heading h2 {
		margin: 0 0 28px;
		max-width: 620px;
		color: #849962;
		font-size: clamp(3rem, 4vw, 5rem);
		line-height: 0.96;
		letter-spacing: 0;
	}

	.coffee-plant {
		position: absolute;
		top: clamp(64px, 6.8vw, 108px);
		right: clamp(-70px, -2vw, 8px);
		z-index: 1;
		width: min(560px, 38vw);
		transform: rotate(-24deg);
		transform-origin: center;
		filter: grayscale(1) saturate(0) contrast(1.08) brightness(0.82)
			drop-shadow(0 0 1px rgba(255, 255, 255, 0.96))
			drop-shadow(0 0 5px rgba(255, 255, 255, 0.84))
			drop-shadow(0 18px 16px rgba(37, 51, 15, 0.2));
	}

	.mission-copy {
		position: absolute;
		left: clamp(28px, 9vw, 140px);
		right: clamp(28px, 9vw, 140px);
		bottom: clamp(78px, 7vw, 112px);
		z-index: 3;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(90px, 17vw, 280px);
		font-weight: 800;
		line-height: 1.28;
		color: #45552d;
	}

	.mission-copy p {
		margin: 0;
		max-width: 560px;
		font-size: clamp(0.92rem, 1.08vw, 1.12rem);
		letter-spacing: 0;
	}

	.mission-copy em {
		font-style: italic;
	}

	.updates-section {
		padding: clamp(70px, 8vw, 100px) clamp(28px, 9vw, 140px);
		background: linear-gradient(135deg, #d8e4c6 0%, #edf4e8 100%);
	}

	.press-section {
		padding: clamp(70px, 8vw, 100px) clamp(28px, 9vw, 140px);
		background: #d8e4c6;
	}

	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: clamp(48px, 6vw, 76px);
	}

	.section-heading h2 {
		margin: 0;
		color: #45552d;
		font-size: clamp(2.5rem, 4.5vw, 4.2rem);
		line-height: 1;
	}

	.updates-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: clamp(54px, 7vw, 110px) clamp(34px, 5vw, 72px);
	}

	.update-card {
		min-width: 0;
	}

	.update-thumb {
		aspect-ratio: 1.18 / 1;
		margin-bottom: 28px;
		border-radius: 10px;
		background: #d9d9d9;
	}

	.update-card p {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 0 0 22px;
		color: #45552d;
		font-size: 0.78rem;
		font-weight: 800;
		line-height: 1.2;
	}

	.update-card i {
		width: 6px;
		height: 6px;
		background: #945600;
	}

	.update-card h3 {
		margin: 0;
		color: #25330f;
		font-size: clamp(1.15rem, 1.35vw, 1.45rem);
		line-height: 1.08;
	}

	.press-section {
		padding-bottom: 76px;
	}

	.press-arrows {
		display: flex;
		gap: 16px;
	}

	.press-arrows span {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		background: rgba(240, 243, 241, 0.88);
		color: #849962;
		font-size: 28px;
	}

	.press-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: clamp(38px, 5vw, 72px);
	}

	.press-grid article + article {
		border-left: 1px solid rgba(69, 85, 45, 0.25);
		padding-left: clamp(38px, 5vw, 72px);
	}

	.press-grid h3 {
		margin: 0 0 18px;
		color: #45552d;
		font-size: clamp(2rem, 3vw, 3rem);
		line-height: 1;
	}

	.press-grid p {
		margin: 0;
		max-width: 390px;
		color: #25330f;
		font-size: clamp(1rem, 1.45vw, 1.5rem);
		font-weight: 600;
		line-height: 1.1;
	}

	.logo-strip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 28px;
		margin-top: clamp(76px, 10vw, 140px);
	}

	.logo-strip img {
		max-width: 145px;
		max-height: 68px;
		object-fit: contain;
	}

	.signup-section {
		display: grid;
		grid-template-columns: 0.65fr 1fr;
		align-items: center;
		gap: clamp(36px, 8vw, 120px);
		padding: clamp(60px, 8vw, 92px) clamp(28px, 12vw, 210px);
		background: linear-gradient(180deg, #edf2ef 0%, #f7f9f6 100%);
	}

	.signup-section h2 {
		margin: 0;
		color: #45552d;
		background: linear-gradient(90deg, #45552d 0%, #98bb63 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		font-size: clamp(2rem, 3.2vw, 3.2rem);
		line-height: 0.9;
	}

	.signup-form {
		padding: clamp(36px, 5vw, 62px);
		border: 1px solid rgba(69, 85, 45, 0.12);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.45);
		box-shadow: 0 20px 50px rgba(37, 51, 15, 0.1);
	}

	.signup-form label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	.signup-form div {
		display: flex;
		gap: 16px;
		padding: 18px;
		border-radius: 14px;
		background: #ffffff;
		box-shadow: 0 16px 28px rgba(37, 51, 15, 0.14);
	}

	.signup-form input {
		min-width: 0;
		flex: 1;
		border: 0;
		outline: none;
		color: #25330f;
		font-weight: 700;
	}

	.signup-form p {
		margin: 28px 0 0;
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1.4;
	}

	.footer {
		position: relative;
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: clamp(42px, 8vw, 120px);
		margin-top: -1px;
		padding: clamp(70px, 8vw, 100px) clamp(28px, 12vw, 210px) 62px;
		border-radius: 64px 64px 0 0;
		background: #ffffff;
	}

	.footer h2 {
		margin: 0 0 36px;
		font-size: 1.2rem;
	}

	.footer p {
		margin: 0 0 36px;
		font-size: clamp(1.2rem, 1.6vw, 1.65rem);
		font-weight: 600;
		line-height: 1.18;
	}

	.footer-contact > a {
		display: inline-block;
		margin-bottom: 60px;
		font-weight: 700;
	}

	.footer-contact img {
		display: block;
		width: 180px;
		margin-bottom: 32px;
	}

	.legal-links {
		display: flex;
		gap: 44px;
		font-size: 0.92rem;
	}

	.footer-links {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 60px;
		border-left: 1px solid rgba(69, 85, 45, 0.28);
		padding-left: clamp(46px, 7vw, 86px);
	}

	.footer-links a {
		display: block;
		font-size: clamp(1.2rem, 1.6vw, 1.55rem);
		font-weight: 600;
		line-height: 1.12;
	}

	.socials {
		grid-column: 2;
		display: flex;
		align-items: center;
		gap: 24px;
		margin-top: 40px;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.socials img {
		width: 18px;
		height: 18px;
		object-fit: contain;
	}

	@keyframes slow-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 980px) {
		.nav {
			grid-template-columns: 1fr auto;
			min-height: 82px;
		}

		.nav-links {
			grid-column: 1 / -1;
			order: 3;
			justify-content: flex-start;
			overflow-x: auto;
			padding-bottom: 4px;
		}

		.nav-item {
			position: static;
			flex: 0 0 auto;
		}

		.nav-item:hover .nav-trigger,
		.nav-item:focus-within .nav-trigger {
			background: transparent;
			color: inherit;
		}

		.mega-menu,
		.tools-menu {
			display: none;
		}

		.hero {
			min-height: 720px;
		}

		.proof-copy,
		.mission,
		.mission-copy,
		.signup-section,
		.footer,
		.footer-links {
			grid-template-columns: 1fr;
		}

		.product-stage {
			min-height: 820px;
		}

		.product-specs {
			top: auto;
			right: auto;
			left: clamp(24px, 6vw, 64px);
			bottom: 150px;
			width: min(480px, calc(100% - 48px));
			text-align: left;
		}

		.product-stage h2 {
			bottom: 250px;
		}

		.product-image {
			width: min(360px, 58vw);
			transform: translateY(-42px);
		}

		.phone-product {
			width: min(590px, 82vw);
		}

		.mission {
			min-height: 900px;
		}

		.mission-heading {
			width: min(560px, 68vw);
		}

		.coffee-plant {
			top: 138px;
			right: -40px;
			width: min(430px, 46vw);
			transform: rotate(-24deg);
		}

		.mission-copy {
			gap: 48px;
		}

		.updates-grid,
		.press-grid {
			grid-template-columns: 1fr 1fr;
		}

		.press-grid article + article {
			border-left: 0;
			padding-left: 0;
		}

		.logo-strip {
			flex-wrap: wrap;
			justify-content: flex-start;
		}

		.footer-links {
			border-left: 0;
			padding-left: 0;
		}

		.socials {
			grid-column: auto;
			flex-wrap: wrap;
		}
	}

	@media (max-width: 640px) {
		.nav {
			padding: 16px 20px;
		}

		.nav-cta {
			min-height: 42px;
			padding: 0 16px;
		}

		.hero {
			min-height: 620px;
		}

		.hero-content {
			width: calc(100% - 40px);
		}

		.intro-section {
			min-height: 560px;
		}

		.proof-card {
			padding: 26px 20px;
		}

		.mission {
			min-height: auto;
			padding: 66px 24px 70px;
		}

		.mission-heading {
			width: 100%;
		}

		.coffee-plant {
			position: relative;
			top: auto;
			right: auto;
			display: block;
			width: min(340px, 76vw);
			margin: 38px 0 46px auto;
			transform: rotate(-24deg);
		}

		.mission-copy {
			position: relative;
			left: auto;
			right: auto;
			bottom: auto;
			grid-template-columns: 1fr;
			gap: 28px;
		}

		.product-stage {
			display: flex;
			min-height: auto;
			flex-direction: column;
			align-items: stretch;
			gap: 24px;
			padding: 72px 20px 48px;
		}

		.product-meta {
			position: relative;
			top: auto;
			left: auto;
			order: 1;
		}

		.product-specs {
			position: relative;
			top: auto;
			right: auto;
			bottom: auto;
			left: auto;
			order: 4;
			width: calc(100% - 40px);
			width: 100%;
			font-size: 0.92rem;
			line-height: 1.14;
			text-align: left;
		}

		.product-specs div {
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 12px;
			padding: 2px 0;
		}

		.product-specs strong {
			min-width: 0;
			text-align: right;
		}

		.product-title-bg {
			top: 39%;
			width: 178vw;
			opacity: 0.72;
		}

		.dial {
			top: 38%;
			width: 82vw;
			transform: translateY(-50%);
		}

		.product-image {
			order: 2;
			width: min(280px, 70vw);
			max-height: 430px;
			align-self: center;
			transform: none;
		}

		.phone-product {
			width: min(430px, 94vw);
		}

		.product-stage h2 {
			position: relative;
			left: auto;
			bottom: auto;
			order: 3;
			max-width: 100%;
			font-size: clamp(1.55rem, 8vw, 2.45rem);
			line-height: 1.02;
		}

		.product-controls {
			position: relative;
			left: auto;
			bottom: auto;
			order: 5;
			align-self: center;
			transform: none;
			margin-top: 28px;
		}

		.section-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.updates-grid,
		.press-grid {
			grid-template-columns: 1fr;
		}

		.signup-form div {
			flex-direction: column;
		}

		.signup-form button {
			width: 100%;
		}

		.footer {
			border-radius: 36px 36px 0 0;
		}
	}
</style>
