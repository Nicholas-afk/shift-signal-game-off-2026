# Shift Signal

A finished, original browser puzzle prepared for Game Off 2026's **SHIFT** theme. Shift entire rows and columns on a wrapping board until each solid signal meets its matching outline. Ten authored frequencies grow from 3×3 to 5×5, with search-proven shortest routes of 1–7 moves. There is no timer or move limit.

## Run

No installation, build step, server or internet connection is required.

1. Open `index.html` in a current desktop or mobile browser. All companion files must remain beside it.
2. To serve locally instead, run this command in this folder:

   ```sh
   python3 -m http.server 8765
   ```

3. Open `http://localhost:8765/`. Stop the server with Ctrl+C.

The runtime uses only `index.html`, `style.css`, `engine.js`, `levels.js` and `game.js`. It makes no third-party requests, uses no external assets or packages, and includes optional synthesized sound.

## Play and controls

- **Desktop pointer:** click arrows around the board to move the corresponding whole row or column. Click any cell to select its row and column for keyboard control.
- **Touch/small screen:** tap a cell, then use the four large arrow buttons below the board. Their label identifies the selected row and column.
- **Keyboard:** Tab to the selected board cell; the arrow keys shift its row/column. Shift+arrow changes the selected cell without making a move. Z undoes; R resets. Escape closes a dialog. All controls are also ordinary focusable buttons.
- **Undo / Reset:** return to the previous state or restart the current frequency. Moving an empty line does not count as a shift.
- **A small hint:** reveals the next move on a shortest route from the current state. It never moves pieces automatically.
- **Explore the frequencies:** choose any of the ten puzzles. All are available from the start.
- **Sound:** off by default; toggle in the header. Sound never starts without a user gesture.

The board wraps: a signal leaving the right edge returns on the left, and a signal leaving the bottom returns at the top. Homes stay fixed. Signals are distinct by shape as well as colour. Reduced-motion preferences disable movement animation. Live text announces actions and completion for assistive technology.

Completed frequencies, best move counts and the last selected frequency are stored in this browser's local storage when available. No data is transmitted. Clearing browser storage resets progress. A private/file browser context may not preserve it; gameplay remains available.

## Itch.io package

`shift-signal-itch.zip` is ready to inspect and upload as an HTML game. `index.html` is at the ZIP root; there is no enclosing directory. In an authorized itch.io project, select **HTML**, upload the ZIP, and mark it **This file will be played in the browser**. A suggested initial embed size is **1280×900**, with full-screen and mobile-friendly play enabled. Narrow embeds use the compact touch layout.

Published and submitted on 16 November 2026.

- Play: https://nicholas-afk.itch.io/shift-signal
- Public source: https://github.com/Nicholas-afk/shift-signal-game-off-2026
- Event: https://itch.io/jam/game-off-2026

The Game Off site confirmed “Entry submitted to jam.” This records an entry, not an award or selection. The form discloses the AI contribution in all six applicable areas and labels the extent “Almost everything - predominantly AI-generated.”

## Authorship and AI disclosure

**Codex generated the game concept, visual design, code, level-generation tools, documentation and tests under Nicholas Tanner's authorization. This work is not represented as personally coded or hand-illustrated by Nicholas.**

The work was newly created on 16 November 2026. It does not reuse AttoChess or any earlier game. No third-party artwork, fonts, music, sound recordings, game engine, template or code dependency is included. Gameplay shapes and UI were generated as original SVG/CSS, and optional sounds are generated procedurally with the Web Audio API.

Recommended Game Off AI-use disclosure: “Created with Codex assistance: Codex generated the original game concept, visual design, code, levels, documentation and tests under Nicholas Tanner's authorization. No external generated art, music, templates or code libraries were used.” Edit only to reflect any later human or AI contributions accurately.

## License

The code is offered under the MIT license in `LICENSE`. The license does not claim that AI-generated portions necessarily receive copyright protection in every jurisdiction. Preserve the authorship disclosure when presenting how the game was made.

## Verification

Run the offline checks with a current Node.js installation:

```sh
node test-engine.cjs
```

The test has no package dependencies and writes `TEST-RESULTS.txt`. It independently constructs and rotates a matrix rather than merely replaying the production coordinate formula. It proves every level's advertised shortest distance by breadth-first search, verifies hint routes, wrapping, inverse moves, collision avoidance, full cycles and local runtime dependencies.

`generate-levels.cjs` is the development utility that regenerates `levels.js` deterministically. It enumerates candidates and selects the authored difficulty stages. There is no procedural randomness during play.

Logic/static checks passed 3,289 assertions. Browser checks confirmed desktop rendering, a completed first level, shortest-route hints, keyboard moves, undo, saved progress the compact mobile layout and successful hosted itch.io play. Sound is optional and disabled by default; audible output was not independently assessed.
