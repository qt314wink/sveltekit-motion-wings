<script lang="ts">
	import { animate, hover, type AnimationPlaybackControls } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion.js';

	let { word = 'CORRUPT' }: { word?: string } = $props();
	const letters = $derived(word.split(''));
	let row: HTMLElement | undefined = $state();

	$effect(() => {
		// re-subscribe when letters change so hover targets current spans
		void letters;
		if ($reducedMotion || !row) return;
		const el = row;
		const nodes = [...el.querySelectorAll('[data-ch]')] as HTMLElement[];
		let active: AnimationPlaybackControls[] = [];
		const stop = hover(el, () => {
			active.forEach((control) => control.stop());
			active = nodes.map((c, i) =>
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
			return () => {
				active.forEach((control) => control.stop());
				active = nodes.map((c) => animate(c, { x: 0, y: 0, filter: 'none' }, { duration: 0.15 }));
			};
		});
		return () => {
			stop();
			active.forEach((control) => control.cancel());
			animate(nodes, { x: 0, y: 0, filter: 'none' }, { duration: 0 });
		};
	});
</script>

<p bind:this={row} class="flex font-mono text-2xl tracking-widest text-fuchsia-300">
	{#each letters as ch, i (word + '-' + i)}
		<span data-ch>{ch}</span>
	{/each}
</p>
