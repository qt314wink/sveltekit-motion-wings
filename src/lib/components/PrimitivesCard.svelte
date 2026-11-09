<script lang="ts">
	import { animate, hover, press, type AnimationPlaybackControls } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion.js';

	let card: HTMLElement | undefined = $state();
	let active: AnimationPlaybackControls | undefined;

	function run(keyframes: Record<string, number>, options: Parameters<typeof animate>[2]) {
		active?.stop();
		if (!card) return;
		active = animate(card, keyframes, options) as AnimationPlaybackControls;
		return active;
	}

	$effect(() => {
		if ($reducedMotion || !card) return;
		const el = card;
		const stopHover = hover(el, () => {
			run({ y: -6, scale: 1.02 }, { type: 'spring', stiffness: 280, damping: 22 });
			return () => run({ y: 0, scale: 1 }, { type: 'spring', stiffness: 320, damping: 28 });
		});
		const stopPress = press(el, () => {
			run({ scale: 0.98 }, { duration: 0.12 });
			return () => run({ scale: 1.02 }, { duration: 0.18 });
		});
		return () => {
			stopHover();
			stopPress();
			active?.cancel();
			active = undefined;
			// Reset Motion's cached values too, so pending renders keep the static pose.
			animate(el, { x: 0, y: 0, scale: 1 }, { duration: 0 });
		};
	});
</script>

<article
	bind:this={card}
	class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
	class:transition-none={$reducedMotion}
>
	<p class="text-sm tracking-[0.2em] text-violet-200/80 uppercase">Primitives</p>
	<h2 class="mt-2 text-xl text-white">Hover lift · press scale</h2>
	<p class="mt-3 text-sm text-white/70">
		{$reducedMotion ? 'Static card — reduced motion on.' : 'Hover lifts; press compresses.'}
	</p>
</article>
