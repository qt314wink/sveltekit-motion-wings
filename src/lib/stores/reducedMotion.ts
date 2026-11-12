import { readable } from 'svelte/store';

function matches(): boolean {
	if (typeof window === 'undefined') return false;
	return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Shared prefers-reduced-motion flag; updates when the OS setting changes. */
export const reducedMotion = readable(matches(), (set) => {
	if (typeof window === 'undefined') return;
	const mq = matchMedia('(prefers-reduced-motion: reduce)');
	const update = () => set(mq.matches);
	update();
	mq.addEventListener('change', update);
	return () => mq.removeEventListener('change', update);
});
