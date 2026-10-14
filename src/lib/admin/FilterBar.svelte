<script lang="ts">
	import Icon from '$lib/admin/Icon.svelte';

	import type { FilterDef, FilterState } from '$lib/admin/filter';

	let {
		model = $bindable(),
		filters = [],
		sorts = [],
		dateLabel = '',
		placeholder = 'Cari…',
		total = 0,
		shown = 0,
		noun = 'data',
		flat = false
	}: {
		model: FilterState;
		filters?: FilterDef[];
		sorts?: { value: string; label: string }[];
		dateLabel?: string;
		placeholder?: string;
		total?: number;
		shown?: number;
		noun?: string;
		flat?: boolean;
	} = $props();

	let open = $state(false);

	const chipFilters = $derived(filters.filter((def) => (def.variant ?? 'chips') === 'chips'));
	const selectFilters = $derived(filters.filter((def) => def.variant === 'select'));
	const hasAdvanced = $derived(selectFilters.length > 0 || !!dateLabel || sorts.length > 1);

	// Penanda filter aktif (tampil sebagai tag yang bisa dihapus satu per satu)
	const tags = $derived.by(() => {
		const out: { id: string; text: string; clear: () => void }[] = [];
		if (model.query.trim()) out.push({ id: 'q', text: `“${model.query.trim()}”`, clear: () => (model.query = '') });
		for (const def of filters) {
			const v = model.values[def.key] ?? '';
			if (v) out.push({ id: def.key, text: `${def.label}: ${def.options.find((o) => o.value === v)?.label ?? v}`, clear: () => (model.values[def.key] = '') });
		}
		if (model.from) out.push({ id: 'from', text: `Dari ${model.from}`, clear: () => (model.from = '') });
		if (model.to) out.push({ id: 'to', text: `Sampai ${model.to}`, clear: () => (model.to = '') });
		return out;
	});

	const advancedActive = $derived(
		selectFilters.filter((def) => model.values[def.key]).length + (model.from ? 1 : 0) + (model.to ? 1 : 0)
	);

	function reset() {
		model.query = '';
		for (const def of filters) model.values[def.key] = '';
		model.from = '';
		model.to = '';
		if (sorts.length) model.sort = sorts[0].value;
	}
</script>

<div class="fb" class:adm-card={!flat} class:flat>
	<div class="row">
		<div class="search">
			<Icon name="search" size={18} />
			<input class="adm-input" type="search" {placeholder} bind:value={model.query} aria-label="Cari" />
			{#if model.query}
				<button type="button" class="clear" onclick={() => (model.query = '')} aria-label="Hapus pencarian"><Icon name="close" size={14} /></button>
			{/if}
		</div>

		{#if chipFilters.length}
			<div class="chips-wrap">
				{#each chipFilters as def}
					<div class="chips" role="group" aria-label={def.label}>
						{#each def.options as o}
							<button type="button" class:on={(model.values[def.key] ?? '') === o.value} onclick={() => (model.values[def.key] = o.value)}>
								{o.label}{#if o.count !== undefined}<b>{o.count}</b>{/if}
							</button>
						{/each}
					</div>
				{/each}
			</div>
		{/if}

		{#if hasAdvanced}
			<button type="button" class="more" class:open aria-expanded={open} onclick={() => (open = !open)}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M7 12h10M10 18h4" /></svg>
				Filter lain
				{#if advancedActive}<b class="badge">{advancedActive}</b>{/if}
			</button>
		{/if}
	</div>

	{#if open && hasAdvanced}
		<div class="panel">
			{#each selectFilters as def}
				<label class="adm-field">{def.label}
					<select class="adm-input" bind:value={model.values[def.key]}>
						{#each def.options as o}<option value={o.value}>{o.label}{o.count !== undefined ? ` (${o.count})` : ''}</option>{/each}
					</select>
				</label>
			{/each}
			{#if dateLabel}
				<label class="adm-field">{dateLabel} — dari
					<input class="adm-input" type="date" bind:value={model.from} max={model.to || undefined} />
				</label>
				<label class="adm-field">{dateLabel} — sampai
					<input class="adm-input" type="date" bind:value={model.to} min={model.from || undefined} />
				</label>
			{/if}
			{#if sorts.length > 1}
				<label class="adm-field">Urutkan
					<select class="adm-input" bind:value={model.sort}>
						{#each sorts as s}<option value={s.value}>{s.label}</option>{/each}
					</select>
				</label>
			{/if}
		</div>
	{/if}

	<div class="foot">
		<span class="count">
			{#if shown === total}<b>{total}</b> {noun}{:else}<b>{shown}</b> dari {total} {noun}{/if}
		</span>
		{#if tags.length}
			<div class="tags">
				{#each tags as t (t.id)}
					<button type="button" class="tag" onclick={t.clear} aria-label="Hapus filter {t.text}">
						{t.text}<Icon name="close" size={12} />
					</button>
				{/each}
				<button type="button" class="reset" onclick={reset}>Reset filter</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.fb {
		display: grid;
		gap: 12px;
		margin-bottom: 18px;
		padding: 14px 16px;
	}

	.fb.flat {
		margin-bottom: 14px;
		padding: 0;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.search {
		position: relative;
		flex: 1 1 240px;
		max-width: 380px;
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
		padding: 0 38px;
	}

	.clear {
		position: absolute;
		right: 8px;
		top: 50%;
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		padding: 0;
		translate: 0 -50%;
		border: 0;
		border-radius: 50%;
		background: #edf1e8;
		color: var(--muted);
		cursor: pointer;
	}

	.chips-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px;
		border-radius: 999px;
		background: #f1f4ee;
	}

	.chips button {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 7px 14px;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: var(--muted);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 0.3s var(--ease),
			color 0.3s var(--ease),
			box-shadow 0.3s var(--ease);
	}

	.chips button b {
		padding: 1px 7px;
		border-radius: 999px;
		background: rgba(85, 104, 61, 0.12);
		font-size: 0.7rem;
	}

	.chips button:hover:not(.on) {
		background: rgba(85, 104, 61, 0.08);
	}

	.chips button.on {
		background: #fff;
		color: var(--brand);
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(27, 38, 16, 0.12);
	}

	.more {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 42px;
		padding: 0 14px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.3s var(--ease);
	}

	.more:hover,
	.more.open {
		background: #f1f4ee;
	}

	.badge {
		display: grid;
		place-items: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: 999px;
		background: var(--brand);
		color: #fff;
		font-size: 0.7rem;
	}

	.panel {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 12px;
		padding: 14px;
		border-radius: 14px;
		background: #f6f9f1;
		animation: drop 0.35s var(--ease);
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		font-size: 0.82rem;
	}

	.count {
		color: var(--muted);
	}

	.count b {
		color: var(--ink);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 6px 4px 10px;
		border: 0;
		border-radius: 999px;
		background: #e6edd9;
		color: var(--brand);
		font: inherit;
		font-size: 0.76rem;
		font-weight: 500;
		cursor: pointer;
		animation: drop 0.3s var(--ease);
	}

	.tag:hover {
		background: #d9e4c6;
	}

	.reset {
		padding: 4px 8px;
		border: 0;
		background: none;
		color: var(--danger);
		font: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

	@keyframes drop {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
</style>
