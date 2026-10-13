<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import { listAll, formatDate } from '$lib/admin/db';
	import { ORDER_STATUS, type Order } from '$lib/admin/orders';
	import { notify } from '$lib/admin/toast.svelte';
	import { countAll, seedBatch, seedPartners, seedPress, seedTeam, seedUpdates, type Progress, type SeedCounts } from '$lib/admin/seed';

	type Row = { id: string };
	type UpdateRow = Row & { title: string; published?: boolean; date?: string };

	let loading = $state(true);
	let teamCount = $state(0);
	let updates = $state<UpdateRow[]>([]);
	let orders = $state<(Order & Row)[]>([]);
	let failed = $state(false);

	// ───── Impor data bawaan: menyalin isi situs yang sekarang tertulis di kode ke Firestore ─────
	type Item = { key: keyof SeedCounts; label: string; hint: string; run: (p: Progress) => Promise<unknown>; icon: 'team' | 'news' | 'media' | 'batch' };
	const ITEMS: Item[] = [
		{ key: 'team', label: 'Tim', hint: '17 anggota beserta foto', run: seedTeam, icon: 'team' },
		{ key: 'updates', label: 'Berita', hint: '6 berita contoh di bagian Updates', run: seedUpdates, icon: 'news' },
		{ key: 'press', label: 'In the press', hint: '3 kutipan contoh', run: seedPress, icon: 'media' },
		{ key: 'partners', label: 'Logo mitra', hint: '6 logo mitra', run: seedPartners, icon: 'media' },
		{ key: 'batches', label: 'Batch contoh', hint: 'Bumi Kopi Liberica (AGP-BMK-17062026-L001)', run: seedBatch, icon: 'batch' }
	];
	let counts = $state<SeedCounts | null>(null);
	let seeding = $state<string>('');
	let seedNote = $state('');

	const emptyItems = $derived(counts ? ITEMS.filter((i) => counts![i.key] === 0) : []);

	async function refreshCounts() {
		counts = await countAll();
	}

	async function runItem(it: Item) {
		seeding = it.key;
		try {
			await it.run((t) => (seedNote = t));
			notify(`${it.label} berhasil diimpor`);
		} catch (err) {
			notify(`Gagal impor ${it.label}: ${err}`, true);
		} finally {
			seeding = '';
			seedNote = '';
			await refreshCounts();
		}
	}

	async function runAllEmpty() {
		for (const it of [...emptyItems]) await runItem(it);
	}

	onMount(async () => {
		refreshCounts();
		const [t, u, o] = await Promise.allSettled([
			listAll<object>('team'),
			listAll<UpdateRow>('updates'),
			listAll<Order>('orders')
		]);
		if (t.status === 'fulfilled') teamCount = t.value.length;
		if (u.status === 'fulfilled') updates = u.value;
		if (o.status === 'fulfilled') orders = o.value;
		failed = [t, u, o].some((r) => r.status === 'rejected');
		loading = false;
	});

	const published = $derived(updates.filter((u) => u.published !== false).length);
	const recent = $derived(
		[...orders].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, 5)
	);
	const byStatus = $derived(
		ORDER_STATUS.map((s) => ({ ...s, count: orders.filter((o) => o.status === s.key).length }))
	);
	const maxCount = $derived(Math.max(1, ...byStatus.map((s) => s.count)));

	const hour = new Date().getHours();
	const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';
</script>

<div class="adm-page-head">
	<div>
		<h1>{greeting} 👋</h1>
		<p>Ringkasan konten dan aktivitas situs AgroPlus.ID.</p>
	</div>
	<a class="adm-btn primary" href="/admin/updates"><Icon name="plus" size={18} />Tulis berita</a>
</div>

