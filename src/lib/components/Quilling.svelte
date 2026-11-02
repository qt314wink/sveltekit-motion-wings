<script lang="ts">
	import { animate } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion';

	let root: HTMLElement | undefined = $state();
	let played = $state(false);

	$effect(() => {
		if ($reducedMotion || !root || played) return;
		animate(
			root.querySelectorAll('[data-strip]'),
			{ y: [24, 0], opacity: [0, 1], rotate: [-4, 0] },
			{ delay: (i) => i * 0.07, type: 'spring', stiffness: 260, damping: 18 }
		);
		played = true;
	});
</script>

<div bind:this={root} class="flex gap-1" aria-label="Quilling strips">
	{#each ['#f4a261', '#e76f51', '#2a9d8f', '#264653', '#e9c46a'] as c}
		<span data-strip class="h-24 w-3 rounded-full" style="background:{c}"></span>
	{/each}
</div>
