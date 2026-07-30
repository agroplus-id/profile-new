<script lang="ts">
	import { fadeUp, floatLoop, magneticHover } from '$lib/motion';
	import coffeePlant from '$lib/assets/images/daun.svg';
</script>

<section class="mission" id="about" aria-labelledby="mission-title">
	<div class="mission-heading" use:fadeUp={{ duration: 0.75 }}>
		<p>Mission &amp; Vision</p>
		<h2 id="mission-title">Designed for Better Coffee Quality.</h2>
		<a use:magneticHover href="#contact">GET IN TOUCH</a>
	</div>
	<img class="coffee-plant" use:floatLoop={{ distance: 18, duration: 7, rotate: '-24deg' }} src={coffeePlant} alt="Coffee plant illustration" />
	<div class="mission-copy" use:fadeUp={{ delay: 0.2, duration: 0.8 }}>
		<p>We believe the future of coffee isn't built by adding complexity, but by designing technology that feels effortless to use. Our mission is to create connected solutions that make upstream coffee production more visible, more manageable, and naturally integrated into everyday work.</p>
		<p>At <em>AgroPlus</em>, we imagine a future where every coffee grower and processor has access to thoughtfully designed technology. By combining practical innovation with connected systems, we strive to make the upstream coffee industry more transparent, more efficient, and ready for the next generation.</p>
	</div>
</section>
