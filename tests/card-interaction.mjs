import assert from 'node:assert/strict';
import CDP from 'chrome-remote-interface';
const timer = setTimeout(() => process.exit(1), 20000);
const client = await CDP();
const { Page, Runtime, Input, Emulation } = client;
const evaluate = async (expression) => {
	const r = await Runtime.evaluate({ expression, returnByValue: true, awaitPromise: true });
	if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
	return r.result.value;
};
const wait = () => evaluate('new Promise(r=>setTimeout(r,700))');
try {
	await Page.enable();
	await Emulation.setEmulatedMedia({
		features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
	});
	await Page.navigate({ url: process.env.TEST_URL || 'http://localhost:5173/preview' });
	await Page.loadEventFired();
	await wait();
	const p = await evaluate(
		`(()=>{const r=document.querySelector('article button').getBoundingClientRect();return {x:r.x+30,y:r.y+30}})()`
	);
	await Input.dispatchMouseEvent({ type: 'mouseMoved', x: 0, y: 0 });
	await Input.dispatchMouseEvent({ type: 'mouseMoved', ...p });
	await Input.dispatchMouseEvent({ type: 'mousePressed', ...p, button: 'left', clickCount: 1 });
	await Input.dispatchMouseEvent({ type: 'mouseMoved', x: 0, y: 0, button: 'left', buttons: 1 });
	await Input.dispatchMouseEvent({
		type: 'mouseReleased',
		x: 0,
		y: 0,
		button: 'left',
		clickCount: 1
	});
	await wait();
	assert.equal(
		await evaluate(`getComputedStyle(document.querySelector('article')).transform`),
		'none',
		'release outside restores idle pose'
	);
	await evaluate(`document.querySelector('article button').focus()`);
	await wait();
	assert.equal(await evaluate(`document.activeElement.tagName`), 'BUTTON');
	await Input.dispatchKeyEvent({
		type: 'keyDown',
		key: ' ',
		code: 'Space',
		windowsVirtualKeyCode: 32
	});
	await evaluate('new Promise(r=>setTimeout(r,180))');
	assert.ok(
		await evaluate(
			`new DOMMatrixReadOnly(getComputedStyle(document.querySelector('article')).transform).a < 0.995`
		),
		'keyboard press compresses card'
	);
	await Input.dispatchKeyEvent({
		type: 'keyUp',
		key: ' ',
		code: 'Space',
		windowsVirtualKeyCode: 32
	});
	await wait();
	assert.ok(
		await evaluate(`document.querySelector('article').textContent.includes('1 activation')`),
		'keyboard activation is reported'
	);
	await Input.dispatchKeyEvent({
		type: 'keyDown',
		text: '\r',
		key: 'Enter',
		code: 'Enter',
		windowsVirtualKeyCode: 13
	});
	await Input.dispatchKeyEvent({
		type: 'keyUp',
		key: 'Enter',
		code: 'Enter',
		windowsVirtualKeyCode: 13
	});
	await wait();
	assert.ok(
		await evaluate(`document.querySelector('article').textContent.includes('2 activations')`),
		'Enter activates once'
	);
	await Emulation.setEmulatedMedia({
		features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
	});
	await Input.dispatchKeyEvent({
		type: 'keyDown',
		key: ' ',
		code: 'Space',
		windowsVirtualKeyCode: 32
	});
	await Input.dispatchKeyEvent({
		type: 'keyUp',
		key: ' ',
		code: 'Space',
		windowsVirtualKeyCode: 32
	});
	await wait();
	assert.ok(
		await evaluate(`document.querySelector('article').textContent.includes('3 activations')`),
		'reduced motion preserves native activation'
	);
	assert.equal(
		await evaluate(`getComputedStyle(document.querySelector('article')).transform`),
		'none',
		'reduced motion activation stays static'
	);

	console.log('PASS: release outside, Space/Enter and reduced-motion activation');
} finally {
	clearTimeout(timer);
	await client.close();
}
