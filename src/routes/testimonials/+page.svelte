<script lang="ts">
	import { onMount } from 'svelte';
	import { collection, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { formatDate } from '$lib/admin/db';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { defaultTestimonials, TESTIMONIAL_CATEGORIES, type TestimonialItem } from '$lib/data/testimonials';

	let items = $state<TestimonialItem[]>([]);
	let loading = $state(true);

	// Filter & Search states
	let searchQuery = $state('');
	let activeCategory = $state('All');
	let sortBy = $state<'terbaru' | 'terlama' | 'judul' | 'klien'>('terbaru');

	// Pagination state
	const PER_PAGE = 6; // 2 baris x 3 kolom per halaman
	let currentPage = $state(1);
	let gridTopRef = $state<HTMLElement | null>(null);

	onMount(async () => {
		try {
			const snap = await getDocs(collection(db, 'testimonials'));
			const rows = snap.docs
				.map((d) => ({ id: d.id, ...(d.data() as Omit<TestimonialItem, 'id'>) }))
				.filter((r) => r.published !== false);
			items = rows.length ? rows : defaultTestimonials;
		} catch (err) {
			console.warn('Gagal memuat testimoni dari database, memakai cadangan.', err);
			items = defaultTestimonials;
		} finally {
			loading = false;
		}
	});

	const categories = ['All', ...TESTIMONIAL_CATEGORIES];

	// Filtered and sorted data
	const filtered = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return items
			.filter((it) => {
				const matchCat = activeCategory === 'All' || it.category === activeCategory;
				if (!matchCat) return false;
				if (!q) return true;
				const haystack = [it.title, it.clientName, it.clientCompany, it.clientRole, it.summary, it.category]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				return haystack.includes(q);
			})
			.sort((a, b) => {
				if (sortBy === 'terlama') return (a.date ?? '').localeCompare(b.date ?? '');
				if (sortBy === 'judul') return a.title.localeCompare(b.title);
				if (sortBy === 'klien') return a.clientName.localeCompare(b.clientName);
				return (b.date ?? '').localeCompare(a.date ?? ''); // terbaru
			});
	});

	// Pagination calculations
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PER_PAGE)));
	const paginated = $derived(
		filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
	);

	// Reset page when filters change
	$effect(() => {
		// track filter dependencies
		activeCategory;
		searchQuery;
		sortBy;
		currentPage = 1;
	});

	function goToPage(p: number) {
		if (p < 1 || p > totalPages || p === currentPage) return;
		currentPage = p;
		if (gridTopRef) {
			gridTopRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

<svelte:head>
	<title>Testimonials &amp; Stories — AgroPlus.ID</title>
	<meta
		name="description"
		content="Dokumentasi bukti serah terima, review mitra, dan kepuasan klien prosesor kopi, estate, dan roastery bersama teknologi AgroPlus.ID."
	/>
</svelte:head>

<main class="site-shell">
	<section class="wrap">
		<header class="page-head">
			<p class="eyebrow">Client Impact</p>
			<h1>Testimonials &amp; Stories</h1>
			<p class="intro">
				Dokumentasi serah terima perangkat IoT, ulasan mitra prosesor kopi, perkebunan binaan, dan roastery yang mempercayakan konsistensi kualitas kopinya pada inovasi AgroPlus.ID.
			</p>
		</header>

		<!-- Filter & Search Controls Bar -->
		<div class="control-panel" bind:this={gridTopRef}>
			<!-- Search Bar & Sort Dropdown -->
			<div class="search-sort-row">
				<div class="search-box">
					<svg class="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
					<input
						type="search"
						class="search-input"
						placeholder="Cari judul, nama klien, atau lokasi perkebunan…"
						bind:value={searchQuery}
					/>
					{#if searchQuery}
						<button type="button" class="clear-btn" onclick={() => (searchQuery = '')} aria-label="Hapus pencarian">×</button>
					{/if}
				</div>

				<div class="sort-box">
					<label for="sort-select" class="sort-label">Urutkan:</label>
					<select id="sort-select" class="sort-select" bind:value={sortBy}>
						<option value="terbaru">Terbaru</option>
						<option value="terlama">Terlama</option>
						<option value="judul">Judul (A–Z)</option>
						<option value="klien">Nama Klien (A–Z)</option>
					</select>
				</div>
			</div>

			<!-- Category Filter Pills -->
			<div class="category-pills" role="tablist" aria-label="Filter kategori testimoni">
				{#each categories as cat}
					{@const count = cat === 'All' ? items.length : items.filter((i) => i.category === cat).length}
					<button
						type="button"
						class="pill"
						class:active={activeCategory === cat}
						onclick={() => (activeCategory = cat)}
						role="tab"
						aria-selected={activeCategory === cat}
					>
						<span>{cat}</span>
						{#if count > 0}<span class="pill-count">{count}</span>{/if}
					</button>
				{/each}
			</div>

			<!-- Result Counter -->
			<div class="result-bar">
				<span class="count-text">
					Menampilkan <strong>{filtered.length}</strong> testimoni
					{#if activeCategory !== 'All'}pada kategori <em>{activeCategory}</em>{/if}
					{#if searchQuery}untuk pencarian <em>"{searchQuery}"</em>{/if}
				</span>
				{#if searchQuery || activeCategory !== 'All'}
					<button
						type="button"
						class="reset-btn"
						onclick={() => {
							searchQuery = '';
							activeCategory = 'All';
						}}
					>
						Reset filter
					</button>
				{/if}
			</div>
		</div>

		<!-- Card Grid (3 Kolom Per Baris) -->
		{#if loading}
			<div class="grid">
				{#each Array(6) as _}
					<div class="card skel" aria-hidden="true"></div>
				{/each}
			</div>
		{:else if !filtered.length}
			<div class="empty-state">
				<div class="empty-icon">☕</div>
				<h3>Tidak ada testimoni yang sesuai</h3>
				<p>Coba gunakan kata kunci pencarian yang lain atau pilih kategori berbeda.</p>
				<button
					type="button"
					class="btn-reset-empty"
					onclick={() => {
						searchQuery = '';
						activeCategory = 'All';
					}}
				>
					Tampilkan Semua Testimoni
				</button>
			</div>
		{:else}
			<div class="grid">
				{#each paginated as it, i (it.id)}
					<article class="testi-card" style="--i:{i}">
						<!-- Foto Bukti Klien -->
						<div class="thumb-frame">
							{#if it.image}
								<img src={it.image} alt={it.title} loading="lazy" />
							{:else}
								<div class="thumb-fallback" aria-hidden="true">
									<span class="fallback-quote">“</span>
									<span class="fallback-name">{it.clientCompany || it.clientName}</span>
								</div>
							{/if}
						</div>

						<!-- Kategori, Tanggal & Rating Bintang -->
						<div class="card-meta">
							<div class="meta-left">
								<span class="category-pill">{it.category || 'Client Story'}</span>
								<i class="square-dot"></i>
								<span class="date-text">{formatDate(it.date)}</span>
							</div>
							{#if it.rating}
								<div class="rating-stars" aria-label={`Rating ${it.rating} dari 5 bintang`} title={`Rating: ${it.rating} dari 5 bintang`}>
									{#each Array(Math.min(5, Math.max(1, Number(it.rating) || 5))) as _}★{/each}
								</div>
							{/if}
						</div>

						<!-- Judul Testimoni -->
						<h2 class="card-title">{it.title}</h2>

						<!-- Kutipan Klien (Quote) -->
						{#if it.summary}
							<blockquote class="card-quote">"{it.summary}"</blockquote>
						{/if}

						<!-- Info Narasumber / Klien -->
						{#if it.clientName || it.clientRole || it.clientCompany}
							<div class="client-foot">
								<strong class="client-name">{it.clientName}</strong>
								{#if it.clientRole || it.clientCompany}
									<span class="client-desc">
										{it.clientRole}{#if it.clientCompany} · {it.clientCompany}{/if}
									</span>
								{/if}
							</div>
						{/if}
					</article>
				{/each}
			</div>

			<!-- Pagination Controls -->
			{#if totalPages > 1}
				<nav class="pagination-bar" aria-label="Navigasi halaman testimoni">
					<button
						type="button"
						class="page-arrow"
						disabled={currentPage === 1}
						onclick={() => goToPage(currentPage - 1)}
						aria-label="Halaman sebelumnya"
					>
						‹
					</button>

					<div class="page-numbers">
						{#each Array(totalPages) as _, idx}
							{@const p = idx + 1}
							<button
								type="button"
								class="page-num"
								class:active={currentPage === p}
								onclick={() => goToPage(p)}
								aria-current={currentPage === p ? 'page' : undefined}
							>
								{p}
							</button>
						{/each}
					</div>

					<button
						type="button"
						class="page-arrow"
						disabled={currentPage === totalPages}
						onclick={() => goToPage(currentPage + 1)}
						aria-label="Halaman berikutnya"
					>
						›
					</button>
				</nav>
			{/if}
		{/if}
	</section>
	<SiteFooter />
</main>

<style>
	.wrap {
		max-width: 1240px;
		margin: 0 auto;
		padding: clamp(40px, 6vw, 90px) clamp(24px, 6vw, 80px) clamp(60px, 8vw, 120px);
	}

	.page-head {
		margin-bottom: clamp(32px, 5vw, 48px);
	}

	.eyebrow {
		margin: 0 0 8px;
		color: #849962;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0 0 16px;
		color: #25330f;
		font-size: clamp(2.4rem, 5vw, 4.4rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.05;
	}

	.intro {
		max-width: 760px;
		margin: 0;
		color: #45552d;
		font-size: clamp(1rem, 1.2vw, 1.15rem);
		line-height: 1.6;
	}

	/* Control Panel (Search, Sort, Filters) */
	.control-panel {
		margin-bottom: clamp(36px, 5vw, 52px);
		display: grid;
		gap: 18px;
	}

	.search-sort-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}

	.search-box {
		position: relative;
		flex: 1;
		min-width: 260px;
		max-width: 600px;
		display: flex;
		align-items: center;
	}

	.search-ico {
		position: absolute;
		left: 16px;
		width: 18px;
		height: 18px;
		color: #849962;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 12px 40px 12px 46px;
		background: #ffffff;
		border: 1px solid rgba(85, 104, 61, 0.22);
		border-radius: 999px;
		font-size: 0.92rem;
		color: #25330f;
		box-shadow: 0 4px 16px rgba(37, 51, 15, 0.04);
		outline: none;
		transition: border-color 0.25s ease, box-shadow 0.25s ease;
	}

	.search-input:focus {
		border-color: #25330f;
		box-shadow: 0 6px 20px rgba(37, 51, 15, 0.08);
	}

	.search-input::placeholder {
		color: #8fa079;
	}

	.clear-btn {
		position: absolute;
		right: 14px;
		border: none;
		background: transparent;
		color: #849962;
		font-size: 1.3rem;
		cursor: pointer;
		line-height: 1;
		padding: 4px;
	}

	.clear-btn:hover {
		color: #25330f;
	}

	.sort-box {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.sort-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #55683d;
	}

	.sort-select {
		padding: 10px 16px;
		border-radius: 999px;
		border: 1px solid rgba(85, 104, 61, 0.22);
		background: #ffffff;
		color: #25330f;
		font-size: 0.88rem;
		font-weight: 600;
		outline: none;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(37, 51, 15, 0.04);
	}

	.category-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.pill {
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 18px;
		border-radius: 999px;
		border: 1px solid rgba(85, 104, 61, 0.22);
		background: #ffffff;
		color: #45552d;
		font-size: 0.88rem;
		font-weight: 600;
		transition: all 0.25s ease;
	}

	.pill:hover {
		border-color: #25330f;
		background: rgba(226, 232, 220, 0.4);
	}

	.pill.active {
		background: #25330f;
		color: #ffffff;
		border-color: #25330f;
		box-shadow: 0 4px 14px rgba(37, 51, 15, 0.16);
	}

	.pill-count {
		font-size: 0.72rem;
		padding: 1px 7px;
		border-radius: 999px;
		background: rgba(85, 104, 61, 0.15);
		color: inherit;
	}

	.pill.active .pill-count {
		background: rgba(255, 255, 255, 0.25);
		color: #ffffff;
	}

	.result-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.85rem;
		color: #6a7b54;
		border-top: 1px solid rgba(85, 104, 61, 0.12);
		padding-top: 12px;
	}

	.reset-btn {
		background: none;
		border: none;
		color: #25330f;
		font-weight: 600;
		font-size: 0.82rem;
		text-decoration: underline;
		cursor: pointer;
	}

	/* Card Grid: 3 Kolom Per Baris */
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: clamp(30px, 4vw, 44px);
		margin-bottom: clamp(48px, 6vw, 72px);
	}

	.testi-card {
		display: flex;
		flex-direction: column;
		background: #ffffff;
		border-radius: 16px;
		padding: 24px;
		border: 1px solid rgba(85, 104, 61, 0.12);
		box-shadow: 0 10px 30px rgba(37, 51, 15, 0.04);
		transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease;
		animation: cardRise 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
		animation-delay: calc(var(--i) * 60ms);
	}

	.testi-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 18px 44px rgba(37, 51, 15, 0.08);
		border-color: rgba(85, 104, 61, 0.28);
	}

	.thumb-frame {
		aspect-ratio: 1.25 / 1;
		border-radius: 12px;
		overflow: hidden;
		background: #e2e8dc;
		margin-bottom: 20px;
	}

	.thumb-frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.5s ease;
	}

	.testi-card:hover .thumb-frame img {
		transform: scale(1.03);
	}

	.thumb-fallback {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #d8e4c6 0%, #c2d7a7 100%);
		padding: 20px;
		text-align: center;
	}

	.fallback-quote {
		font-family: Georgia, serif;
		font-size: 3.5rem;
		line-height: 1;
		color: #55683d;
		opacity: 0.6;
	}

	.fallback-name {
		font-size: 0.85rem;
		font-weight: 700;
		color: #25330f;
		letter-spacing: 0.04em;
	}

	.card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}

	.meta-left {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.78rem;
		font-weight: 700;
		color: #55683d;
	}

	.rating-stars {
		color: #f59e0b;
		font-size: 0.95rem;
		letter-spacing: 1.5px;
		display: inline-flex;
		align-items: center;
		line-height: 1;
	}

	.category-pill {
		background: rgba(85, 104, 61, 0.12);
		color: #384620;
		padding: 3px 10px;
		border-radius: 999px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.72rem;
	}

	.square-dot {
		width: 5px;
		height: 5px;
		background: #945600;
		border-radius: 1px;
	}

	.date-text {
		color: #6a7b54;
	}

	.card-title {
		margin: 0 0 10px;
		color: #25330f;
		font-size: clamp(1.15rem, 1.35vw, 1.38rem);
		line-height: 1.28;
		font-weight: 700;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
	}

	.card-quote {
		margin: 0 0 16px;
		color: #45552d;
		font-size: 0.92rem;
		line-height: 1.55;
		font-style: italic;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
	}

	.client-foot {
		margin-top: auto;
		padding-top: 16px;
		border-top: 1px solid rgba(85, 104, 61, 0.15);
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.client-name {
		font-size: 0.95rem;
		font-weight: 700;
		color: #25330f;
	}

	.client-desc {
		font-size: 0.8rem;
		color: #6a7b54;
	}

	/* Pagination Bar */
	.pagination-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 18px 0;
	}

	.page-arrow,
	.page-num {
		min-width: 42px;
		height: 42px;
		padding: 0 12px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		border: 1px solid rgba(85, 104, 61, 0.22);
		background: #ffffff;
		color: #25330f;
		font-weight: 600;
		font-size: 0.92rem;
		cursor: pointer;
		transition: all 0.25s ease;
		box-shadow: 0 4px 12px rgba(37, 51, 15, 0.04);
	}

	.page-arrow:hover:not(:disabled),
	.page-num:hover:not(.active) {
		background: rgba(216, 228, 198, 0.4);
		border-color: #25330f;
	}

	.page-num.active {
		background: #25330f;
		color: #ffffff;
		border-color: #25330f;
		box-shadow: 0 4px 14px rgba(37, 51, 15, 0.18);
	}

	.page-arrow:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.page-numbers {
		display: flex;
		gap: 6px;
	}

	.empty-state {
		text-align: center;
		padding: clamp(60px, 8vw, 100px) 24px;
		background: #ffffff;
		border-radius: 16px;
		border: 1px dashed rgba(85, 104, 61, 0.25);
		margin-bottom: 48px;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 12px;
	}

	.empty-state h3 {
		margin: 0 0 8px;
		color: #25330f;
		font-size: 1.3rem;
	}

	.empty-state p {
		margin: 0 0 20px;
		color: #6a7b54;
		font-size: 0.95rem;
	}

	.btn-reset-empty {
		padding: 10px 22px;
		background: #25330f;
		color: #ffffff;
		border: none;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.btn-reset-empty:hover {
		background: #3c4f1c;
	}

	.skel {
		min-height: 380px;
		background: linear-gradient(100deg, #fff 30%, #f1f4ee 50%, #fff 70%) 0 0 / 200% 100%;
		animation: shimmer 1.4s linear infinite;
	}

	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}

	@keyframes cardRise {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 1024px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.grid {
			grid-template-columns: 1fr;
		}

		.search-sort-row {
			flex-direction: column;
			align-items: stretch;
		}

		.search-box {
			max-width: 100%;
		}

		.sort-box {
			justify-content: flex-end;
		}
	}
</style>
