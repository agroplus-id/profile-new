<script lang="ts">
	import { fadeUp, staggerUp, tiltHover, magneticHover } from '$lib/motion';
	import { partnerLogos, pressItems, updates } from '$lib/data/home';
</script>

<section class="updates-section" aria-labelledby="updates-title">
	<div class="section-heading" use:fadeUp>
		<h2 id="updates-title">Updates</h2>
		<a use:magneticHover href="/">More Updates</a>
	</div>
	<div class="updates-grid" use:staggerUp={{ staggerDelay: 0.12, y: 36 }}>
		{#each updates as update}
			<article class="update-card" use:tiltHover={{ maxTilt: 6, scale: 1.02 }}>
				<div class="update-thumb"></div>
				<p><span>Press Release</span><i></i>{update.date}</p>
				<h3>{update.title}</h3>
			</article>
		{/each}
	</div>
</section>

<section class="press-section" aria-labelledby="press-title">
	<div class="section-heading" use:fadeUp>
		<h2 id="press-title">In the press</h2>
		<div class="press-arrows" aria-hidden="true"><span>‹</span><span>›</span></div>
	</div>
	<div class="press-grid" use:staggerUp={{ staggerDelay: 0.15, y: 36 }}>
		{#each pressItems as item}
			<article use:tiltHover={{ maxTilt: 5, scale: 1.01 }}>
				<h3>{item.title}</h3>
				<p>"{item.body}</p>
			</article>
		{/each}
	</div>
	<div class="partner-marquee" aria-label="Partner logos">
		<div class="logo-strip">
			{#each [false, true] as duplicate}
				<div class="logo-set" aria-hidden={duplicate}>
					{#each partnerLogos as logo}
						<img src={logo} alt={duplicate ? '' : 'Partner logo'} />
					{/each}
				</div>
			{/each}
		</div>
	</div>
</section>
