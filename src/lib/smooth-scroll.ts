import Lenis from 'lenis';

let lenis: Lenis | null = null;
let raf = 0;

// Smooth scroll berinersia: roda mouse/trackpad dihaluskan, bukan loncat per langkah.
export function initSmoothScroll() {
	if (lenis || typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	lenis = new Lenis({
		duration: 1.2,
		easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
		smoothWheel: true,
		wheelMultiplier: 0.9,
		anchors: true
	});

	const loop = (time: number) => {
		lenis?.raf(time);
		raf = requestAnimationFrame(loop);
	};
	raf = requestAnimationFrame(loop);
}

export function destroySmoothScroll() {
	cancelAnimationFrame(raf);
	lenis?.destroy();
	lenis = null;
}

// Dipakai saat overlay (menu mobile) terbuka agar halaman di belakangnya tidak ikut bergulir.
export const pauseSmoothScroll = () => lenis?.stop();
export const resumeSmoothScroll = () => lenis?.start();
