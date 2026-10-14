<script lang="ts">
	import { fadeUp, staggerUp, tiltHover, magneticHover } from '$lib/motion';
	import { partnerLogos, pressItems, updates as fallbackUpdates } from '$lib/data/home';
	import { onMount } from 'svelte';
	import { collection, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { formatDate } from '$lib/admin/db';

	type Card = { id?: string; title: string; date: string; category: string; image?: string };

	// Contoh bawaan tampil dulu; diganti berita dari Firestore bila admin sudah mengisinya.
	let updates = $state<Card[]>(fallbackUpdates.map((u) => ({ ...u, category: 'Press Release' })));

	type Press = { title: string; body: string; url?: string; image?: string };
	type Logo = { src: string; name?: string; url?: string };

	// Contoh bawaan tampil dulu; diganti data Firestore (dashboard admin → Media) bila sudah diisi.
	let press = $state<Press[]>(pressItems.map((p) => ({ ...p })));
	let logos = $state<Logo[]>(partnerLogos.map((src) => ({ src })));
	let pressPage = $state(0);

	const PER_PAGE = 3;
	const pages = $derived(Math.max(1, Math.ceil(press.length / PER_PAGE)));
	const shownPress = $derived(press.slice(pressPage * PER_PAGE, pressPage * PER_PAGE + PER_PAGE));
	const step = (d: number) => (pressPage = (pressPage + d + pages) % pages);

	async function loadMedia() {
		try {
			const [ps, ls] = await Promise.all([getDocs(collection(db, 'press')), getDocs(collection(db, 'partners'))]);
			const byOrder = (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0);
			const pressRows = ps.docs.map((d) => d.data() as { title: string; quote: string; url?: string; image?: string; order?: number }).sort(byOrder);
			const logoRows = ls.docs.map((d) => d.data() as { name?: string; url?: string; image: string; order?: number }).sort(byOrder);
			if (pressRows.length)
				press = pressRows.map((r) => ({ title: r.title, body: r.quote, url: r.url, image: r.image }));
			if (logoRows.length) logos = logoRows.map((r) => ({ src: r.image, name: r.name, url: r.url }));
		} catch (err) {
			console.warn('Gagal memuat press/mitra dari Firestore, memakai contoh bawaan.', err);
		}
	}

	onMount(async () => {
		loadMedia();
		try {
			const snap = await getDocs(collection(db, 'updates'));
			const rows = snap.docs
				.map((d) => ({ id: d.id, ...(d.data() as Omit<Card, 'id'> & { published?: boolean }) }))
				.filter((r) => r.published !== false)
				.sort((a, b) => String(b.date).localeCompare(String(a.date)))
				.slice(0, 6);
			if (rows.length)
				updates = rows.map((r) => ({
					id: r.id,
					title: r.title,
					category: r.category || 'News',
					image: r.image,
					date: formatDate(r.date)
				}));
		} catch (err) {
			console.warn('Gagal memuat berita dari Firestore, memakai contoh bawaan.', err);
		}
	});
</script>

<section class="updates-section" aria-labelledby="updates-title">
	<div class="section-heading" use:fadeUp>
		<h2 id="updates-title">Updates</h2>
		<a use:magneticHover href="/updates">More Updates</a>
	</div>
	<div class="updates-grid" use:staggerUp={{ staggerDelay: 0.12, y: 36 }}>
		{#each updates as update}
			<article class="update-card" use:tiltHover={{ maxTilt: 6, scale: 1.02 }}>
				<div class="update-thumb">{#if update.image}<img src={update.image} alt="" />{/if}</div>
				<p><span>{update.category}</span><i></i>{update.date}</p>
				<h3>{update.title}</h3>
				{#if update.id}<a class="card-link" href="/updates/{update.id}" aria-label={update.title}></a>{/if}
			</article>
		{/each}
	</div>
</section>

<section class="press-section" aria-labelledby="press-title">
	<div class="section-heading" use:fadeUp>
		<h2 id="press-title">In the press</h2>
		{#if pages > 1}
			<div class="press-arrows">
				<button type="button" onclick={() => step(-1)} aria-label="Sebelumnya">‹</button>
				<button type="button" onclick={() => step(1)} aria-label="Berikutnya">›</button>
			</div>
		{:else}
			<div class="press-arrows" aria-hidden="true"><span>‹</span><span>›</span></div>
		{/if}
	</div>
	<div class="press-grid" use:staggerUp={{ staggerDelay: 0.15, y: 36 }}>
		{#each shownPress as item}
			<article use:tiltHover={{ maxTilt: 5, scale: 1.01 }}>
				{#if item.url}<a class="press-link" href={item.url} target="_blank" rel="noreferrer">
					{#if item.image}<img class="press-logo" src={item.image} alt={item.title} />{:else}<h3>{item.title}</h3>{/if}
				</a>{:else if item.image}<img class="press-logo" src={item.image} alt={item.title} />{:else}<h3>{item.title}</h3>{/if}
				<p>"{item.body}</p>
			</article>
		{/each}
	</div>
	<div class="partner-marquee" aria-label="Partner logos">
		<div class="logo-strip">
			{#each [false, true] as duplicate}
				<div class="logo-set" aria-hidden={duplicate}>
					{#each logos as logo}
						{#if logo.url}
							<a href={logo.url} target="_blank" rel="noreferrer" tabindex={duplicate ? -1 : 0}>
								<img src={logo.src} alt={duplicate ? '' : (logo.name ?? 'Partner logo')} />
							</a>
						{:else}
							<img src={logo.src} alt={duplicate ? '' : (logo.name ?? 'Partner logo')} />
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.update-card {
		position: relative;
	}

	.card-link {
		position: absolute;
		inset: 0;
		z-index: 2;
		border-radius: inherit;
	}

	.press-arrows button {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 0;
		background: rgba(240, 243, 241, 0.88);
		color: #849962;
		font-size: 28px;
		cursor: pointer;
		transition:
			background-color 0.3s ease,
			color 0.3s ease;
	}

	.press-arrows button:hover {
		background: #fff;
		color: #45552d;
	}

	.press-logo {
		display: block;
		max-width: 220px;
		max-height: 72px;
		margin: 0 0 18px;
		object-fit: contain;
		object-position: left center;
	}

	.press-link {
		display: block;
	}

	.update-thumb :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
