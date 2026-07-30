<script lang="ts">
	import { fadeUp, fadeScale, floatLoop } from '$lib/motion';
	import topLeft from '$lib/assets/images/group-1234980.svg';
	import topRight from '$lib/assets/images/group-1234990.svg';
	import bottomLeft from '$lib/assets/images/group-1235000.svg';
	import bottomRight from '$lib/assets/images/group-1235010.svg';
</script>

<section class="intro-section" aria-labelledby="intro-title">
	<img use:fadeScale={{ delay: 0.1 }} use:floatLoop={{ distance: 8, duration: 5, rotate: '0deg' }} class="corner corner-top-left" src={topLeft} alt="" aria-hidden="true" />
	<img use:fadeScale={{ delay: 0.2 }} use:floatLoop={{ distance: 8, duration: 6, rotate: '0deg' }} class="corner corner-top-right" src={topRight} alt="" aria-hidden="true" />
	<img use:fadeScale={{ delay: 0.3 }} use:floatLoop={{ distance: 8, duration: 5.5, rotate: '0deg' }} class="corner corner-bottom-left" src={bottomLeft} alt="" aria-hidden="true" />
	<img use:fadeScale={{ delay: 0.4 }} use:floatLoop={{ distance: 8, duration: 6.5, rotate: '0deg' }} class="corner corner-bottom-right" src={bottomRight} alt="" aria-hidden="true" />
	<h2 id="intro-title" use:fadeUp={{ duration: 0.85, y: 40 }}>Agroplus is developing next-gen upstream technology of coffee industry based on easiness user experience.</h2>
</section>
