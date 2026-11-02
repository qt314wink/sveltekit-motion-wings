<script lang="ts">
	import PrimitivesCard from '#lib/components/PrimitivesCard.svelte';
	import MosaicNacre from '#lib/components/MosaicNacre.svelte';
	import Quilling from '#lib/components/Quilling.svelte';
	import OpArt from '#lib/components/OpArt.svelte';
	import GlitchNeon from '#lib/components/GlitchNeon.svelte';
	import CosmicFlows from '#lib/components/CosmicFlows.svelte';
</script>

<main class="min-h-screen bg-slate-950 px-6 py-10 text-white">
	<h1 class="mb-2 text-2xl font-medium tracking-tight">Motion wings preview</h1>
	<p class="mb-10 text-sm text-white/60">Runtime gallery — display only, no component logic changes.</p>

	<div class="grid gap-10 md:grid-cols-2">
		<section class="space-y-3">
			<h2 class="text-xs uppercase tracking-[0.2em] text-violet-300/80">PrimitivesCard</h2>
			<PrimitivesCard />
		</section>

		<section class="space-y-3">
			<h2 class="text-xs uppercase tracking-[0.2em] text-violet-300/80">MosaicNacre</h2>
			<MosaicNacre />
		</section>

		<section class="space-y-3">
			<h2 class="text-xs uppercase tracking-[0.2em] text-violet-300/80">Quilling</h2>
			<Quilling />
		</section>

		<section class="space-y-3">
			<h2 class="text-xs uppercase tracking-[0.2em] text-violet-300/80">OpArt</h2>
			<OpArt />
		</section>

		<section class="space-y-3">
			<h2 class="text-xs uppercase tracking-[0.2em] text-violet-300/80">GlitchNeon</h2>
			<GlitchNeon />
		</section>

		<section class="space-y-3 md:col-span-2">
			<h2 class="text-xs uppercase tracking-[0.2em] text-violet-300/80">CosmicFlows</h2>
			<CosmicFlows />
		</section>
	</div>
</main>
