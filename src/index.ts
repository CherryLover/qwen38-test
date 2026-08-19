import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>导航</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a2e;
      color: #fff;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      font-weight: 300;
    }
    .nav-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      justify-content: center;
      padding: 0 2rem;
    }
    .nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 140px;
      height: 80px;
      border-radius: 12px;
      background: #16213e;
      border: 1px solid #0f3460;
      color: #e0e0e0;
      font-size: 1.1rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: #0f3460;
      border-color: #e94560;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <h1>导航</h1>
  <div class="nav-grid">
    <a class="nav-btn" href="/2048" target="_blank">2048</a>
  </div>
</body>
</html>`)
})

app.get('/2048', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>2048</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a2e;
      color: #fff;
      touch-action: none;
      overflow: hidden;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 500px;
      padding: 1rem;
    }

    .header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #e94560;
    }

    .scores {
      display: flex;
      gap: 0.5rem;
    }

    .score-box {
      background: #16213e;
      border: 1px solid #0f3460;
      border-radius: 8px;
      padding: 0.4rem 0.8rem;
      text-align: center;
      min-width: 70px;
    }

    .score-label {
      font-size: 0.65rem;
      color: #888;
      text-transform: uppercase;
    }

    .score-value {
      font-size: 1.2rem;
      font-weight: 700;
    }

    .controls {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-restart {
      background: #e94560;
      color: #fff;
    }

    .btn-restart:hover {
      background: #d63851;
      transform: translateY(-1px);
    }

    .btn-history {
      background: #0f3460;
      color: #ccc;
    }

    .btn-history:hover {
      background: #1a5277;
      transform: translateY(-1px);
    }

    .game-board {
      position: relative;
      width: min(90vw, 420px);
      height: min(90vw, 420px);
      background: #16213e;
      border-radius: 12px;
      padding: 8px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 8px;
      width: 100%;
      height: 100%;
    }

    .cell {
      background: #0f3460;
      border-radius: 6px;
    }

    .tiles {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      pointer-events: none;
    }

    .tile {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    /* Desktop: larger fonts */
    @media (min-width: 768px) {
      .container {
        padding: 2rem;
      }
      .title {
        font-size: 3rem;
      }
      .game-board {
        width: 460px;
        height: 460px;
      }
    }

    /* Mobile: compact */
    @media (max-width: 480px) {
      .title {
        font-size: 1.8rem;
      }
      .score-box {
        padding: 0.3rem 0.6rem;
        min-width: 58px;
      }
      .score-value {
        font-size: 1rem;
      }
      .btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.78rem;
      }
    }

    /* Overlay for game over / win */
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(26, 26, 46, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      z-index: 10;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }

    .overlay.show {
      opacity: 1;
      pointer-events: all;
    }

    .overlay-text {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .overlay .btn {
      font-size: 1rem;
      padding: 0.7rem 1.5rem;
    }

    /* History modal */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }

    .modal.show {
      opacity: 1;
      pointer-events: all;
    }

    .modal-content {
      background: #16213e;
      border: 1px solid #0f3460;
      border-radius: 12px;
      padding: 1.5rem;
      width: 90%;
      max-width: 400px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .modal-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-close {
      background: none;
      border: none;
      color: #888;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .history-item {
      padding: 0.6rem 0;
      border-bottom: 1px solid #0f3460;
      font-size: 0.85rem;
      color: #ccc;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-date {
      color: #888;
      font-size: 0.75rem;
    }

    .history-score {
      color: #e94560;
      font-weight: 700;
    }

    .clear-history {
      width: 100%;
      margin-top: 1rem;
      background: none;
      border: 1px solid #e94560;
      color: #e94560;
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .clear-history:hover {
      background: rgba(233, 69, 96, 0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">2048</div>
      <div class="scores">
        <div class="score-box">
          <div class="score-label">分数</div>
          <div class="score-value" id="score">0</div>
        </div>
        <div class="score-box">
          <div class="score-label">最高</div>
          <div class="score-value" id="best">0</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <button class="btn btn-restart" onclick="restartGame()">重新开始</button>
      <button class="btn btn-history" onclick="showHistory()">历史记录</button>
    </div>

    <div class="game-board" id="board">
      <div class="grid">
        <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
        <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
        <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
        <div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>
      </div>
      <div class="tiles" id="tiles"></div>
      <div class="overlay" id="overlay">
        <div class="overlay-text" id="overlayText"></div>
        <button class="btn btn-restart" onclick="restartGame()">再来一局</button>
      </div>
    </div>
  </div>

  <div class="modal" id="historyModal">
    <div class="modal-content">
      <div class="modal-title">
        游戏记录
        <button class="modal-close" onclick="closeHistory()">&times;</button>
      </div>
      <div id="historyList"></div>
      <button class="clear-history" onclick="clearHistory()">清空记录</button>
    </div>
  </div>

<script>
const SIZE = 4;
let grid = [];
let score = 0;
let best = parseInt(localStorage.getItem('2048_best') || '0');
let moves = 0;
let gameOver = false;
let won = false;
let history = JSON.parse(localStorage.getItem('2048_history') || '[]');
let tileId = 0;
let tileElements = {};

const COLORS = {
  2:    { bg: '#eee4da', color: '#776e65' },
  4:    { bg: '#ede0c8', color: '#776e65' },
  8:    { bg: '#f2b179', color: '#f9f6f2' },
  16:   { bg: '#f59563', color: '#f9f6f2' },
  32:   { bg: '#f67c5f', color: '#f9f6f2' },
  64:   { bg: '#f65e3b', color: '#f9f6f2' },
  128:  { bg: '#edcf72', color: '#f9f6f2' },
  256:  { bg: '#edcc61', color: '#f9f6f2' },
  512:  { bg: '#edc850', color: '#f9f6f2' },
  1024: { bg: '#edc22e', color: '#f9f6f2' },
  2048: { bg: '#edc22e', color: '#f9f6f2' },
};

function getTileStyle(value) {
  if (value <= 2048) return COLORS[value];
  return { bg: '#3c3a32', color: '#f9f6f2' };
}

function getFontSize(value, cellSize) {
  const digits = String(value).length;
  if (digits <= 2) return cellSize * 0.45;
  if (digits === 3) return cellSize * 0.38;
  if (digits === 4) return cellSize * 0.30;
  return cellSize * 0.24;
}

function getCellMetrics() {
  const board = document.getElementById('board');
  const boardSize = board.clientWidth - 16; // minus padding
  const gap = 8;
  const cellSize = (boardSize - gap * 3) / SIZE;
  return { cellSize, gap };
}

function init() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  score = 0;
  moves = 0;
  gameOver = false;
  won = false;
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('score').textContent = '0';
  document.getElementById('best').textContent = best;
  addRandomTile();
  addRandomTile();
  render();
}

function addRandomTile() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let col = 0; col < SIZE; col++)
      if (!grid[r][col]) empty.push([r, col]);
  if (empty.length === 0) return;
  const [r, col] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  grid[r][col] = { value, id: tileId++, isNew: true };
}

function render() {
  const { cellSize, gap } = getCellMetrics();
  const container = document.getElementById('tiles');
  container.innerHTML = '';
  tileElements = {};

  for (let r = 0; r < SIZE; r++) {
    for (let col = 0; col < SIZE; col++) {
      const tile = grid[r][col];
      if (!tile) continue;
      const el = document.createElement('div');
      el.className = 'tile';
      const style = getTileStyle(tile.value);
      el.style.width = cellSize + 'px';
      el.style.height = cellSize + 'px';
      el.style.left = col * (cellSize + gap) + 'px';
      el.style.top = r * (cellSize + gap) + 'px';
      el.style.background = style.bg;
      el.style.color = style.color;
      el.style.fontSize = getFontSize(tile.value, cellSize) + 'px';
      el.textContent = tile.value;
      if (tile.isNew) {
        el.style.transform = 'scale(0)';
        requestAnimationFrame(() => {
          el.style.transform = 'scale(1)';
        });
      }
      container.appendChild(el);
      tileElements[tile.id] = el;
      tile.isNew = false;
    }
  }
}

function move(direction) {
  if (gameOver) return;
  const oldGrid = JSON.stringify(grid.map(row => row.map(t => t ? t.value : 0)));
  let moved = false;
  let gained = 0;

  const lines = getLines(direction);

  for (const line of lines) {
    const values = line.filter(t => t !== null).map(t => t.value);
    const merged = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1]) {
        merged.push(values[i] * 2);
        gained += values[i] * 2;
        i++;
      } else {
        merged.push(values[i]);
      }
    }
    while (merged.length < SIZE) merged.push(0);

    for (let i = 0; i < SIZE; i++) {
      const cell = line[i];
      const newVal = merged[i];
      if (cell && cell.value !== newVal) {
        cell.value = newVal;
        moved = true;
      } else if (!cell && newVal > 0) {
        line[i] = { value: newVal, id: tileId++, isNew: false };
        moved = true;
      } else if (cell && newVal === 0) {
        line[i] = null;
      }
    }
  }

  if (moved) {
    score += gained;
    moves++;
    if (score > best) {
      best = score;
      localStorage.setItem('2048_best', String(best));
    }
    document.getElementById('score').textContent = score;
    document.getElementById('best').textContent = best;
    addRandomTile();
    render();
    checkState();
  }
}

function getLines(dir) {
  const lines = [];
  for (let i = 0; i < SIZE; i++) {
    const line = [];
    if (dir === 'left') {
      for (let j = 0; j < SIZE; j++) line.push(grid[i][j]);
    } else if (dir === 'right') {
      for (let j = SIZE - 1; j >= 0; j--) line.push(grid[i][j]);
    } else if (dir === 'up') {
      for (let j = 0; j < SIZE; j++) line.push(grid[j][i]);
    } else if (dir === 'down') {
      for (let j = SIZE - 1; j >= 0; j--) line.push(grid[j][i]);
    }
    lines.push(line);
  }
  return lines;
}

function checkState() {
  // Check win
  if (!won) {
    for (let r = 0; r < SIZE; r++)
      for (let col = 0; col < SIZE; col++)
        if (grid[r][col] && grid[r][col].value === 2048) {
          won = true;
          showOverlay('🎉 你赢了！');
          saveHistory();
          return;
        }
  }

  // Check game over
  for (let r = 0; r < SIZE; r++) {
    for (let col = 0; col < SIZE; col++) {
      if (!grid[r][col]) return;
      if (col < SIZE - 1 && grid[r][col].value === grid[r][col + 1].value) return;
      if (r < SIZE - 1 && grid[r][col].value === grid[r + 1][col].value) return;
    }
  }
  gameOver = true;
  showOverlay('游戏结束');
  saveHistory();
}

function showOverlay(text) {
  document.getElementById('overlayText').textContent = text;
  document.getElementById('overlay').classList.add('show');
}

function restartGame() {
  init();
}

// History
function saveHistory() {
  const entry = {
    date: new Date().toLocaleString('zh-CN'),
    score: score,
    moves: moves,
  };
  history.unshift(entry);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('2048_history', JSON.stringify(history));
}

function showHistory() {
  const list = document.getElementById('historyList');
  if (history.length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:1rem;">暂无记录</div>';
  } else {
    list.innerHTML = history.map((h, i) =>
      \`<div class="history-item">
        <div style="display:flex;justify-content:space-between;">
          <span class="history-score">\${h.score} 分</span>
          <span>\${h.moves} 步</span>
        </div>
        <div class="history-date">\${h.date}</div>
      </div>\`
    ).join('');
  }
  document.getElementById('historyModal').classList.add('show');
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('show');
}

function clearHistory() {
  history = [];
  localStorage.removeItem('2048_history');
  showHistory();
}

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); move('left'); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); move('right'); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move('up'); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); move('down'); }
  else if (e.key === 'r' || e.key === 'R') { restartGame(); }
});

// Touch / Swipe
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (Math.max(absDx, absDy) < 30) return; // too short

  if (absDx > absDy) {
    move(dx > 0 ? 'right' : 'left');
  } else {
    move(dy > 0 ? 'down' : 'up');
  }
});

// Resize
window.addEventListener('resize', () => { render(); });

// Click outside modal to close
document.getElementById('historyModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('historyModal')) closeHistory();
});

// Init
init();
</script>
</body>
</html>`)
})

export default app
