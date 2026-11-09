# PR #1 review and implementation plan

Reviewed head: 1551a25911ef506aa174bc5db7604fc47a9c325f.

## Findings

1. **Blocking: six store imports fail type checking.** The package's `#lib/*` import mapping preserves the supplied suffix. Extensionless `reducedMotion` imports do not resolve in TypeScript. Use `.js` specifiers so TypeScript resolves the corresponding `.ts` source. Verified with `npm run check`: six errors before, zero afterward.
2. **Reduced-motion card retains its animated pose.** Hover the primitive card, then enable reduced motion. Motion's `stop()` preserves the last frame, leaving a translated/scaled card despite the static-mode message. A real Chromium regression test reproduced `matrix(1.02, 0, 0, 1.02, 0, -6)` instead of `none`. Cleanup now removes the owned transform after stopping playback.
3. **Remaining lifecycle review:** MosaicNacre, OpArt, GlitchNeon, CosmicFlows and Quilling do not retain animation controls for effect cleanup. Removing event handlers does not cancel playback. These need individual runtime toggle/unmount tests before the gallery can claim complete reduced-motion lifecycle coverage.
4. **Remaining interaction review:** primitive hover/press callbacks have independent states; releasing outside can choose a hover scale. Test pointer cancellation and release outside before changing the interaction model.

## Design

Retain the current gallery composition in this correctness pass. Each component should own its gesture subscriptions, active playback and static pose. The invariant is that changing to reduced motion synchronously ends playback and restores the canonical static visual. The primitive card implements the first slice; no shared animation abstraction is needed yet.

For the next interaction slice, derive the primitive pose from hovered/pressed state: pressed takes priority, hovered comes next, otherwise idle. Reset both state and transform during teardown. Preserve current typography and colors; provide visible focus and keyboard parity if the card becomes an actionable control.

## Plan and status

- Implemented: resolve store imports, restore the primitive card's static transform, add a browser regression test, normalize existing formatting failures.
- Next: extend lifecycle ownership to the other five specimens with toggle/unmount reproductions.
- Then: test press/hover arbitration, keyboard interaction and narrow-screen overflow.
- Deployment adapter selection remains a hosting decision; adapter-auto did not detect a deployment target in this environment.

## Verification

Install dependencies with `npm ci`. Start `npm run dev` on port 5173 and a local Chromium instance with `--remote-debugging-port=9222`, then run `npm test`. The test controls that debugging instance and changes its media emulation. Use a dedicated test profile, not a personal browser session.

Also run `npm run check`, `npm run lint` and `npm run build`. The browser regression was observed failing against the original card before implementation. It covers the primitive card only; it does not certify all gallery animations.
