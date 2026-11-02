<script lang="ts">
	import { animate } from 'motion';
	import { reducedMotion } from '$lib/stores/reducedMotion';

	let stage: HTMLElement | undefined = $state();
	let far: HTMLElement | undefined = $state();
	let near: HTMLElement | undefined = $state();

	$effect(() => {
		if ($reducedMotion || !stage) return;
		const el = stage;
		const onMove = (e: PointerEvent) => {
			if (!el.isConnected || !far?.isConnected || !near?.isConnected) return;
			const r = el.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width - 0.5;
			const y = (e.clientY - r.top) / r.height - 0.5;
			animate(far, { x: x * 8, y: y * 8 }, { duration: 0.4 });
			animate(near, { x: x * 22, y: y * 22 }, { duration: 0.25 });
		};
		el.addEventListener('pointermove', onMove);
		return () => el.removeEventListener('pointermove', onMove);
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
		class="absolute left-1/3 top-1/3 h-16 w-16 rounded-full bg-cyan-300/40 blur-md"
	></div>
</div>
