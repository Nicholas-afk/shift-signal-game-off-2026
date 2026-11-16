/* Offline regression checks. No browser, network, or third-party packages. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const C = require('./engine.js');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(__dirname + '/levels.js', 'utf8'), sandbox);
const levels = JSON.parse(JSON.stringify(sandbox.window.ShiftLevels));

// Independent oracle: expand to a matrix, rotate its actual cell contents,
// and locate each signal again. This does not use engine coordinate arithmetic.
function matrixMove(state, n, action) {
  const board = Array.from({ length: n }, () => Array(n).fill(-1));
  state.forEach((p, i) => { board[Math.floor(p / n)][p % n] = i; });
  const line = action.axis === 'row' ? board[action.line].slice() : board.map(row => row[action.line]);
  if (action.direction === 1) line.unshift(line.pop()); else line.push(line.shift());
  if (action.axis === 'row') board[action.line] = line;
  else board.forEach((row, i) => { row[action.line] = line[i]; });
  const next = Array(state.length);
  board.forEach((row, r) => row.forEach((signal, c) => { if (signal !== -1) next[signal] = r * n + c; }));
  return next;
}
function oracleDistance(start, goal, n, limit) {
  const key = state => state.join('.'), visited = new Set([key(start)]), queue = [{ state: start, depth: 0 }];
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    if (key(current.state) === key(goal)) return { distance: current.depth, states: visited.size };
    if (current.depth >= limit) continue;
    for (const action of C.actions(n)) {
      const next = matrixMove(current.state, n, action), k = key(next);
      if (!visited.has(k)) { visited.add(k); queue.push({ state: next, depth: current.depth + 1 }); }
    }
  }
  return { distance: null, states: visited.size };
}
let assertions = 0;
function check(condition, message) { assert.ok(condition, message); assertions++; }
const report = [];
for (const [index, level] of levels.entries()) {
  check(new Set(level.start).size === level.start.length, 'Distinct start signals');
  check(new Set(level.goal).size === level.goal.length, 'Distinct homes');
  check(!C.equal(level.start, level.goal), 'Not already solved');
  let replay = [...level.start];
  for (const action of level.solution) replay = matrixMove(replay, level.size, action);
  check(C.equal(replay, level.goal), `Independent solution replay for level ${index + 1}`);
  check(level.solution.length === level.par, 'Solution has advertised par');
  const proof = oracleDistance(level.start, level.goal, level.size, level.par);
  check(proof.distance === level.par, `Independent BFS shortest distance for level ${index + 1}`);
  const hintRoute = C.solve(level.start, level.goal, level.size);
  check(hintRoute && hintRoute.length === proof.distance, 'In-game hint search agrees with independent BFS');
  // Check every permitted operation and its inverse for several states.
  for (const state of [level.start, level.goal, ...level.solution.slice(0, 2).map(a => C.move(level.start, level.size, a.axis, a.line, a.direction))]) {
    for (const action of C.actions(level.size)) {
      const shifted = C.move(state, level.size, action.axis, action.line, action.direction);
      check(C.equal(shifted, matrixMove(state, level.size, action)), 'Engine matches matrix oracle');
      check(new Set(shifted).size === state.length, 'Shifts never collide');
      check(shifted.every(p => p >= 0 && p < level.size ** 2), 'Shifts stay in bounds');
      check(C.equal(C.move(shifted, level.size, action.axis, action.line, -action.direction), state), 'Undo restores exact prior state');
      let cycled = [...state];
      for (let k = 0; k < level.size; k++) cycled = C.move(cycled, level.size, action.axis, action.line, action.direction);
      check(C.equal(cycled, state), 'A full cyclic shift restores the state');
    }
  }
  report.push(`Level ${String(index + 1).padStart(2, '0')} | ${level.size}x${level.size} | shortest ${proof.distance} | independent BFS ${proof.states} states | PASS`);
}
// Deliberate wraparound examples and illegal input checks.
assert.deepEqual(C.move([0, 1, 8], 3, 'row', 0, -1), [2, 0, 8]); assertions++;
assert.deepEqual(C.move([0, 1, 8], 3, 'col', 0, -1), [6, 1, 8]); assertions++;
assert.throws(() => C.move([0], 3, 'row', -1, 1)); assertions++;
assert.throws(() => C.move([0], 3, 'row', 0, 0)); assertions++;
check(C.solve([0], [0], 3).length === 0, 'Solved-state hint terminates');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const game = fs.readFileSync(__dirname + '/game.js', 'utf8');
const css = fs.readFileSync(__dirname + '/style.css', 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]));
for (const match of game.matchAll(/\$\('([^']+)'\)/g)) check(ids.has(match[1]), `DOM target exists: ${match[1]}`);
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) check(fs.existsSync(__dirname + '/' + match[1]), `Local dependency exists: ${match[1]}`);
check(!/https?:\/\//.test(html + css + game), 'Runtime assets and code contain no remote URLs');
check(css.includes('prefers-reduced-motion'), 'Reduced motion supplied');
check(html.includes('aria-live="polite"'), 'Live announcements supplied');
check(html.includes('AI disclosure:'), 'Visible honest AI disclosure supplied');

const result = `SHIFT SIGNAL — OFFLINE VERIFICATION\n${new Date().toISOString()}\n\n${report.join('\n')}\n\n${assertions} assertions passed.\nIndependent matrix rotation checks cover row/column shifts, wrapping, collision avoidance, inverse moves and full cycles.\nEvery advertised par is proven by independent breadth-first search.\nIn-game hint paths agree with the independent shortest distances.\nStatic DOM targets and local runtime assets verified; no remote runtime URLs.\n\nScope: executable logic and static checks only. No browser or visual acceptance was performed.\n`;
console.log(result);
fs.writeFileSync(__dirname + '/TEST-RESULTS.txt', result);
