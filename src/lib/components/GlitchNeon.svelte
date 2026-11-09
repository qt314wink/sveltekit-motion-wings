<script lang="ts">
	import { animate, hover } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion.js';

	let { word = 'CORRUPT' }: { word?: string } = $props();
	const letters = $derived(word.split(''));
	let row: HTMLElement | undefined = $state();

	$effect(() => {
		// re-subscribe when letters change so hover targets current spans
		void letters;
		if ($reducedMotion || !row) return;
		const el = row;
		const stop = hover(el, () => {
			const nodes = [...el.querySelectorAll('[data-ch]')] as HTMLElement[];
			nodes.forEach((c, i) =>
				animate(
					c,
					{
						x: [0, i % 2 ? 4 : -4, 0],
						y: [0, (i % 3) - 1, 0],
						filter: ['none', 'hue-rotate(90deg)', 'none']
					},
					{ duration: 0.28, delay: i * 0.02 }
				)
			);
			return () =>
				nodes.forEach((c) => animate(c, { x: 0, y: 0, filter: 'none' }, { duration: 0.15 }));
		});
		return () => stop();
	});
</script>

<p bind:this={row} class="flex font-mono text-2xl tracking-widest text-fuchsia-300">
	{#each letters as ch, i (word + '-' + i)}
		<span data-ch>{ch}</span>
	{/each}
</p>
