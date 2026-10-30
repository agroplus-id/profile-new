<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import './account.css';
	import { pauseSmoothScroll, resumeSmoothScroll } from '$lib/smooth-scroll';

	let {
		title,
		onclose,
		dismissible = true,
		wide = false,
		children,
		footer
	}: {
		title: string;
		onclose?: () => void;
		dismissible?: boolean;
		wide?: boolean;
		children: Snippet;
		footer?: Snippet;
	} = $props();

	let dialog = $state<HTMLElement>();
	const titleId = `m-${Math.random().toString(36).slice(2, 8)}`;

	// Dipindah ke <body> agar tidak terjebak transform/overflow induknya.
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}

	onMount(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		pauseSmoothScroll();
		dialog?.focus();
		return () => {
			document.body.style.overflow = prev;
			resumeSmoothScroll();
		};
	});

	function key(e: KeyboardEvent) {
		if (e.key === 'Escape' && dismissible) onclose?.();
	}
</script>

<svelte:window onkeydown={key} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="ac-overlay" use:portal onmousedown={(e) => e.target === e.currentTarget && dismissible && onclose?.()}>
	<div class="ac-modal" class:wide role="dialog" aria-modal="true" aria-labelledby={titleId} tabindex="-1" bind:this={dialog}>
		<div class="ac-modal-head">
			<h3 id={titleId}>{title}</h3>
			{#if dismissible}
				<button type="button" class="ac-x" onclick={() => onclose?.()} aria-label="Close">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
				</button>
			{/if}
		</div>
		<div class="ac-modal-body" data-lenis-prevent>{@render children()}</div>
		{#if footer}<div class="ac-modal-foot">{@render footer()}</div>{/if}
	</div>
</div>
