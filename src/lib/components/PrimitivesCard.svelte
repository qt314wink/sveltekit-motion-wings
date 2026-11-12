<script lang="ts">
	import { animate, press, type AnimationPlaybackControls } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion.js';

	let card: HTMLElement | undefined = $state();
	let active: AnimationPlaybackControls | undefined;
	let trigger: HTMLButtonElement | undefined = $state();
	let activations = $state(0);

	function run(keyframes: Record<string, number>, options: Parameters<typeof animate>[2]) {
		active?.stop();
		if (!card) return;
		active = animate(card, keyframes, options) as AnimationPlaybackControls;
		return active;
	}

	$effect(() => {
		if ($reducedMotion || !card || !trigger) return;
		const el = card;
		const button = trigger;
		let hovered = false;
		let focused = false;
		let pressed = false;
		const update = () =>
			run(
				{ y: hovered || focused ? -6 : 0, scale: pressed ? 0.98 : hovered || focused ? 1.02 : 1 },
				{ type: 'spring', stiffness: 320, damping: 28 }
			);
		const enter = () => {
			hovered = true;
			update();
		};
		const leave = () => {
			hovered = false;
			update();
		};
		const focus = () => {
			focused = button.matches(':focus-visible');
			update();
		};
		const blur = () => {
			focused = false;
			pressed = false;
			update();
		};
		el.addEventListener('pointerenter', enter);
		el.addEventListener('pointerleave', leave);
		const keydown = (event: KeyboardEvent) => {
			if (event.code === 'Space') {
				pressed = true;
				update();
			}
		};
		const keyup = (event: KeyboardEvent) => {
			if (event.code === 'Space') {
				pressed = false;
				update();
			}
		};
		button.addEventListener('keydown', keydown);
		button.addEventListener('keyup', keyup);
		button.addEventListener('focus', focus);
		button.addEventListener('blur', blur);
		const stopPress = press(button, () => {
			pressed = true;
			update();
			return () => {
				pressed = false;
				update();
			};
		});
		return () => {
			el.removeEventListener('pointerenter', enter);
			el.removeEventListener('pointerleave', leave);
			button.removeEventListener('keydown', keydown);
			button.removeEventListener('keyup', keyup);
			button.removeEventListener('focus', focus);
			button.removeEventListener('blur', blur);
			stopPress();
			active?.cancel();
			active = undefined;
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
		{$reducedMotion
			? 'Static card — reduced motion on.'
			: 'Hover or focus lifts; press the button to compress.'}
	</p>
	<button
		bind:this={trigger}
		type="button"
		onclick={() => (activations += 1)}
		class="mt-4 rounded-lg border border-violet-300/50 px-4 py-2 text-sm text-violet-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-200"
	>
		Try press interaction
	</button>
	<p class="mt-3 text-sm text-white/70" role="status">
		{activations} activation{activations === 1 ? '' : 's'}
	</p>
</article>
