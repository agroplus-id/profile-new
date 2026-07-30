import { animate, inView, stagger } from '@motionone/dom';

const reducedMotion =
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Framer-motion inspired spring easing curve: cubic-bezier(0.16, 1, 0.3, 1)
export const SPRING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type FadeUpOpts = { delay?: number; duration?: number; y?: number };

// Svelte action: fade-up when element enters viewport
export function fadeUp(el: HTMLElement, opts: FadeUpOpts = {}) {
	if (reducedMotion) return;
	const { delay = 0, duration = 0.75, y = 36 } = opts;
	el.style.opacity = '0';
	el.style.willChange = 'opacity, transform';
	inView(
		el,
		() => {
			animate(
				el,
				{ opacity: [0, 1], transform: [`translateY(${y}px)`, 'translateY(0px)'] },
				{ duration, delay, easing: SPRING_EASE }
			);
		},
		{ amount: 0.15 }
	);
}

// Svelte action: stagger children fade-up when parent enters viewport
export function staggerUp(
	el: HTMLElement,
	opts: { duration?: number; staggerDelay?: number; y?: number } = {}
) {
	if (reducedMotion) return;
	const { duration = 0.65, staggerDelay = 0.08, y = 32 } = opts;
	const children = Array.from(el.children) as HTMLElement[];
	children.forEach((c) => {
		c.style.opacity = '0';
		c.style.willChange = 'opacity, transform';
	});
	inView(
		el,
		() => {
			animate(
				children,
				{ opacity: [0, 1], transform: [`translateY(${y}px)`, 'translateY(0px)'] },
				{ duration, delay: stagger(staggerDelay), easing: SPRING_EASE }
			);
		},
		{ amount: 0.1 }
	);
}

// Svelte action: slide down from above (nav)
export function slideDown(el: HTMLElement, opts: { duration?: number; delay?: number } = {}) {
	if (reducedMotion) return;
	const { duration = 0.6, delay = 0 } = opts;
	el.style.willChange = 'opacity, transform';
	animate(
		el,
		{ opacity: [0, 1], transform: ['translateY(-100%)', 'translateY(0%)'] },
		{ duration, delay, easing: SPRING_EASE }
	);
}

// Svelte action: fade-in + scale (product image, hero image)
export function fadeScale(el: HTMLElement, opts: { duration?: number; delay?: number } = {}) {
	if (reducedMotion) return;
	const { duration = 0.55, delay = 0 } = opts;
	el.style.willChange = 'opacity, transform';
	animate(
		el,
		{
			opacity: [0, 1],
			transform: ['scale(0.92) translateY(18px)', 'scale(1) translateY(0px)']
		},
		{ duration, delay, easing: SPRING_EASE }
	);
}

// Svelte action: gentle float loop (decorative elements)
export function floatLoop(
	el: HTMLElement,
	opts: { distance?: number; duration?: number; rotate?: string } = {}
) {
	if (reducedMotion) return;
	const { distance = 14, duration = 6, rotate = '-24deg' } = opts;
	animate(
		el,
		{
			transform: [
				`rotate(${rotate}) translateY(0px)`,
				`rotate(${rotate}) translateY(-${distance}px)`,
				`rotate(${rotate}) translateY(0px)`
			]
		},
		{ duration, repeat: Infinity, easing: 'ease-in-out' }
	);
}

// Svelte action: interactive 3D perspective tilt on hover
export function tiltHover(
	el: HTMLElement,
	opts: { maxTilt?: number; scale?: number } = {}
) {
	if (reducedMotion) return;
	const { maxTilt = 10, scale = 1.02 } = opts;
	el.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
	el.style.transformStyle = 'preserve-3d';

	function handleMouseMove(e: MouseEvent) {
		const rect = el.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rotateX = ((y - centerY) / centerY) * -maxTilt;
		const rotateY = ((x - centerX) / centerX) * maxTilt;

		el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
	}

	function handleMouseLeave() {
		el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
	}

	el.addEventListener('mousemove', handleMouseMove);
	el.addEventListener('mouseleave', handleMouseLeave);

	return {
		destroy() {
			el.removeEventListener('mousemove', handleMouseMove);
			el.removeEventListener('mouseleave', handleMouseLeave);
		}
	};
}

// Svelte action: magnetic cursor pull for CTA buttons
export function magneticHover(el: HTMLElement, opts: { pull?: number } = {}) {
	if (reducedMotion) return;
	const { pull = 0.35 } = opts;
	el.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';

	function handleMouseMove(e: MouseEvent) {
		const rect = el.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;
		el.style.transform = `translate3d(${x * pull}px, ${y * pull}px, 0)`;
	}

	function handleMouseLeave() {
		el.style.transform = 'translate3d(0px, 0px, 0px)';
	}

	el.addEventListener('mousemove', handleMouseMove);
	el.addEventListener('mouseleave', handleMouseLeave);

	return {
		destroy() {
			el.removeEventListener('mousemove', handleMouseMove);
			el.removeEventListener('mouseleave', handleMouseLeave);
		}
	};
}

// Svelte action: count-up numerical animation when visible
export function counterAnimate(
	el: HTMLElement,
	opts: { from?: number; to: number; duration?: number; prefix?: string; suffix?: string }
) {
	if (reducedMotion) return;
	const { from = 0, to, duration = 1.5, prefix = '', suffix = '' } = opts;

	inView(
		el,
		() => {
			let startTime: number | null = null;
			function step(timestamp: number) {
				if (!startTime) startTime = timestamp;
				const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
				// Ease out cubic
				const easedProgress = 1 - Math.pow(1 - progress, 3);
				const current = Math.floor(from + (to - from) * easedProgress);
				el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
				if (progress < 1) {
					requestAnimationFrame(step);
				} else {
					el.textContent = `${prefix}${to.toLocaleString()}${suffix}`;
				}
			}
			requestAnimationFrame(step);
		},
		{ amount: 0.2 }
	);
}

// Svelte action: gentle breathing/pulse animation
export function pulseGlow(el: HTMLElement, opts: { scale?: number; duration?: number } = {}) {
	if (reducedMotion) return;
	const { scale = 1.05, duration = 3 } = opts;
	animate(
		el,
		{ transform: ['scale(1)', `scale(${scale})`, 'scale(1)'] },
		{ duration, repeat: Infinity, easing: 'ease-in-out' }
	);
}
