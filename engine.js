/* Shift Signal — original game logic. MIT license; see LICENSE. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ShiftCore = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  // A state stores the distinct signals' cell positions, in signal order.
  function move(state, size, axis, line, direction) {
    if (!Number.isInteger(size) || size < 2 || !['row', 'col'].includes(axis) ||
        !Number.isInteger(line) || line < 0 || line >= size || ![-1, 1].includes(direction)) {
      throw new Error('Invalid shift');
    }
    return state.map(position => {
      const row = Math.floor(position / size), col = position % size;
      if (axis === 'row' && row === line) return row * size + (col + direction + size) % size;
      if (axis === 'col' && col === line) return ((row + direction + size) % size) * size + col;
      return position;
    });
  }
  function actions(size) {
    const result = [];
    for (let line = 0; line < size; line++) for (const axis of ['row', 'col']) {
      for (const direction of [-1, 1]) result.push({ axis, line, direction });
    }
    return result;
  }
  function equal(a, b) { return a.length === b.length && a.every((v, i) => v === b[i]); }
  function key(state) { return state.join(','); }
  function reverse(action) { return { ...action, direction: -action.direction }; }
  function describe(action) {
    return `${action.axis === 'row' ? 'Row' : 'Column'} ${action.line + 1} ${action.axis === 'row' ? (action.direction < 0 ? 'left' : 'right') : (action.direction < 0 ? 'up' : 'down')}`;
  }
  // Breadth-first search proves shortest paths, rather than only checking a scramble.
  function solve(start, goal, size, maxStates = 400000) {
    if (equal(start, goal)) return [];
    const possibilities = actions(size), visited = new Map([[key(start), null]]);
    const queue = [{ state: start, previous: -1, action: null }];
    for (let head = 0; head < queue.length; head++) {
      for (const action of possibilities) {
        const next = move(queue[head].state, size, action.axis, action.line, action.direction);
        const nextKey = key(next);
        if (visited.has(nextKey)) continue;
        const index = queue.length;
        queue.push({ state: next, previous: head, action });
        visited.set(nextKey, index);
        if (equal(next, goal)) {
          const path = [];
          for (let at = index; queue[at].previous !== -1; at = queue[at].previous) path.push(queue[at].action);
          return path.reverse();
        }
        if (visited.size >= maxStates) return null;
      }
    }
    return null;
  }
  return { move, actions, equal, key, reverse, describe, solve };
});
