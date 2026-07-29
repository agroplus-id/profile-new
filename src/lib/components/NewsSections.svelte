<script lang="ts">
	import { partnerLogos, pressItems, updates } from '$lib/data/home';
</script>

<section class="updates-section" aria-labelledby="updates-title"><div class="section-heading"><h2 id="updates-title">Updates</h2><a href="/">More Updates</a></div><div class="updates-grid">{#each updates as update}<article class="update-card"><div class="update-thumb"></div><p><span>Press Release</span><i></i>{update.date}</p><h3>{update.title}</h3></article>{/each}</div></section>
<section class="press-section" aria-labelledby="press-title"><div class="section-heading"><h2 id="press-title">In the press</h2><div class="press-arrows" aria-hidden="true"><span>‹</span><span>›</span></div></div><div class="press-grid">{#each pressItems as item}<article><h3>{item.title}</h3><p>"{item.body}</p></article>{/each}</div><div class="partner-marquee" aria-label="Partner logos"><div class="logo-strip">{#each [false, true] as duplicate}<div class="logo-set" aria-hidden={duplicate}>{#each partnerLogos as logo}<img src={logo} alt={duplicate ? '' : 'Partner logo'} />{/each}</div>{/each}</div></div></section>
