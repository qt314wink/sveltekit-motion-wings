import assert from 'node:assert/strict';
import CDP from 'chrome-remote-interface';

const timeout = setTimeout(() => process.exit(1), 20000);
const client = await CDP();
const { Page, Runtime, Emulation } = client;
const evaluate = async (expression) => {
	const result = await Runtime.evaluate({ expression, returnByValue: true, awaitPromise: true });
	if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
	return result.result.value;
};
const media = (value) =>
	Emulation.setEmulatedMedia({ features: [{ name: 'prefers-reduced-motion', value }] });
try {
	await Page.enable();
	await media('no-preference');
	await Page.navigate({ url: 'http://localhost:5173/preview' });
	await Page.loadEventFired();
	await evaluate(`new Promise(resolve => { const ready = () => {
 if (document.querySelector('[data-strip]')?.getAnimations().length) resolve();
 else setTimeout(ready, 5);
 }; ready(); })`);
	await media('reduce');
	await evaluate('new Promise(r => setTimeout(r, 40))');
	assert.deepEqual(
		await evaluate(
			`Array.from(document.querySelectorAll('[data-strip]')).map(el => ({opacity:getComputedStyle(el).opacity, transform:getComputedStyle(el).transform, running:el.getAnimations().filter(a=>a.playState==='running').length}))`
		),
		Array.from({ length: 5 }, () => ({ opacity: '1', transform: 'none', running: 0 })),
		'quilling becomes fully visible and static during its entrance'
	);
	console.log('PASS: Quilling entrance cleanup');
	for (const fixture of [
		{
			name: 'MosaicNacre',
			selector: '[aria-label="Nacre mosaic orb"]',
			event: 'pointerenter',
			targets: '[aria-label="Nacre mosaic orb"]'
		},
		{
			name: 'OpArt',
			selector: '[aria-label="Op-Art pulse"]',
			event: 'pointerdown',
			targets: '[aria-label="Op-Art pulse"]'
		},
		{
			name: 'GlitchNeon',
			selector: '[data-ch]',
			event: 'pointerenter',
			parent: true,
			targets: '[data-ch]'
		},
		{
			name: 'CosmicFlows',
			selector: '[aria-label="Cosmic parallax"]',
			event: 'pointermove',
			targets: '[aria-label="Cosmic parallax"] > div'
		}
	]) {
		await media('no-preference');
		await evaluate('new Promise(r => setTimeout(r, 50))');
		await evaluate(`(() => {
 const fixture = ${JSON.stringify(fixture)};
 let el = document.querySelector(fixture.selector); if(fixture.parent) el = el.parentElement;
 const r = el.getBoundingClientRect();
 el.dispatchEvent(new PointerEvent(fixture.event,{pointerType:'mouse',isPrimary:true,button:0,buttons:1,clientX:r.right-5,clientY:r.bottom-5,bubbles:true}));
 })()`);
		await evaluate('new Promise(r => setTimeout(r, 45))');
		assert.ok(
			await evaluate(
				`Array.from(document.querySelectorAll(${JSON.stringify(fixture.targets)})).some(el => el.getAnimations().length || getComputedStyle(el).transform !== 'none')`
			),
			`${fixture.name}: fixture must animate before toggle`
		);
		await media('reduce');
		await evaluate('new Promise(r => setTimeout(r, 40))');
		const states = await evaluate(
			`Array.from(document.querySelectorAll(${JSON.stringify(fixture.targets)})).map(el => ({ transform:getComputedStyle(el).transform, opacity:getComputedStyle(el).opacity, filter:getComputedStyle(el).filter, running:el.getAnimations().filter(a=>a.playState==='running').length }))`
		);
		for (const state of states) {
			assert.equal(state.transform, 'none', `${fixture.name}: static transform`);
			assert.equal(state.opacity, '1', `${fixture.name}: static opacity`);
			assert.equal(state.running, 0, `${fixture.name}: no active playback`);
			if (fixture.name === 'GlitchNeon') assert.equal(state.filter, 'none');
		}
		await evaluate(
			`window.dispatchEvent(new PointerEvent('pointerup',{pointerType:'mouse',isPrimary:true,button:0,bubbles:true}))`
		);
		console.log(`PASS: ${fixture.name} runtime cleanup`);
	}
	await media('no-preference');
	await evaluate('new Promise(r => setTimeout(r, 50))');
	await evaluate(`(() => {
 window.retiredNodes = Array.from(document.querySelectorAll('article, [data-ch], [data-strip], [aria-label="Nacre mosaic orb"], [aria-label="Op-Art pulse"], [aria-label="Cosmic parallax"] > div'));
 for(const selector of ['article', '[aria-label="Nacre mosaic orb"]', '[data-ch]']) {
  let el = document.querySelector(selector); if(selector==='[data-ch]') el=el.parentElement;
  el.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse',isPrimary:true,bubbles:true}));
 }
 document.querySelector('[aria-label="Op-Art pulse"]').dispatchEvent(new PointerEvent('pointerdown',{pointerType:'mouse',isPrimary:true,button:0,buttons:1,bubbles:true}));
 const stage = document.querySelector('[aria-label="Cosmic parallax"]');
 const r = stage.getBoundingClientRect();
 stage.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',isPrimary:true,clientX:r.right-5,clientY:r.bottom-5,bubbles:true}));
 const link = document.createElement('a'); link.href='/'; document.body.append(link); link.click(); link.remove();
 })()`);
	await evaluate(
		`new Promise(resolve => { const ready = () => window.retiredNodes.every(el => !el.isConnected) ? resolve() : setTimeout(ready, 10); ready(); })`
	);
	await evaluate('new Promise(r => setTimeout(r, 50))');
	assert.equal(
		await evaluate(
			`window.retiredNodes.flatMap(el => el.getAnimations()).filter(a => a.playState === 'running').length`
		),
		0,
		'route unmount cancels playback on detached nodes'
	);
	console.log('PASS: route unmount cancels playback');
} finally {
	clearTimeout(timeout);
	await client.close();
}
