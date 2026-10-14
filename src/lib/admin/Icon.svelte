<script lang="ts">
	type Name =
		| 'dashboard'
		| 'team'
		| 'news'
		| 'orders'
		| 'logout'
		| 'plus'
		| 'edit'
		| 'trash'
		| 'close'
		| 'external'
		| 'up'
		| 'down'
		| 'search'
		| 'check'
		| 'refresh'
		| 'media'
		| 'batch'
		| 'eye'
		| 'eyeOff'
		| 'bold'
		| 'italic'
		| 'underline'
		| 'strike'
		| 'code'
		| 'link'
		| 'ul'
		| 'ol'
		| 'quote'
		| 'hr'
		| 'undo'
		| 'redo'
		| 'alignLeft'
		| 'alignCenter'
		| 'alignRight'
		| 'codeblock'
		| 'clearFmt'
		| 'heading';

	let { name, size = 20 }: { name: Name; size?: number } = $props();

	// Ikon garis 24x24, gaya konsisten (stroke 1.8, ujung membulat).
	const paths: Record<Name, string> = {
		dashboard: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
		team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
		news: 'M4 4h13a1 1 0 0 1 1 1v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2zM18 8h2a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2M8 8h6M8 12h6M8 16h4',
		orders: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
		logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
		plus: 'M12 5v14M5 12h14',
		edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
		trash: 'M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6',
		close: 'M18 6L6 18M6 6l12 12',
		external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3',
		up: 'M12 19V5M5 12l7-7 7 7',
		down: 'M12 5v14M19 12l-7 7-7-7',
		search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
		check: 'M20 6L9 17l-5-5',
		refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
		media: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
		batch: 'M9 3h6M10 3v6.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V3M7.5 15h9',
		eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
		bold: 'M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z',
		italic: 'M19 4h-9M14 20H5M15 4L9 20',
		underline: 'M6 4v6a6 6 0 0 0 12 0V4M4 21h16',
		strike: 'M5 12h14M16 6.5C15.3 4.9 13.7 4 11.8 4 9.3 4 7.5 5.3 7.5 7.3c0 1.7 1.2 2.6 3 3.2M8 17.5c.8 1.5 2.4 2.5 4.4 2.5 2.7 0 4.1-1.4 4.1-3.2 0-1-.4-1.7-1.2-2.3',
		code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
		link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
		ul: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01',
		ol: 'M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1',
		quote: 'M3 21c3 0 7-1 7-8V5H3v8h4c0 3-1 4-4 4zM14 21c3 0 7-1 7-8V5h-7v8h4c0 3-1 4-4 4z',
		hr: 'M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4',
		undo: 'M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 8',
		redo: 'M21 7v6h-6M21 13a9 9 0 1 1-3-7.7L21 8',
		alignLeft: 'M3 6h18M3 12h12M3 18h16',
		alignCenter: 'M3 6h18M6 12h12M4 18h16',
		alignRight: 'M3 6h18M9 12h12M5 18h16',
		codeblock: 'M8 9l-3 3 3 3M16 9l3 3-3 3M13 7l-2 10',
		clearFmt: 'M3 7h13M9.5 7L8 17M19 12l-5 8M14 12l5 8',
		heading: 'M6 4v16M18 4v16M6 12h12',
		eyeOff: 'M17.9 17.9A10.1 10.1 0 0 1 12 19c-6.4 0-10-7-10-7a18.6 18.6 0 0 1 5.1-5.9M9.9 5.1A9.7 9.7 0 0 1 12 5c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.2 3.2M14.1 14.1a3 3 0 1 1-4.2-4.2M2 2l20 20'
	};
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={paths[name]} />
</svg>
