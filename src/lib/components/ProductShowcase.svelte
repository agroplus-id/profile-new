<script lang="ts">
	import { products } from '$lib/data/home';
	let activeProduct = $state(0);
	const active = $derived(products[activeProduct]);
	const select = (index: number) => activeProduct = index;
	const previous = () => activeProduct = (activeProduct - 1 + products.length) % products.length;
	const next = () => activeProduct = (activeProduct + 1) % products.length;
</script>

<section class="product-showcase" id="tools" aria-labelledby="product-title"><div class="product-stage">
	<div class="product-meta"><p>{active.kicker}</p><strong>{active.year}</strong></div>
	<div class="product-specs" aria-label={`${active.name} specifications`}>{#each active.specs as spec}<div><span>{spec.label} :</span><strong>{spec.value}</strong></div>{/each}</div>
	<div class="product-title-bg" aria-hidden="true"><img src={active.titleSvg} alt="" /></div><div class="dial" aria-hidden="true"></div>
	<img class:phone-product={active.name === 'AgroCapture'} class="product-image" src={active.mainImage} alt={active.mainAlt} />
	<h2 id="product-title">{active.tagline}</h2>
	<div class="product-controls" aria-label="Product carousel controls"><button type="button" onclick={previous} aria-label="Previous product">‹</button><div class="product-dots" aria-label="Choose product">{#each products as product, index}<button type="button" class:active-dot={index === activeProduct} onclick={() => select(index)} aria-label={`Show ${product.name}`} aria-current={index === activeProduct ? 'true' : undefined}></button>{/each}</div><button type="button" onclick={next} aria-label="Next product">›</button></div>
</div></section>