{#if failed}
	<div class="adm-card warn adm-rise">
		Sebagian data tidak bisa dimuat. Periksa Firestore Rules dan pastikan akun ini terdaftar sebagai admin.
	</div>
{/if}

<section class="stats">
	<a class="adm-card stat adm-rise" style="--i:0" href="/admin/team">
		<span class="ico"><Icon name="team" /></span>
		<div><small>Anggota tim</small><strong>{loading ? '–' : teamCount}</strong></div>
	</a>
	<a class="adm-card stat adm-rise" style="--i:1" href="/admin/updates">
		<span class="ico"><Icon name="news" /></span>
		<div><small>Berita terbit</small><strong>{loading ? '–' : published}</strong><em>{updates.length - published} draf</em></div>
	</a>
	<a class="adm-card stat adm-rise" style="--i:2" href="/admin/orders">
		<span class="ico"><Icon name="orders" /></span>
		<div><small>Pesanan CoffeeID</small><strong>{loading ? '–' : orders.length}</strong></div>
	</a>
	<a class="adm-card stat adm-rise" style="--i:3" href="/admin/orders">
		<span class="ico amber"><Icon name="refresh" /></span>
		<div>
			<small>Perlu diproses</small>
			<strong>{loading ? '–' : orders.filter((o) => o.status === 'pending' || o.status === 'processing').length}</strong>
		</div>
	</a>
</section>

<section class="adm-card adm-rise seed" style="--i:4">
	<div class="adm-card-head">
		<div>
			<h2>Impor data bawaan</h2>
			<p class="hint">Salin isi situs yang sekarang tertulis di kode ke Firestore, supaya bisa diubah dari dashboard. Tiap bagian hanya bisa diimpor saat masih kosong.</p>
		</div>
		<button class="adm-btn primary" onclick={runAllEmpty} disabled={!counts || !emptyItems.length || !!seeding}>
			<Icon name="refresh" size={17} />{seeding ? 'Mengimpor…' : emptyItems.length ? `Impor semua yang kosong (${emptyItems.length})` : 'Semua sudah terisi'}
		</button>
	</div>
	<ul class="seed-list">
		{#each ITEMS as it}
			{@const n = counts?.[it.key]}
			<li>
				<span class="ico"><Icon name={it.icon} /></span>
				<div class="who"><strong>{it.label}</strong><small>{seeding === it.key && seedNote ? seedNote : it.hint}</small></div>
				{#if n === undefined}
					<span class="adm-badge gray">…</span>
				{:else if n > 0}
					<span class="adm-badge">{n} data</span>
				{:else}
					<button class="adm-btn sm" onclick={() => runItem(it)} disabled={!!seeding}>{seeding === it.key ? 'Mengimpor…' : 'Impor'}</button>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<section class="two">
	<div class="adm-card adm-rise" style="--i:4">
		<div class="adm-card-head">
			<h2>Pesanan terbaru</h2>
			<a class="adm-btn sm" href="/admin/orders">Semua</a>
		</div>
		{#if !recent.length}
			<div class="adm-empty">
				<Icon name="orders" size={28} />
				Belum ada pesanan. Tambahkan di menu Pesanan agar pelanggan bisa melacaknya di halaman CoffeeID.
			</div>
		{:else}
			<ul class="recent">
				{#each recent as o}
					{@const st = ORDER_STATUS.find((s) => s.key === o.status) ?? ORDER_STATUS[0]}
					<li>
						<span class="dot {st.tone}"></span>
						<div class="who"><strong>{o.customerName || o.orderCode}</strong><small>{o.orderCode} · {o.product || '—'}</small></div>
						<span class="adm-badge {st.tone}">{st.label}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="adm-card adm-rise" style="--i:5">
		<div class="adm-card-head"><h2>Status pesanan</h2></div>
		<div class="bars">
			{#each byStatus as s}
				<div class="bar-row">
					<span>{s.label}</span>
					<div class="track"><i class="fill {s.tone}" style="width:{(s.count / maxCount) * 100}%"></i></div>
					<b>{s.count}</b>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="adm-card adm-rise" style="--i:6">
	<div class="adm-card-head"><h2>Berita terakhir</h2><a class="adm-btn sm" href="/admin/updates">Kelola</a></div>
	{#if !updates.length}
		<div class="adm-empty"><Icon name="news" size={28} />Belum ada berita. Halaman utama masih memakai contoh bawaan.</div>
	{:else}
		<ul class="recent">
			{#each [...updates].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 4) as u}
				<li>
					<span class="dot {u.published === false ? 'gray' : ''}"></span>
					<div class="who"><strong>{u.title}</strong><small>{formatDate(u.date)}</small></div>
					<span class="adm-badge {u.published === false ? 'gray' : ''}">{u.published === false ? 'Draf' : 'Terbit'}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.seed {
		margin-bottom: 16px;
	}

	.seed .hint {
		margin-top: 4px;
		max-width: 560px;
		color: var(--muted);
		font-size: 0.82rem;
		line-height: 1.5;
	}

	.seed-list {
		display: grid;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.seed-list li {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 4px;
		border-top: 1px solid var(--line);
	}

	.seed-list .ico {
		width: 40px;
		height: 40px;
		border-radius: 12px;
	}

	.warn {
		margin-bottom: 20px;
		background: #fbefd5;
		color: #7a5208;
		font-size: 0.9rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: 16px;
		margin-bottom: 16px;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 16px;
		transition:
			transform 0.4s var(--ease),
			box-shadow 0.4s var(--ease);
	}

	.stat:hover {
		transform: translateY(-3px);
		box-shadow: 0 2px 4px rgba(27, 38, 16, 0.05), 0 20px 44px rgba(27, 38, 16, 0.1);
	}

	.ico {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: 15px;
		background: #e6edd9;
		color: var(--brand);
	}

	.ico.amber {
		background: #fbefd5;
		color: #94620a;
	}

	.stat small {
		display: block;
		color: var(--muted);
		font-size: 0.78rem;
	}

	.stat strong {
		display: block;
		font-size: 1.9rem;
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.03em;
	}

	.stat em {
		color: var(--muted);
		font-size: 0.72rem;
		font-style: normal;
	}

	.two {
		display: grid;
		grid-template-columns: 1.5fr 1fr;
		gap: 16px;
		margin-bottom: 16px;
	}

	.recent {
		display: grid;
		gap: 4px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.recent li {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 8px;
		border-top: 1px solid var(--line);
	}

	.recent li:first-child {
		border-top: 0;
	}

	.who {
		display: grid;
		flex: 1;
		min-width: 0;
	}

	.who strong {
		overflow: hidden;
		font-size: 0.92rem;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.who small {
		color: var(--muted);
		font-size: 0.78rem;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--accent);
	}

	.dot.amber {
		background: #e0a43a;
	}
	.dot.blue {
		background: #4d8fcf;
	}
	.dot.gray {
		background: #b8c1ad;
	}

	.bars {
		display: grid;
		gap: 16px;
	}

	.bar-row {
		display: grid;
		grid-template-columns: 90px 1fr 28px;
		align-items: center;
		gap: 12px;
		font-size: 0.85rem;
	}

	.track {
		height: 10px;
		overflow: hidden;
		border-radius: 999px;
		background: #edf1e8;
	}

	.fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, #9db85b, #62784a);
		transition: width 0.9s var(--ease);
	}

	.fill.amber {
		background: linear-gradient(90deg, #f0c36d, #d99a2b);
	}
	.fill.blue {
		background: linear-gradient(90deg, #7fb2e3, #4d8fcf);
	}
	.fill.gray {
		background: #c9d1bf;
	}

	.bar-row b {
		text-align: right;
	}

	@media (max-width: 900px) {
		.two {
			grid-template-columns: 1fr;
		}
	}
</style>
