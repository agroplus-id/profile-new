<script lang="ts">
	import connectivity from '$lib/assets/images/desktop10/connectivity.svg';
	import plus from '$lib/assets/images/desktop10/group-1234980.svg';
	import { fadeUp, staggerUp, slideDown, fadeScale, floatLoop } from '$lib/motion';
</script>

<section class="connectivity" aria-labelledby="connectivity-title">
	<img class="plus tl" src={plus} alt="" aria-hidden="true" />
	<img class="plus tr" src={plus} alt="" aria-hidden="true" />
	<img class="plus bl" src={plus} alt="" aria-hidden="true" />
	<img class="plus br" src={plus} alt="" aria-hidden="true" />

	<div class="connectivity-grid">
		<div use:fadeUp class="copy-card">
			<div>
				<h2 id="connectivity-title">Digital Connectivity</h2>
				<p class="sub">Mobile app &amp; website</p>
			</div>
			<ul>
				<li><strong>Remote Monitoring</strong></li>
				<li>Batch Logging</li>
				<li>Recipe Management</li>
				<li>Product Passport</li>
			</ul>
		</div>
		<div use:fadeScale class="visual-card"><img src={connectivity} alt="Fermego mobile app showing connected devices" /></div>
	</div>
</section>

<style>
	.connectivity { position: relative; background: #f0f3f1; padding: clamp(48px, 7vw, 96px) clamp(32px, 7vw, 120px); }
	.plus { position: absolute; width: clamp(14px, 1.2vw, 20px); height: auto; }
	.tl { top: clamp(14px, 2.5vw, 36px); left: clamp(18px, 3vw, 44px); }
	.tr { top: clamp(14px, 2.5vw, 36px); right: clamp(18px, 3vw, 44px); }
	.bl { bottom: clamp(14px, 2.5vw, 36px); left: clamp(18px, 3vw, 44px); }
	.br { bottom: clamp(14px, 2.5vw, 36px); right: clamp(18px, 3vw, 44px); }
	.connectivity-grid { display: grid; grid-template-columns: 1fr 1fr; align-items: stretch; gap: clamp(14px, 1.8vw, 24px); max-width: 1200px; margin: 0 auto; }
	.copy-card { display: flex; flex-direction: column; justify-content: space-between; min-height: clamp(340px, 40vw, 580px); padding: clamp(28px, 3.5vw, 52px); border-radius: clamp(12px, 1.2vw, 20px); background: #d8e4c6; }
	h2 { margin: 0 0 8px; color: #44552d; font-size: clamp(1.6rem, 2.8vw, 3rem); font-weight: 800; line-height: .95; letter-spacing: -.03em; }
	.sub { margin: 0; color: #849962; font-size: clamp(.78rem, .95vw, 1rem); font-weight: 500; }
	ul { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; color: #263214; font-size: clamp(.88rem, 1.1vw, 1.15rem); font-weight: 500; line-height: 1.4; }
	ul strong { font-weight: 800; }
	.visual-card { display: flex; align-items: flex-end; justify-content: center; min-height: clamp(340px, 40vw, 580px); overflow: hidden; border-radius: clamp(12px, 1.2vw, 20px); background: #f0f3f1; padding-top: clamp(24px, 4vw, 56px); }
	.visual-card img { display: block; width: 90%; max-width: 480px; object-fit: contain; }
	@media (max-width: 760px) { .connectivity-grid { grid-template-columns: 1fr; } .copy-card { min-height: auto; } .visual-card { min-height: 320px; } }
</style>
