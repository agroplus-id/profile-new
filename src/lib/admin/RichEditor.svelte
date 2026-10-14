<script lang="ts">
	import '$lib/article.css';
	import { onDestroy, onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Image from '@tiptap/extension-image';
	import Placeholder from '@tiptap/extension-placeholder';
	import TextAlign from '@tiptap/extension-text-align';
	import CharacterCount from '@tiptap/extension-character-count';
	import Icon from '$lib/admin/Icon.svelte';
	import { resizeToDataUrl } from '$lib/team-store';
	import { notify } from '$lib/admin/toast.svelte';

	let {
		html = $bindable(''),
		placeholder = 'Tulis ceritamu… ketik / untuk menyisipkan blok',
		words = $bindable(0)
	}: { html?: string; placeholder?: string; words?: number } = $props();

	let host = $state<HTMLElement>();
	let wrap = $state<HTMLElement>();
	let fileInput = $state<HTMLInputElement>();
	let editor: Editor | undefined;
	let tick = $state(0); // naik setiap ada perubahan agar status tombol ikut diperbarui

	// Toolbar melayang saat teks dipilih (seperti Medium)
	let bubble = $state<{ x: number; y: number } | null>(null);

	// Kolom tautan
	let linkOpen = $state(false);
	let linkUrl = $state('');

	// Menu "/" untuk menyisipkan blok
	type Cmd = { key: string; label: string; hint: string; run: (e: Editor) => void };
	const COMMANDS: Cmd[] = [
		{ key: 'h2', label: 'Judul besar', hint: 'Heading 2', run: (e) => e.chain().focus().setNode('heading', { level: 2 }).run() },
		{ key: 'h3', label: 'Judul sedang', hint: 'Heading 3', run: (e) => e.chain().focus().setNode('heading', { level: 3 }).run() },
		{ key: 'ul', label: 'Daftar poin', hint: 'Bullet list', run: (e) => e.chain().focus().toggleBulletList().run() },
		{ key: 'ol', label: 'Daftar bernomor', hint: 'Numbered list', run: (e) => e.chain().focus().toggleOrderedList().run() },
		{ key: 'quote', label: 'Kutipan', hint: 'Quote', run: (e) => e.chain().focus().toggleBlockquote().run() },
		{ key: 'code', label: 'Blok kode', hint: 'Code block', run: (e) => e.chain().focus().toggleCodeBlock().run() },
		{ key: 'hr', label: 'Pemisah', hint: 'Divider', run: (e) => e.chain().focus().setHorizontalRule().run() },
		{ key: 'img', label: 'Gambar', hint: 'Unggah gambar', run: () => fileInput?.click() }
	];
	let slash = $state<{ x: number; y: number; from: number; to: number; query: string } | null>(null);
	let slashIndex = $state(0);
	const slashItems = $derived(
		slash ? COMMANDS.filter((c) => (c.label + c.hint + c.key).toLowerCase().includes(slash!.query.toLowerCase())) : []
	);

	const act = (name: string, attrs?: Record<string, unknown>) => {
		tick;
		return editor?.isActive(name, attrs) ?? false;
	};
	const can = (what: 'undo' | 'redo') => {
		tick;
		return editor ? (what === 'undo' ? editor.can().undo() : editor.can().redo()) : false;
	};
	const blockValue = () => {
		tick;
		if (!editor) return 'p';
		for (const l of [2, 3, 4]) if (editor.isActive('heading', { level: l })) return 'h' + l;
		return 'p';
	};

	onMount(() => {
		editor = new Editor({
			element: host,
			content: html,
			extensions: [
				StarterKit.configure({
					heading: { levels: [2, 3, 4] },
					link: {
						openOnClick: false,
						autolink: true,
						HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' }
					}
				}),
				Image.configure({ allowBase64: true }),
				TextAlign.configure({ types: ['heading', 'paragraph'] }),
				Placeholder.configure({ placeholder }),
				CharacterCount
			],
			editorProps: {
				attributes: { class: 'prose-article', spellcheck: 'true' },
				handleKeyDown: (_view, e) => {
					if (slash && slashItems.length) {
						if (e.key === 'ArrowDown') {
							slashIndex = (slashIndex + 1) % slashItems.length;
							return true;
						}
						if (e.key === 'ArrowUp') {
							slashIndex = (slashIndex - 1 + slashItems.length) % slashItems.length;
							return true;
						}
						if (e.key === 'Enter') {
							runSlash(slashItems[slashIndex]);
							return true;
						}
					}
					if (slash && e.key === 'Escape') {
						slash = null;
						return true;
					}
					if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
						e.preventDefault();
						openLink();
						return true;
					}
					return false;
				},
				handlePaste: (_view, e) => takeImages(e.clipboardData?.files),
				handleDrop: (_view, e) => takeImages((e as DragEvent).dataTransfer?.files)
			},
			onUpdate: ({ editor: ed }) => {
				html = ed.isEmpty ? '' : ed.getHTML();
				words = ed.storage.characterCount.words();
			},
			onTransaction: () => {
				tick++;
				syncBubble();
				syncSlash();
			},
			onBlur: () => {
				// tutup toolbar melayang setelah fokus benar-benar hilang (beri waktu agar klik tombol terproses)
				setTimeout(() => {
					if (!editor?.isFocused && !linkOpen) bubble = null;
				}, 150);
			}
		});
		words = editor.storage.characterCount.words();
	});

	onDestroy(() => editor?.destroy());

	function rel(top: number, left: number) {
		const r = wrap!.getBoundingClientRect();
		return { x: left - r.left, y: top - r.top };
	}

	function syncBubble() {
		if (!editor || !wrap) return;
		const { from, to, empty } = editor.state.selection;
		const node = editor.state.selection as unknown as { node?: unknown };
		if (empty || node.node || editor.isActive('codeBlock') || slash) {
			if (!linkOpen) bubble = null;
			return;
		}
		const a = editor.view.coordsAtPos(from);
		const b = editor.view.coordsAtPos(to);
		const p = rel(Math.min(a.top, b.top), (a.left + b.right) / 2);
		bubble = p;
	}

	function syncSlash() {
		if (!editor || !wrap) return;
		const { selection } = editor.state;
		const { empty } = selection;
		const anchor = selection.$from;
		const text = anchor.parent.textContent;
		if (empty && anchor.parent.type.name === 'paragraph' && text.startsWith('/') && !text.includes(' ')) {
			const c = editor.view.coordsAtPos(anchor.pos);
			const p = rel(c.bottom, c.left);
			const query = text.slice(1);
			if (!slash || slash.query !== query) slashIndex = 0;
			slash = { x: p.x, y: p.y + 8, from: anchor.start(), to: anchor.end(), query };
		} else if (slash) {
			slash = null;
		}
	}

	function runSlash(cmd: Cmd) {
		if (!editor || !slash) return;
		const { from, to } = slash;
		editor.chain().focus().deleteRange({ from, to }).run();
		slash = null;
		cmd.run(editor);
	}

	function openLink() {
		if (!editor) return;
		linkUrl = (editor.getAttributes('link').href as string) ?? '';
		linkOpen = true;
	}

	function applyLink() {
		if (!editor) return;
		const url = linkUrl.trim();
		if (!url) editor.chain().focus().extendMarkRange('link').unsetLink().run();
		else editor.chain().focus().extendMarkRange('link').setLink({ href: /^(https?:|mailto:|\/)/i.test(url) ? url : 'https://' + url }).run();
		linkOpen = false;
	}

	function removeLink() {
		editor?.chain().focus().extendMarkRange('link').unsetLink().run();
		linkOpen = false;
	}

	function setBlock(v: string) {
		if (!editor) return;
		const c = editor.chain().focus();
		if (v === 'p') c.setParagraph().run();
		else c.setNode('heading', { level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
	}

	async function insertImage(file: File) {
		try {
			let url = await resizeToDataUrl(file, 1000, 0.72);
			if (url.length > 260_000) url = await resizeToDataUrl(file, 800, 0.62);
			editor?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
		} catch {
			notify('File bukan gambar yang valid', true);
		}
	}

	// Tempel / tarik-lepas gambar langsung ke editor
	function takeImages(files?: FileList | null) {
		const imgs = [...(files ?? [])].filter((f) => f.type.startsWith('image/'));
		if (!imgs.length) return false;
		imgs.forEach(insertImage);
		return true;
	}

	function onPick(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		[...(input.files ?? [])].forEach(insertImage);
		input.value = '';
	}

	const keep = (e: MouseEvent) => e.preventDefault(); // jaga fokus & seleksi saat klik tombol
</script>

{#snippet btn(icon: string, label: string, on: () => void, active = false, disabled = false)}
	<button type="button" class="tb" class:on={active} {disabled} title={label} aria-label={label} aria-pressed={active} onmousedown={keep} onclick={on}>
		<Icon name={icon as never} size={17} />
	</button>
{/snippet}

<div class="rich">
	<div class="toolbar" role="toolbar" aria-label="Format teks">
		{@render btn('undo', 'Urungkan (Ctrl+Z)', () => editor?.chain().focus().undo().run(), false, !can('undo'))}
		{@render btn('redo', 'Ulangi (Ctrl+Y)', () => editor?.chain().focus().redo().run(), false, !can('redo'))}
		<i class="sep"></i>
		<select class="block" aria-label="Gaya paragraf" value={blockValue()} onchange={(e) => setBlock(e.currentTarget.value)}>
			<option value="p">Paragraf</option>
			<option value="h2">Judul besar</option>
			<option value="h3">Judul sedang</option>
			<option value="h4">Judul kecil</option>
		</select>
		<i class="sep"></i>
		{@render btn('bold', 'Tebal (Ctrl+B)', () => editor?.chain().focus().toggleBold().run(), act('bold'))}
		{@render btn('italic', 'Miring (Ctrl+I)', () => editor?.chain().focus().toggleItalic().run(), act('italic'))}
		{@render btn('underline', 'Garis bawah (Ctrl+U)', () => editor?.chain().focus().toggleUnderline().run(), act('underline'))}
		{@render btn('strike', 'Coret', () => editor?.chain().focus().toggleStrike().run(), act('strike'))}
		{@render btn('code', 'Kode sebaris', () => editor?.chain().focus().toggleCode().run(), act('code'))}
		{@render btn('link', 'Tautan (Ctrl+K)', openLink, act('link'))}
		<i class="sep"></i>
		{@render btn('alignLeft', 'Rata kiri', () => editor?.chain().focus().setTextAlign('left').run(), act('paragraph', { textAlign: 'left' }) || act('heading', { textAlign: 'left' }))}
		{@render btn('alignCenter', 'Rata tengah', () => editor?.chain().focus().setTextAlign('center').run(), act('paragraph', { textAlign: 'center' }) || act('heading', { textAlign: 'center' }))}
		{@render btn('alignRight', 'Rata kanan', () => editor?.chain().focus().setTextAlign('right').run(), act('paragraph', { textAlign: 'right' }) || act('heading', { textAlign: 'right' }))}
		<i class="sep"></i>
		{@render btn('ul', 'Daftar poin', () => editor?.chain().focus().toggleBulletList().run(), act('bulletList'))}
		{@render btn('ol', 'Daftar bernomor', () => editor?.chain().focus().toggleOrderedList().run(), act('orderedList'))}
		{@render btn('quote', 'Kutipan', () => editor?.chain().focus().toggleBlockquote().run(), act('blockquote'))}
		{@render btn('codeblock', 'Blok kode', () => editor?.chain().focus().toggleCodeBlock().run(), act('codeBlock'))}
		{@render btn('hr', 'Pemisah', () => editor?.chain().focus().setHorizontalRule().run())}
		{@render btn('media', 'Sisipkan gambar', () => fileInput?.click())}
		<i class="sep"></i>
		{@render btn('clearFmt', 'Hapus format', () => editor?.chain().focus().clearNodes().unsetAllMarks().run())}
	</div>

	{#if linkOpen}
		<div class="linkbar">
			<Icon name="link" size={16} />
			<!-- svelte-ignore a11y_autofocus -->
			<input
				class="adm-input"
				type="text"
				bind:value={linkUrl}
				placeholder="https://contoh.com"
				autofocus
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						applyLink();
					}
					if (e.key === 'Escape') linkOpen = false;
				}}
			/>
			<button type="button" class="adm-btn sm primary" onclick={applyLink}>Terapkan</button>
			{#if act('link')}<button type="button" class="adm-btn sm" onclick={removeLink}>Hapus tautan</button>{/if}
			<button type="button" class="adm-btn sm icon" onclick={() => (linkOpen = false)} aria-label="Tutup"><Icon name="close" size={15} /></button>
		</div>
	{/if}

	<div class="surface" bind:this={wrap}>
		<div bind:this={host}></div>

		{#if bubble && !linkOpen}
			<div class="bubble" style="left:{bubble.x}px; top:{bubble.y}px" role="toolbar" aria-label="Format cepat">
				{@render btn('bold', 'Tebal', () => editor?.chain().focus().toggleBold().run(), act('bold'))}
				{@render btn('italic', 'Miring', () => editor?.chain().focus().toggleItalic().run(), act('italic'))}
				{@render btn('underline', 'Garis bawah', () => editor?.chain().focus().toggleUnderline().run(), act('underline'))}
				{@render btn('link', 'Tautan', openLink, act('link'))}
				<i class="sep"></i>
				{@render btn('heading', 'Judul besar', () => setBlock(act('heading', { level: 2 }) ? 'p' : 'h2'), act('heading', { level: 2 }))}
				{@render btn('quote', 'Kutipan', () => editor?.chain().focus().toggleBlockquote().run(), act('blockquote'))}
			</div>
		{/if}

		{#if slash && slashItems.length}
			<div class="slash" style="left:{slash.x}px; top:{slash.y}px" role="listbox" aria-label="Sisipkan blok">
				{#each slashItems as c, i}
					<button type="button" role="option" aria-selected={i === slashIndex} class:on={i === slashIndex} onmousedown={keep} onmouseenter={() => (slashIndex = i)} onclick={() => runSlash(c)}>
						<strong>{c.label}</strong><small>{c.hint}</small>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<input bind:this={fileInput} type="file" accept="image/*" multiple hidden onchange={onPick} />
</div>

<style>
	.rich {
		position: relative;
	}

	.toolbar {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px;
		padding: 8px 10px;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.92);
		box-shadow: 0 8px 24px rgba(27, 38, 16, 0.06);
		backdrop-filter: blur(12px);
	}

	.tb {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		padding: 0;
		border: 0;
		border-radius: 10px;
		background: transparent;
		color: #3e4d2f;
		cursor: pointer;
		transition:
			background-color 0.25s ease,
			color 0.25s ease;
	}

	.tb:hover:not(:disabled) {
		background: #edf1e8;
	}

	.tb.on {
		background: var(--brand);
		color: #fff;
	}

	.tb:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.sep {
		width: 1px;
		height: 20px;
		margin: 0 6px;
		background: var(--line);
	}

	.block {
		height: 34px;
		padding: 0 8px;
		border: 0;
		border-radius: 10px;
		background: #f3f6ee;
		color: #3e4d2f;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
	}

	.linkbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		padding: 8px 12px;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: #f6f9f1;
		color: var(--muted);
		animation: pop 0.3s var(--ease);
	}

	.linkbar .adm-input {
		flex: 1 1 220px;
		min-height: 38px;
	}

	.surface {
		position: relative;
		margin-top: 14px;
		padding: clamp(8px, 2vw, 16px) 4px 40px;
	}

	.bubble {
		position: absolute;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 5px;
		translate: -50% calc(-100% - 10px);
		border-radius: 14px;
		background: #1b2610;
		box-shadow: 0 16px 40px rgba(14, 20, 8, 0.4);
		animation: pop 0.25s var(--ease);
	}

	.bubble .tb {
		width: 32px;
		height: 32px;
		color: #e8eedc;
	}

	.bubble .tb:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.14);
	}

	.bubble .tb.on {
		background: var(--lime);
		color: #1b2610;
	}

	.bubble .sep {
		background: rgba(255, 255, 255, 0.2);
	}

	.slash {
		position: absolute;
		z-index: 20;
		display: grid;
		gap: 2px;
		width: 260px;
		padding: 6px;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: #fff;
		box-shadow: 0 24px 60px rgba(14, 20, 8, 0.22);
		animation: pop 0.25s var(--ease);
	}

	.slash button {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
		padding: 9px 12px;
		border: 0;
		border-radius: 10px;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 0.9rem;
		text-align: left;
		cursor: pointer;
	}

	.slash button.on {
		background: #edf1e8;
	}

	.slash small {
		color: var(--muted);
		font-size: 0.72rem;
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}
</style>
