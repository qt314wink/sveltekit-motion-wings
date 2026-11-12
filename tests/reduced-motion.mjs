import assert from 'node:assert/strict';
import CDP from 'chrome-remote-interface';

// Run against `npm run dev` and Chromium with --remote-debugging-port=9222.
const timeout = setTimeout(() => {
	console.error('Browser test timed out');
	process.exit(1);
}, 20000);
const client = await CDP();
const { Page, Runtime, Emulation, Input } = client;
const evaluate = async (expression) => {
	const result = await Runtime.evaluate({ expression, returnByValue: true, awaitPromise: true });
	if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
	return result.result.value;
};
try {
	await Page.enable();
	await Emulation.setEmulatedMedia({
		features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
	});
	await Page.navigate({ url: 'http://localhost:5173/preview' });
	await Page.loadEventFired();
	await evaluate(`new Promise(resolve => {
 const ready = () => document.querySelector('article') && document.querySelector('article').textContent.includes('Hover or focus lifts') ? resolve() : setTimeout(ready, 20);
 ready();
 })`);
	const point = await evaluate(
		`(() => { const r = document.querySelector('article').getBoundingClientRect(); return { x: r.x + 30, y: r.y + 30 }; })()`
	);
	await evaluate('new Promise(r => setTimeout(r, 500))');
	await Input.dispatchMouseEvent({ type: 'mouseMoved', x: 0, y: 0 });
	await Input.dispatchMouseEvent({ type: 'mouseMoved', ...point });
	await evaluate('new Promise(r => setTimeout(r, 45))');
	assert.notEqual(
		await evaluate("getComputedStyle(document.querySelector('article')).transform"),
		'none',
		'hover must exercise the animation'
	);
	await Emulation.setEmulatedMedia({
		features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
	});
	await evaluate('new Promise(r => setTimeout(r, 100))');
	assert.equal(
		await evaluate("getComputedStyle(document.querySelector('article')).transform"),
		'none',
		'enabling reduced motion restores the static card'
	);
	assert.equal(
		await evaluate(
			'document.querySelector("article").getAnimations().filter(a => a.playState === "running").length'
		),
		0
	);
	console.log('PASS: runtime reduced motion restores static card and stops animations');
} finally {
	clearTimeout(timeout);
	await client.close();
}
