<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/admin/Icon.svelte';
	import { notify } from '$lib/admin/toast.svelte';
	import { createDocWithId, listAll, patchDoc, removeDoc, formatDate } from '$lib/admin/db';
	import { ORDER_STATUS, normalizeCode, type Order, type OrderStatus } from '$lib/admin/orders';

	type Row = Order & { id: string };

	const PRODUCTS = ['Bumi Kopi', 'Ferroir', 'Fermego', 'AgroCapture'];

	const blank = (): Order => ({
		orderCode: '',
		customerName: '',
		email: '',
		phone: '',
		product: PRODUCTS[0],
		batch: '',
		itemNumber: 1,
		status: 'pending',
		createdAt: new Date().toISOString()
	});

	let rows = $state<Row[]>([]);
	let batchCodes = $state<string[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let query = $state('');
	let filter = $state<OrderStatus | 'all'>('all');
	let drawer = $state(false);
	let editingId = $state<string | null>(null);
	let confirmId = $state<string | null>(null);
	let form = $state<Order>(blank());

	const visible = $derived(
		[...rows]
			.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
			.filter(
				(o) =>
					(filter === 'all' || o.status === filter) &&
					[o.orderCode, o.customerName, o.email, o.phone, o.product]
						.join(' ')
						.toLowerCase()
						.includes(query.trim().toLowerCase())
			)
	);

	onMount(load);

	async function load() {
		loading = true;
		try {
			rows = await listAll<Order>('orders');
			batchCodes = (await listAll<object>('batches').catch(() => [])).map((b) => b.id);
		} catch (err) {
			notify('Gagal memuat pesanan: ' + err, true);
		} finally {
			loading = false;
		}
	}

	function openAdd() {
		editingId = null;
		form = blank();
		drawer = true;
	}

	function openEdit(r: Row) {
		editingId = r.id;
		const { id: _id, ...rest } = r;
		form = { ...blank(), ...rest };
		drawer = true;
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		const code = normalizeCode(form.orderCode);
		if (!code) return;
		saving = true;
		try {
			const data = {
				...form,
				orderCode: code,
				email: form.email.trim().toLowerCase(),
				phone: form.phone.trim(),
				customerName: form.customerName.trim()
			};
			if (editingId) {
				await patchDoc('orders', editingId, data);
			} else {
				if (rows.some((r) => r.id === code)) {
					notify('Kode pesanan sudah ada', true);
					return;
				}
				await createDocWithId('orders', code, data);
			}
			notify(editingId ? 'Pesanan diperbarui' : 'Pesanan ditambahkan');
			drawer = false;
			await load();
		} catch (err) {
			notify('Gagal menyimpan: ' + err, true);
		} finally {
			saving = false;
		}
	}

	async function setStatus(r: Row, status: OrderStatus) {
		try {
			await patchDoc('orders', r.id, { status });
			r.status = status;
			notify('Status diubah');
		} catch (err) {
			notify('Gagal mengubah status: ' + err, true);
			await load();
		}
	}

	async function remove(r: Row) {
		try {
			await removeDoc('orders', r.id);
			notify('Pesanan dihapus');
			confirmId = null;
			await load();
		} catch (err) {
			notify('Gagal menghapus: ' + err, true);
		}
	}

	async function addDemo() {
		try {
			await createDocWithId('orders', 'AGP-DEMO-0001', {
				orderCode: 'AGP-DEMO-0001',
				customerName: 'Pelanggan Contoh',
				email: 'demo@agroplus.id',
				phone: '081234567890',
				product: 'Bumi Kopi',
				batch: 'AGP-BMK-10082026-A001',
				status: 'processing',
				createdAt: new Date().toISOString()
			} satisfies Order);
			notify('Pesanan contoh dibuat: AGP-DEMO-0001');
			await load();
		} catch (err) {
			notify('Gagal membuat contoh: ' + err, true);
		}
	}

	async function copy(code: string) {
		try {
			await navigator.clipboard.writeText(code);
			notify('Kode disalin');
		} catch {
			notify('Tidak bisa menyalin', true);
		}
	}
</script>

<div class="adm-page-head">
	<div>
		<h1>Pesanan CoffeeID</h1>
		<p>Pelanggan melacak pesanan di halaman /signup memakai kode pesanan, email, dan nomor telepon yang terdaftar di sini.</p>
	</div>
	<button class="adm-btn primary" onclick={openAdd}><Icon name="plus" size={18} />Tambah pesanan</button>
</div>

<div class="toolbar">
	<div class="search">
		<Icon name="search" size={18} />
		<input class="adm-input" placeholder="Cari kode, nama, email…" bind:value={query} />
	</div>
	<div class="chips">
		<button class:on={filter === 'all'} onclick={() => (filter = 'all')}>Semua</button>
		{#each ORDER_STATUS as s}
			<button class:on={filter === s.key} onclick={() => (filter = s.key)}>{s.label}</button>
		{/each}
	</div>
</div>

<div class="adm-card tablecard">
	{#if loading}
		<div class="adm-empty">Memuat pesanan…</div>
	{:else if !rows.length}
		<div class="adm-empty">
			<Icon name="orders" size={32} />
			<p>Belum ada pesanan. Tanpa data di sini, form CoffeeID akan menolak semua kode.</p>
			<div class="empty-acts">
				<button class="adm-btn primary" onclick={openAdd}>Tambah pesanan</button>
				<button class="adm-btn" onclick={addDemo}>Buat pesanan contoh</button>
			</div>
		</div>
	{:else if !visible.length}
		<div class="adm-empty">Tidak ada pesanan yang cocok.</div>
	{:else}
		<div class="adm-table-wrap">
			<table class="adm-table">
				<thead>
					<tr><th>Kode</th><th>Pelanggan</th><th>Produk</th><th>Tanggal</th><th>Status</th><th></th></tr>
				</thead>
				<tbody>
					{#each visible as o (o.id)}
						<tr>
							<td>
								<button class="code" onclick={() => copy(o.orderCode)} title="Salin kode">{o.orderCode}</button>
							</td>
							<td>
								<strong>{o.customerName || '—'}</strong>
								<small>{o.email}<br />{o.phone}</small>
							</td>
							<td>{o.product}{#if o.batch}<small>{o.batch}</small>{/if}</td>
							<td class="nowrap">{formatDate(o.createdAt?.slice(0, 10))}</td>
							<td>
								<select
									class="status {ORDER_STATUS.find((s) => s.key === o.status)?.tone}"
									value={o.status}
									onchange={(e) => setStatus(o, e.currentTarget.value as OrderStatus)}
									aria-label="Status pesanan"
								>
									{#each ORDER_STATUS as s}<option value={s.key}>{s.label}</option>{/each}
								</select>
							</td>
							<td class="acts">
								<button class="adm-btn sm icon" onclick={() => openEdit(o)} aria-label="Edit"><Icon name="edit" size={16} /></button>
								{#if confirmId === o.id}
									<button class="adm-btn sm danger" onclick={() => remove(o)}>Yakin?</button>
								{:else}
									<button class="adm-btn sm icon danger" onclick={() => (confirmId = o.id)} aria-label="Hapus"><Icon name="trash" size={16} /></button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if drawer}
	<div class="adm-overlay" role="presentation" onclick={(e) => e.target === e.currentTarget && (drawer = false)}>
		<form class="adm-drawer" onsubmit={submit}>
			<div class="adm-drawer-head">
				<h2>{editingId ? 'Edit pesanan' : 'Tambah pesanan'}</h2>
				<button type="button" class="adm-btn sm icon" onclick={() => (drawer = false)} aria-label="Tutup"><Icon name="close" size={18} /></button>
			</div>

			<div class="adm-form-grid">
				<label class="adm-field wide">Kode pesanan
					<input class="adm-input" bind:value={form.orderCode} placeholder="AGP-190626-XXXX" required readonly={!!editingId} />
				</label>
				<label class="adm-field wide">Nama pelanggan<input class="adm-input" bind:value={form.customerName} /></label>
				<label class="adm-field">Email<input class="adm-input" type="email" bind:value={form.email} required /></label>
				<label class="adm-field">Nomor telepon<input class="adm-input" bind:value={form.phone} required /></label>
				<label class="adm-field">Produk
					<select class="adm-input" bind:value={form.product}>
						{#each PRODUCTS as p}<option>{p}</option>{/each}
					</select>
				</label>
				<label class="adm-field">Kode batch
					<input class="adm-input" bind:value={form.batch} list="batch-codes" placeholder="AGP-BMK-10082026-A001" />
					<datalist id="batch-codes">{#each batchCodes as c}<option value={c}></option>{/each}</datalist>
				</label>
				<label class="adm-field">Nomor kemasan dalam batch
					<input class="adm-input" type="number" min="1" bind:value={form.itemNumber} />
				</label>
				<label class="adm-field wide">Status
					<select class="adm-input" bind:value={form.status}>
						{#each ORDER_STATUS as s}<option value={s.key}>{s.label}</option>{/each}
					</select>
				</label>
			</div>

			<div class="foot">
				<button type="button" class="adm-btn" onclick={() => (drawer = false)}>Batal</button>
				<button class="adm-btn primary" type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
			</div>
		</form>
	</div>
{/if}

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 20px;
	}

	.search {
		position: relative;
		flex: 1 1 260px;
		max-width: 360px;
		color: var(--muted);
	}

	.search :global(svg) {
		position: absolute;
		left: 14px;
		top: 50%;
		translate: 0 -50%;
		pointer-events: none;
	}

	.search input {
		padding-left: 42px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.chips button {
		padding: 8px 14px;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface);
		color: var(--muted);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s var(--ease);
	}

	.chips button.on {
		border-color: transparent;
		background: var(--brand);
		color: #fff;
	}

	.tablecard {
		padding: 10px 16px 16px;
	}

	.table-wrap {
		overflow-x: auto;
	}

	small {
		display: block;
		color: var(--muted);
		font-size: 0.76rem;
		line-height: 1.4;
	}

	.nowrap {
		white-space: nowrap;
	}

	.code {
		padding: 4px 10px;
		border: 0;
		border-radius: 8px;
		background: #edf1e8;
		color: var(--brand);
		font: inherit;
		font-family: ui-monospace, Menlo, monospace;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: copy;
	}

	.status {
		padding: 6px 28px 6px 12px;
		border: 0;
		border-radius: 999px;
		background-color: #ecefe9;
		color: #6c7a5a;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

	.status.amber {
		background-color: #fbefd5;
		color: #94620a;
	}
	.status.blue {
		background-color: #e0ecf8;
		color: #2a5f94;
	}
	.status:not(.gray):not(.amber):not(.blue) {
		background-color: #e8eedc;
		color: var(--brand);
	}

	.acts {
		white-space: nowrap;
		text-align: right;
	}

	.acts .adm-btn + .adm-btn {
		margin-left: 6px;
	}

	.empty-acts {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: 6px;
	}

	.foot {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 26px;
	}
</style>
