# Design decisions

Greenfield game, aimed at close laptop and phone viewing. The visual language is a tactile instrument panel rather than a software dashboard. Narrative role: invite experimentation while keeping the active puzzle visually dominant. Temperature: quiet, playful, deliberate. The desktop layout reserves roughly half its width for the board; mobile condenses the introduction and promotes large touch controls.

- Visual variance 6/10: asymmetric editorial title alongside a dense play instrument.
- Motion 3/10: 190ms row/column movement and wrapping, subtle completion feedback, no perpetual animation; reduced motion respected.
- Density 4/10: one active level, one field note, ten frequencies behind a selector.
- Asset dependence 1/10: only elementary geometric gameplay marks and procedural sound.
- Brand fidelity 1/10: original identity; no external brand reproduced.

Palette: ivory #f3f0e7, ink #20383c, board #193238; signals coral #f18b72, teal #89c9b7, gold #edc778 and pale silver #c8d6e1. The shape of a signal carries the same information as its colour.

Typography: local Georgia for the large editorial title and counters; local Avenir Next/Avenir with Segoe UI fallback for controls. No remote fonts. Spacing follows mostly 4/8px steps. Instrument corner radius 13px, cells 4px; a modest soft shadow gives the board weight. Movement uses cubic-bezier(.22,.7,.2,1).

Capacity and accessibility: compact desktop arrows, 44px-high mobile shift buttons, keyboard selection separate from shifting, roving board tab stop, focus rings, live action text, undo/reset and optional hints. Every level is reachable without timing or audio requirements. No requirement to distinguish colours alone.

Browser visual acceptance is delegated to the parent task; the implementation agent did not open or automate a browser.
