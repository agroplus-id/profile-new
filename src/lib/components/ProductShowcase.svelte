<script lang="ts">
	import { fadeUp, fadeScale, tiltHover } from '$lib/motion';
	import { products } from '$lib/data/home';
	let activeProduct = $state(0);
	const active = $derived(products[activeProduct]);
	const select = (index: number) => activeProduct = index;
	const previous = () => activeProduct = (activeProduct - 1 + products.length) % products.length;
	const next = () => activeProduct = (activeProduct + 1) % products.length;
</script>

<section class="product-showcase" id="tools" aria-labelledby="product-title">
	<div class="product-stage">
		{#key activeProduct}
			<div class="product-meta" use:fadeUp={{ y: 16, duration: 0.4 }}>
				<p>{active.kicker}</p>
				<strong>{active.year}</strong>
			</div>
			<div class="product-specs" use:fadeUp={{ y: 16, delay: 0.05, duration: 0.45 }} aria-label={`${active.name} specifications`}>
				{#each active.specs as spec}
					<div><span>{spec.label} :</span><strong>{spec.value}</strong></div>
				{/each}
			</div>
			<div class="product-title-bg" aria-hidden="true">
				<img src={active.titleSvg} alt="" use:fadeScale={{ duration: 0.5 }} />
			</div>
		{/key}
		<div class="dial" aria-hidden="true"></div>
		{#key activeProduct}
			<img
				use:fadeScale={{ duration: 0.55 }}
				use:tiltHover={{ maxTilt: 12, scale: 1.03 }}
				class:phone-product={active.name === 'AgroCapture'}
				class="product-image"
				src={active.mainImage}
				alt={active.mainAlt}
			/>
		{/key}
		{#key activeProduct}
			<h2 id="product-title" use:fadeUp={{ y: 20, delay: 0.1, duration: 0.5 }}>{active.tagline}</h2>
		{/key}
		<div class="product-controls" aria-label="Product carousel controls">
			<button type="button" onclick={previous} aria-label="Previous product">‹</button>
			<div class="product-dots" aria-label="Choose product">
				{#each products as product, index}
					<button
						type="button"
						class:active-dot={index === activeProduct}
						onclick={() => select(index)}
						aria-label={`Show ${product.name}`}
						aria-current={index === activeProduct ? 'true' : undefined}
					></button>
				{/each}
			</div>
			<button type="button" onclick={next} aria-label="Next product">›</button>
		</div>
	</div>
</section>
