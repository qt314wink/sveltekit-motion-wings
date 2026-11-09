<script lang="ts">
	import { animate } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion.js';

	let root: HTMLElement | undefined = $state();
	let played = false;

	$effect(() => {
		if ($reducedMotion || !root || played) return;
		const nodes = root.querySelectorAll<HTMLElement>('[data-strip]');
		const active = animate(
			nodes,
			{ y: [24, 0], opacity: [0, 1], rotate: [-4, 0] },
			{ delay: (i) => i * 0.07, type: 'spring', stiffness: 260, damping: 18 }
		);
		played = true;
		return () => {
			active.cancel();
			animate(nodes, { y: 0, rotate: 0, opacity: 1 }, { duration: 0 });
		};
	});
</script>

<div bind:this={root} class="flex gap-1" aria-label="Quilling strips">
	{#each ['#f4a261', '#e76f51', '#2a9d8f', '#264653', '#e9c46a'] as c (c)}
		<span data-strip class="h-24 w-3 rounded-full" style="background:{c}"></span>
	{/each}
</div>
