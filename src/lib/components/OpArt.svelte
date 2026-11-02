<script lang="ts">
	import { animate, press } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion';

	let ring: HTMLElement | undefined = $state();

	$effect(() => {
		if ($reducedMotion || !ring) return;
		const el = ring;
		const stop = press(el, () => {
			animate(el, { scale: [1, 1.35], opacity: [1, 0.35] }, { duration: 0.35 });
			return () => animate(el, { scale: 1, opacity: 1 }, { duration: 0.2 });
		});
		return () => stop();
	});
</script>

<button
	type="button"
	bind:this={ring}
	aria-label="Op-Art pulse"
	class="h-28 w-28 rounded-full border-[10px] border-black"
	style="background: repeating-radial-gradient(circle,#fff 0 6px,#000 6px 12px);"
></button>
