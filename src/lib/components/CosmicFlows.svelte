<script lang="ts">
	import { animate, type AnimationPlaybackControls } from 'motion';
	import { reducedMotion } from '#lib/stores/reducedMotion.js';

	let stage: HTMLElement | undefined = $state();
	let far: HTMLElement | undefined = $state();
	let near: HTMLElement | undefined = $state();

	$effect(() => {
		if ($reducedMotion || !stage || !far || !near) return;
		const el = stage;
		const farLayer = far;
		const nearLayer = near;
		let active: AnimationPlaybackControls[] = [];
		const onMove = (e: PointerEvent) => {
			if (!el.isConnected || !farLayer.isConnected || !nearLayer.isConnected) return;
			const r = el.getBoundingClientRect();
			if (!r.width || !r.height) return;
			const x = (e.clientX - r.left) / r.width - 0.5;
			const y = (e.clientY - r.top) / r.height - 0.5;
			active.forEach((control) => control.stop());
			active = [
				animate(farLayer, { x: x * 8, y: y * 8 }, { duration: 0.4 }),
				animate(nearLayer, { x: x * 22, y: y * 22 }, { duration: 0.25 })
			];
		};
		el.addEventListener('pointermove', onMove);
		return () => {
			el.removeEventListener('pointermove', onMove);
			active.forEach((control) => control.cancel());
			animate([farLayer, nearLayer], { x: 0, y: 0 }, { duration: 0 });
		};
	});
</script>

<div
	bind:this={stage}
	class="relative h-48 overflow-hidden rounded-xl bg-slate-950"
	role="img"
	aria-label="Cosmic parallax"
>
	<div
		bind:this={far}
		class="absolute inset-0"
		style="background: radial-gradient(circle at 30% 40%, #312e81, transparent 55%);"
	></div>
	<div
		bind:this={near}
		class="absolute top-1/3 left-1/3 h-16 w-16 rounded-full bg-cyan-300/40 blur-md"
	></div>
</div>
