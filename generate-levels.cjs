// Development utility: derive deterministic level data and shortest solutions.
const fs = require('node:fs');
const C = require('./engine.js');
const specs = [
  { size: 3, goal: [0, 4, 8], depths: [1, 2, 3] },
  { size: 4, goal: [0, 3, 12, 15], depths: [3, 4, 5, 6] },
  { size: 5, goal: [0, 4, 20, 24], depths: [5, 6, 7] }
];
const names = ['First contact', 'Around the edge', 'Shared frequency', 'Crossed wires', 'Countercurrent', 'The long way home', 'Interference', 'Wider horizons', 'Close encounters', 'Perfect alignment'];
const messages = [
  'Every signal has a home. Shift the bottom row right to find the first one.',
  'The edge is a doorway: signals wrap around to the other side.',
  'One shift can move more than one signal. Think about the whole line.',
  'A little more space. Select any cell, then use the arrow keys.',
  'Sometimes a signal has to leave home before everyone can arrive.',
  'A row and a column do not always undo each other. Order matters.',
  'Look for a line that can carry two signals closer at once.',
  'A wider field. Use the empty cells to make room for a better route.',
  'Four signals, one shared space. Find their rhythm.',
  'Bring every frequency into alignment. There is no time limit.'
];
const levels = [];
for (const spec of specs) {
  const all = C.actions(spec.size);
  const queue = [{ state: spec.goal, path: [] }], seen = new Set([C.key(spec.goal)]);
  const selected = new Map();
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    if (spec.depths.includes(node.path.length)) {
      const matched = node.state.filter((p, i) => p === spec.goal[i]).length;
      const prior = selected.get(node.path.length);
      // Prefer spatially distributed starts with no signal already at home.
      const score = matched * 100 + new Set(node.state.map(p => Math.floor(p / spec.size))).size * -2 + node.state.reduce((a, p) => a + p, 0) % 7;
      if (!prior || score < prior.score) selected.set(node.path.length, { ...node, score });
    }
    if (node.path.length >= Math.max(...spec.depths)) continue;
    for (const action of all) {
      const next = C.move(node.state, spec.size, action.axis, action.line, action.direction), k = C.key(next);
      if (seen.has(k)) continue;
      seen.add(k); queue.push({ state: next, path: [...node.path, action] });
    }
  }
  for (const depth of spec.depths) {
    const node = selected.get(depth);
    if (!node) throw new Error(`No ${spec.size}x${spec.size} state at depth ${depth}`);
    const i = levels.length;
    levels.push({ title: names[i], note: messages[i], size: spec.size, goal: spec.goal, start: node.state, par: depth, solution: node.path.map(C.reverse).reverse() });
  }
  console.log(`${spec.size}×${spec.size}: ${seen.size} reachable states, maximum selected distance ${Math.max(...spec.depths)}`);
}
// Keep the first tutorial move direct and predictable.
levels[0].start = C.move(levels[0].goal, 3, 'row', 2, -1);
levels[0].solution = [{ axis: 'row', line: 2, direction: 1 }];
fs.writeFileSync(__dirname + '/levels.js', '/* Authored layouts with search-verified shortest paths. */\nwindow.ShiftLevels = ' + JSON.stringify(levels, null, 2) + ';\n');
console.log(`Wrote ${levels.length} levels.`);
