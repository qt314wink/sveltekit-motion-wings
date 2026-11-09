<script lang="ts">
	import { animate, hover, type AnimationPlaybackControls } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion.js';

	let el: HTMLElement | undefined = $state();

	$effect(() => {
		if ($reducedMotion || !el) return;
		const node = el;
		let active: AnimationPlaybackControls | undefined;
		const stop = hover(node, () => {
			active?.stop();
			active = animate(
				node,
				{ scale: 1.08, rotate: 2 },
				{ type: 'spring', stiffness: 180, damping: 16 }
			);
			return () => {
				active?.stop();
				active = animate(
					node,
					{ scale: 1, rotate: 0 },
					{ type: 'spring', stiffness: 220, damping: 20 }
				);
			};
		});
		return () => {
			stop();
			active?.cancel();
			animate(node, { scale: 1, rotate: 0 }, { duration: 0 });
		};
	});
</script>

<div
	bind:this={el}
	class="h-40 w-40 rounded-full"
	style="background: conic-gradient(from 120deg, #e8d5ff, #9ae6ff, #ffe6c7, #e8d5ff); box-shadow: inset 0 0 40px rgba(255,255,255,.55);"
	role="img"
	aria-label="Nacre mosaic orb"
></div>
