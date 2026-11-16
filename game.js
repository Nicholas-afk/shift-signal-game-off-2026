/* Original interaction, rendering and procedural audio. See README for AI disclosure. */
(() => {
  'use strict';
  const C = window.ShiftCore, levels = window.ShiftLevels;
  const $ = id => document.getElementById(id);
  const shapes = [
    { name: 'Circle', color: 'var(--coral)', svg: '<circle cx="12" cy="12" r="8.3"/>' },
    { name: 'Triangle', color: 'var(--teal)', svg: '<path d="M12 3.5 21.2 20H2.8Z"/>' },
    { name: 'Square', color: 'var(--gold)', svg: '<rect x="4" y="4" width="16" height="16" rx="1.5"/>' },
    { name: 'Diamond', color: 'var(--silver)', svg: '<path d="m12 2 10 10-10 10L2 12Z"/>' }
  ];
  const svg = i => `<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">${shapes[i].svg}</svg>`;
  const storageKey = 'shift-signal-progress-v1';
  let progress = { best: {}, last: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved.best === 'object' && saved.best && Number.isInteger(saved.last)) progress = saved;
  } catch (_) { /* Progress is optional when storage is unavailable. */ }
  let levelIndex = Math.min(Math.max(progress.last, 0), levels.length - 1);
  let state, history = [], selected = 0, busy = false, won = false, hintUsed = false, soundEnabled = false, audio;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function save() { try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch (_) {} }
  function announce(message) { $('announcement').textContent = message; }
  function tone(frequency, duration, start = 0, volume = .025) {
    if (!soundEnabled) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const oscillator = audio.createOscillator(), gain = audio.createGain(), at = audio.currentTime + start;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(volume, at + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(at); oscillator.stop(at + duration + .02);
    } catch (_) { soundEnabled = false; syncSound(); }
  }
  function syncSound() { $('sound-toggle').setAttribute('aria-pressed', String(soundEnabled)); $('sound-state').textContent = soundEnabled ? 'on' : 'off'; }
  function makeEdge(axis, line, direction) {
    const button = document.createElement('button');
    button.className = 'edge-arrow'; button.dataset.axis = axis; button.dataset.line = line; button.dataset.direction = direction;
    button.setAttribute('aria-label', `Shift ${C.describe({ axis, line, direction }).toLowerCase()}`);
    button.title = button.getAttribute('aria-label');
    if (axis === 'row') {
      button.style.gridRow = line + 2; button.style.gridColumn = direction < 0 ? 1 : levels[levelIndex].size + 2;
      button.innerHTML = direction < 0 ? `←<small>${line + 1}</small>` : `<small>${line + 1}</small>→`;
    } else {
      button.style.gridColumn = line + 2; button.style.gridRow = direction < 0 ? 1 : levels[levelIndex].size + 2;
      button.innerHTML = direction < 0 ? '↑' : '↓';
    }
    button.addEventListener('click', () => shift({ axis, line, direction }));
    return button;
  }
  function setupBoard() {
    const level = levels[levelIndex], n = level.size;
    $('control-grid').style.setProperty('--n', n);
    $('control-grid').querySelectorAll('.edge-arrow').forEach(el => el.remove());
    for (let line = 0; line < n; line++) for (const axis of ['row', 'col']) for (const direction of [-1, 1]) $('control-grid').append(makeEdge(axis, line, direction));
    $('tiles').replaceChildren(); $('signals').replaceChildren();
    for (let cell = 0; cell < n * n; cell++) {
      const button = document.createElement('button'); button.className = 'cell'; button.dataset.cell = cell;
      button.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown');
      const target = level.goal.indexOf(cell);
      if (target !== -1) button.innerHTML = `<span class="target" style="color:${shapes[target].color}">${svg(target)}</span>`;
      button.addEventListener('click', () => select(cell));
      button.addEventListener('focus', () => select(cell));
      $('tiles').append(button);
    }
    state.forEach((_, i) => { const token = document.createElement('div'); token.className = 'signal'; token.dataset.signal = i; token.style.color = shapes[i].color; token.innerHTML = svg(i); $('signals').append(token); });
    $('signal-key').innerHTML = shapes.slice(0, state.length).map((s, i) => `<span class="key-item"><span class="key-icon">${svg(i)}</span>${s.name}</span>`).join('');
  }
  function select(cell, focus = false) {
    selected = cell;
    const n = levels[levelIndex].size;
    $('mobile-selection').textContent = `ROW ${Math.floor(selected / n) + 1} · COLUMN ${selected % n + 1}`;
    $('tiles').querySelectorAll('.cell').forEach((el, i) => {
      el.classList.toggle('selected', i === selected);
      el.tabIndex = i === selected ? 0 : -1;
      if (focus && i === selected) el.focus({ preventScroll: true });
    });
    $('control-grid').querySelectorAll('.edge-arrow').forEach(el => {
      const line = Number(el.dataset.line);
      el.classList.toggle('highlight', el.dataset.axis === 'row' ? Math.floor(selected / n) === line : selected % n === line);
    });
  }
  function draw() {
    const level = levels[levelIndex], n = level.size;
    let matched = 0;
    $('tiles').querySelectorAll('.cell').forEach((el, cell) => {
      const target = level.goal.indexOf(cell), signal = state.indexOf(cell);
      const home = target !== -1 && signal === target;
      el.classList.toggle('home', home);
      el.setAttribute('aria-label', `Row ${Math.floor(cell / n) + 1}, column ${cell % n + 1}. ${signal !== -1 ? shapes[signal].name + ' signal.' : 'Empty.'}${target !== -1 ? ' ' + shapes[target].name + ' home.' : ''}${home ? ' Matched.' : ''}`);
    });
    $('signals').querySelectorAll('.signal:not(.ghost)').forEach((el, i) => {
      const home = state[i] === level.goal[i];
      el.style.left = ((state[i] % n + .5) / n * 100) + '%';
      el.style.top = ((Math.floor(state[i] / n) + .5) / n * 100) + '%';
      el.classList.toggle('home', home); if (home) matched++;
    });
    $('move-count').textContent = String(history.length).padStart(2, '0');
    $('matched-label').textContent = `${matched} of ${state.length} signals home`;
    $('connection-dots').innerHTML = state.map((p, i) => `<i class="${p === level.goal[i] ? 'home' : ''}"></i>`).join('');
    $('undo-button').disabled = !history.length || busy;
    $('reset-button').disabled = busy;
    $('hint-button').disabled = busy || won;
    $('board').classList.toggle('solved', won);
    $('control-grid').querySelectorAll('.edge-arrow').forEach(el => { el.disabled = busy || won; });
    document.querySelectorAll('[data-mobile-shift]').forEach(el => { el.disabled = busy || won; });
    select(selected);
  }
  function loadLevel(index, focusBoard = false) {
    if (busy) return;
    levelIndex = index; progress.last = index; save();
    const level = levels[index]; state = [...level.start]; history = []; selected = index === 0 ? level.start[2] : Math.floor(level.size / 2) * level.size + Math.floor(level.size / 2); won = false; hintUsed = false;
    $('level-number').textContent = `FREQUENCY ${String(index + 1).padStart(2, '0')} / ${levels.length}`;
    $('level-title').textContent = level.title; $('level-note').textContent = level.note; $('note-label').textContent = 'FIELD NOTE';
    $('completion').hidden = true; $('note-box').hidden = false;
    setupBoard(); draw(); updateProgress();
    if (focusBoard) select(selected, true);
    announce(`Frequency ${index + 1}: ${level.title}. ${level.note}`);
  }
  function animateShift(oldState, action) {
    if (reduceMotion.matches || !Element.prototype.animate) return Promise.resolve();
    const n = levels[levelIndex].size, length = $('signals').getBoundingClientRect().width / n;
    const coordinate = action.axis === 'row' ? 'X' : 'Y';
    const promises = [];
    oldState.forEach((position, i) => {
      if (position === state[i]) return;
      const token = $('signals').querySelector(`[data-signal="${i}"]`);
      const row = Math.floor(position / n), col = position % n;
      const wrapped = action.axis === 'row' ? Math.abs(position % n - state[i] % n) > 1 : Math.abs(row - Math.floor(state[i] / n)) > 1;
      if (wrapped) {
        const ghost = token.cloneNode(true); ghost.classList.add('ghost'); ghost.removeAttribute('data-signal');
        ghost.style.left = ((col + .5) / n * 100) + '%'; ghost.style.top = ((row + .5) / n * 100) + '%'; $('signals').append(ghost);
        const a = ghost.animate([{ transform: 'translate(-50%,-50%)' }, { transform: `translate(-50%,-50%) translate${coordinate}(${action.direction * length}px)` }], { duration: 190, easing: 'cubic-bezier(.22,.7,.2,1)' });
        a.finished.catch(() => {}).then(() => ghost.remove());
      }
      const animation = token.animate([{ transform: `translate(-50%,-50%) translate${coordinate}(${-action.direction * length}px)` }, { transform: 'translate(-50%,-50%)' }], { duration: 190, easing: 'cubic-bezier(.22,.7,.2,1)' });
      promises.push(animation.finished.catch(() => {}));
    });
    return Promise.all(promises);
  }
  async function shift(action) {
    if (busy || won) return;
    const old = [...state], next = C.move(state, levels[levelIndex].size, action.axis, action.line, action.direction);
    if (C.equal(old, next)) { announce('That line has no signals. Try another row or column.'); return; }
    history.push(old); state = next; busy = true; draw();
    tone(action.axis === 'row' ? 220 : 277, .09, 0, .018);
    await animateShift(old, action); busy = false;
    if (C.equal(state, levels[levelIndex].goal)) complete();
    else announce(`${C.describe(action)}. ${$('matched-label').textContent}. ${history.length} ${history.length === 1 ? 'shift' : 'shifts'}.`);
    draw();
  }
  function complete() {
    won = true;
    const previousBest = progress.best[levelIndex];
    progress.best[levelIndex] = Math.min(typeof previousBest === 'number' ? previousBest : Infinity, history.length); save(); updateProgress();
    const last = levelIndex === levels.length - 1;
    $('completion-title').textContent = last ? 'Transmission complete.' : 'All signals home.';
    const par = levels[levelIndex].par;
    $('completion-copy').textContent = `${history.length} ${history.length === 1 ? 'shift' : 'shifts'}${history.length === par ? ' · Perfect alignment.' : ` · A shortest route takes ${par}.`}${hintUsed ? ' Hint used.' : ''}`;
    $('next-button').innerHTML = last ? 'Choose a frequency <span aria-hidden="true">↗</span>' : 'Next frequency <span aria-hidden="true">→</span>';
    $('completion').hidden = false; $('note-box').hidden = true;
    $('completion').classList.remove('finish-flash'); void $('completion').offsetWidth; $('completion').classList.add('finish-flash');
    [330, 440, 554.37, 659.25].forEach((f, i) => tone(f, .36, i * .07, .018));
    announce(`${$('completion-title').textContent} ${$('completion-copy').textContent} ${last ? 'All ten frequencies are available to replay.' : 'Use Next frequency to continue.'}`);
  }
  function updateProgress() { $('level-progress').textContent = `${Object.keys(progress.best).filter(k => Number(k) >= 0 && Number(k) < levels.length).length} / ${levels.length}`; }
  function openDialog(id) {
    if (id === 'levels-dialog') {
      $('level-list').replaceChildren();
      levels.forEach((level, i) => {
        const button = document.createElement('button'), best = progress.best[i];
        button.className = 'level-choice' + (i === levelIndex ? ' current' : '');
        button.innerHTML = `<span class="level-choice-number">${String(i + 1).padStart(2, '0')}<span class="check">${typeof best === 'number' ? '✓' : ''}</span></span><strong>${level.title}</strong><small>${level.size} × ${level.size} · ${typeof best === 'number' ? 'Best: ' + best + (best === 1 ? ' shift' : ' shifts') : 'Not yet connected'}</small>`;
        button.addEventListener('click', () => { if (busy) return; $('levels-dialog').close(); loadLevel(i, true); });
        $('level-list').append(button);
      });
    }
    $(id).showModal();
  }
  $('undo-button').addEventListener('click', undo);
  function undo() {
    if (busy || !history.length) return;
    state = history.pop(); won = false; $('completion').hidden = true; $('note-box').hidden = false; $('level-note').textContent = levels[levelIndex].note; $('note-label').textContent = 'FIELD NOTE'; draw();
    tone(180, .1); announce(`Undone. ${history.length} ${history.length === 1 ? 'shift' : 'shifts'}. ${$('matched-label').textContent}.`);
  }
  $('reset-button').addEventListener('click', () => loadLevel(levelIndex, true));
  $('hint-button').addEventListener('click', () => {
    if (busy || won) return;
    $('hint-button').textContent = 'Finding a route…'; busy = true; draw();
    // Yield once so the thinking state can paint before the finite search.
    setTimeout(() => {
      const route = C.solve(state, levels[levelIndex].goal, levels[levelIndex].size);
      busy = false; hintUsed = true; $('hint-button').innerHTML = '<span aria-hidden="true">◇</span> A small hint';
      $('note-label').textContent = 'A SMALL HINT';
      $('level-note').textContent = route && route.length ? `${C.describe(route[0])}. One shift at a time — a shortest route from here takes ${route.length}.` : 'Reset this frequency to return to a verified starting route.';
      announce($('level-note').textContent); draw();
    }, 30);
  });
  $('next-button').addEventListener('click', () => levelIndex < levels.length - 1 ? loadLevel(levelIndex + 1, true) : openDialog('levels-dialog'));
  $('help-open').addEventListener('click', () => openDialog('help-dialog'));
  $('levels-open').addEventListener('click', () => openDialog('levels-dialog'));
  $('credits-open').addEventListener('click', () => openDialog('credits-dialog'));
  $('sound-toggle').addEventListener('click', () => { soundEnabled = !soundEnabled; syncSound(); if (soundEnabled) tone(440, .16); });
  document.querySelectorAll('[data-mobile-shift]').forEach(button => button.addEventListener('click', () => {
    const direction = button.dataset.mobileShift, n = levels[levelIndex].size, horizontal = direction === 'left' || direction === 'right';
    shift({ axis: horizontal ? 'row' : 'col', line: horizontal ? Math.floor(selected / n) : selected % n, direction: direction === 'left' || direction === 'up' ? -1 : 1 });
  }));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } }));
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]')) return;
    const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (arrows.includes(event.key)) {
      // Leave native arrow behavior intact outside the board and its controls.
      if (!event.target.closest('#control-grid')) return;
      event.preventDefault();
      if (busy) return;
      const n = levels[levelIndex].size, row = Math.floor(selected / n), col = selected % n;
      if (event.shiftKey) {
        const nextRow = (row + (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0) + n) % n;
        const nextCol = (col + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0) + n) % n;
        select(nextRow * n + nextCol, true);
      } else shift({ axis: event.key === 'ArrowLeft' || event.key === 'ArrowRight' ? 'row' : 'col', line: event.key === 'ArrowLeft' || event.key === 'ArrowRight' ? row : col, direction: event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1 });
    } else if (event.key.toLowerCase() === 'z' && !event.repeat) { event.preventDefault(); undo(); }
    else if (event.key.toLowerCase() === 'r' && !event.repeat) { event.preventDefault(); loadLevel(levelIndex, true); }
  });
  loadLevel(levelIndex);
})();
