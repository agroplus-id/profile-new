<script lang="ts">
	import { fadeUp, tiltHover } from '$lib/motion';
	import { onMount } from 'svelte';
	import { doc, getDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import { proofDefault, type ProofData } from '$lib/data/home';

	let data = $state<ProofData>({ ...proofDefault });

	onMount(async () => {
		try {
			const snap = await getDoc(doc(db, 'settings', 'proof'));
			if (snap.exists()) {
				data = { ...proofDefault, ...(snap.data() as Partial<ProofData>) };
			}
		} catch (err) {
			console.warn('Gagal memuat data proving dari Firestore, memakai data bawaan.', err);
		}
	});
</script>

<section class="proof-section" id="projects" aria-labelledby="proof-title">
	<div class="proof-card" use:fadeUp={{ duration: 0.8 }}>
		<div class="proof-copy">
			<h2 id="proof-title" use:fadeUp={{ delay: 0.1 }}>{data.title}</h2>
			<div use:fadeUp={{ delay: 0.2 }}>
				<p>{data.description}</p>
				{#if data.linkLabel}
					<a class="text-link" href={data.linkUrl || '#tools'}>{data.linkLabel}</a>
				{/if}
			</div>
		</div>

		<!-- Area Foto Dokumentasi Kunjungan Lapangan (Video & Watch Full Video dihapus) -->
		<div class="proof-photo" use:tiltHover={{ maxTilt: 4, scale: 1.01 }}>
			{#if data.image}
				<img src={data.image} alt={data.title} loading="lazy" />
			{:else}
				<div class="photo-placeholder" aria-hidden="true">
					<span class="ph-icon">📷</span>
					<span class="ph-text">Dokumentasi Kunjungan Lapangan AgroPlus Proving</span>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.proof-photo {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #d8e4c6;
		overflow: hidden;
		border-radius: 12px;
		box-shadow: 0 16px 40px rgba(37, 51, 15, 0.08);
	}

	.proof-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.proof-photo:hover img {
		transform: scale(1.02);
	}

	.photo-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: linear-gradient(135deg, #d8e4c6 0%, #c4d7ab 100%);
		color: #45552d;
		padding: 24px;
		text-align: center;
	}

	.ph-icon {
		font-size: 2.5rem;
		opacity: 0.7;
	}

	.ph-text {
		font-size: clamp(0.95rem, 1.2vw, 1.2rem);
		font-weight: 700;
		color: #25330f;
		letter-spacing: 0.03em;
	}
</style>
