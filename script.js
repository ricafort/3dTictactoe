// ============================================================
// 3D Tic-Tac-Toe — Full Game Logic
// Board: 3×3×3 = 27 cells, indexed as z*9 + y*3 + x
// Winning lines: 49 total (rows + columns + pillars + face diags + space diags)
// ============================================================

(function() {
  // --- Constants ---
  var SIZE = 3;
  var TOTAL_CELLS = SIZE * SIZE * SIZE; // 27
  var PLAYER_X = 'X';
  var PLAYER_O = 'O'; // AI

  // --- Game State ---
  var board = new Array(TOTAL_CELLS).fill('');
  var currentPlayer = PLAYER_X;
  var isGameActive = true;
  var winningLines = [];
  var selectedDifficulty = 'medium';

  // --- DOM References (populated on init) ---
  var statusDisplay, resetButton, difficultySelect, cubeElement;
  var rotateXSlider, rotateYSlider;

  // ============================================================
  // INDEXING HELPERS
  // ============================================================

  function xyzToIndex(x, y, z) {
    return z * SIZE * SIZE + y * SIZE + x;
  }

  function indexToXYZ(index) {
    var z = Math.floor(index / (SIZE * SIZE));
    var remainder = index % (SIZE * SIZE);
    var y = Math.floor(remainder / SIZE);
    var x = remainder % SIZE;
    return { x: x, y: y, z: z };
  }

  // ============================================================
  // WINNING LINES GENERATION (49 total)
  // ============================================================

  function generateWinningLines() {
    var lines = [];

    // --- Rows (along X axis): fixed y, fixed z, varying x → 3×3 = 9 ---
    for (var z = 0; z < SIZE; z++) {
      for (var y = 0; y < SIZE; y++) {
        lines.push([
          xyzToIndex(0, y, z),
          xyzToIndex(1, y, z),
          xyzToIndex(2, y, z)
        ]);
      }
    }

    // --- Columns (along Y axis): fixed x, fixed z, varying y → 3×3 = 9 ---
    for (var z = 0; z < SIZE; z++) {
      for (var x = 0; x < SIZE; x++) {
        lines.push([
          xyzToIndex(x, 0, z),
          xyzToIndex(x, 1, z),
          xyzToIndex(x, 2, z)
        ]);
      }
    }

    // --- Pillars (along Z axis): fixed x, fixed y, varying z → 3×3 = 9 ---
    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        lines.push([
          xyzToIndex(x, y, 0),
          xyzToIndex(x, y, 1),
          xyzToIndex(x, y, 2)
        ]);
      }
    }

    // --- Face Diagonals in XY planes (fixed z): 2 per layer × 3 = 6 ---
    for (var z = 0; z < SIZE; z++) {
      lines.push([
        xyzToIndex(0, 0, z),
        xyzToIndex(1, 1, z),
        xyzToIndex(2, 2, z)
      ]);
      lines.push([
        xyzToIndex(0, 2, z),
        xyzToIndex(1, 1, z),
        xyzToIndex(2, 0, z)
      ]);
    }

    // --- Face Diagonals in XZ planes (fixed y): 2 per slice × 3 = 6 ---
    for (var y = 0; y < SIZE; y++) {
      lines.push([
        xyzToIndex(0, y, 0),
        xyzToIndex(1, y, 1),
        xyzToIndex(2, y, 2)
      ]);
      lines.push([
        xyzToIndex(0, y, 2),
        xyzToIndex(1, y, 1),
        xyzToIndex(2, y, 0)
      ]);
    }

    // --- Face Diagonals in YZ planes (fixed x): 2 per column × 3 = 6 ---
    for (var x = 0; x < SIZE; x++) {
      lines.push([
        xyzToIndex(x, 0, 0),
        xyzToIndex(x, 1, 1),
        xyzToIndex(x, 2, 2)
      ]);
      lines.push([
        xyzToIndex(x, 0, 2),
        xyzToIndex(x, 1, 1),
        xyzToIndex(x, 2, 0)
      ]);
    }

    // --- Space Diagonals (through cube center): 4 ---
    lines.push([
      xyzToIndex(0, 0, 0),
      xyzToIndex(1, 1, 1),
      xyzToIndex(2, 2, 2)
    ]);
    lines.push([
      xyzToIndex(0, 0, 2),
      xyzToIndex(1, 1, 1),
      xyzToIndex(2, 2, 0)
    ]);
    lines.push([
      xyzToIndex(0, 2, 0),
      xyzToIndex(1, 1, 1),
      xyzToIndex(2, 0, 2)
    ]);
    lines.push([
      xyzToIndex(2, 0, 0),
      xyzToIndex(1, 1, 1),
      xyzToIndex(0, 2, 2)
    ]);

    return lines;
  }

  // ============================================================
  // GAME STATE CHECKS
  // ============================================================

  function checkWinner(currentBoard) {
    var target = currentBoard || board;
    for (var i = 0; i < winningLines.length; i++) {
      var line = winningLines[i];
      if (target[line[0]] &&
          target[line[0]] === target[line[1]] &&
          target[line[0]] === target[line[2]]) {
        return target[line[0]];
      }
    }
    return null;
  }

  function getWinningLine(currentBoard) {
    var target = currentBoard || board;
    for (var i = 0; i < winningLines.length; i++) {
      var line = winningLines[i];
      if (target[line[0]] &&
          target[line[0]] === target[line[1]] &&
          target[line[0]] === target[line[2]]) {
        return line;
      }
    }
    return null;
  }

  function isBoardFull(currentBoard) {
    var target = currentBoard || board;
    for (var i = 0; i < TOTAL_CELLS; i++) {
      if (target[i] === '') return false;
    }
    return true;
  }

  // ============================================================
  // HEURISTIC EVALUATION
  // ============================================================

  function heuristicEvaluate(currentBoard) {
    var score = 0;
    for (var i = 0; i < winningLines.length; i++) {
      var line = winningLines[i];
      var xCount = 0, oCount = 0, emptyCount = 0;
      for (var j = 0; j < 3; j++) {
        if (currentBoard[line[j]] === PLAYER_X) xCount++;
        else if (currentBoard[line[j]] === PLAYER_O) oCount++;
        else emptyCount++;
      }
      // AI (O) building lines → positive score
      if (oCount > 0 && emptyCount > 0) score += oCount * 10;
      // Player X building lines → negative score (block these)
      if (xCount > 0 && emptyCount > 0) score -= xCount * 8;
    }
    return score;
  }

  // ============================================================
  // MINIMAX WITH ALPHA-BETA PRUNING
  // ============================================================

  function evaluate(currentBoard) {
    var winner = checkWinner(currentBoard);
    if (winner === PLAYER_O) return 10;
    if (winner === PLAYER_X) return -10;
    return 0;
  }

  function minimax(currentBoard, depthLeft, isMaximizing, alpha, beta) {
    var score = evaluate(currentBoard);

    // Terminal states: someone won
    if (score === 10) return score - ((depthLeft !== null && depthLeft !== undefined) ? depthLeft : 0);
    if (score === -10) return score + ((depthLeft !== null && depthLeft !== undefined) ? depthLeft : 0);

    // Draw
    if (isBoardFull(currentBoard)) return 0;

    // Depth limit reached → use heuristic
    if (depthLeft !== null && depthLeft !== undefined && depthLeft <= 0) {
      return heuristicEvaluate(currentBoard.slice());
    }

    var emptyCells = [];
    for (var i = 0; i < TOTAL_CELLS; i++) {
      if (currentBoard[i] === '') emptyCells.push(i);
    }

    if (isMaximizing) { // AI's turn (O)
      var bestVal = -Infinity;
      for (var i = 0; i < emptyCells.length; i++) {
        currentBoard[emptyCells[i]] = PLAYER_O;
        var newVal = minimax(currentBoard, depthLeft > 0 ? depthLeft - 1 : null, false, alpha, beta);
        currentBoard[emptyCells[i]] = '';
        if (newVal > bestVal) bestVal = newVal;
        alpha = Math.max(alpha, bestVal);
        if (beta <= alpha) break; // Prune
      }
      return bestVal;
    } else { // Player's turn (X)
      var bestVal = Infinity;
      for (var i = 0; i < emptyCells.length; i++) {
        currentBoard[emptyCells[i]] = PLAYER_X;
        var newVal = minimax(currentBoard, depthLeft > 0 ? depthLeft - 1 : null, true, alpha, beta);
        currentBoard[emptyCells[i]] = '';
        if (newVal < bestVal) bestVal = newVal;
        beta = Math.min(beta, bestVal);
        if (beta <= alpha) break; // Prune
      }
      return bestVal;
    }
  }

  // ============================================================
  // AI MOVE GENERATION
  // ============================================================

  function getAvailableMoves() {
    var moves = [];
    for (var i = 0; i < TOTAL_CELLS; i++) {
      if (board[i] === '') moves.push(i);
    }
    return moves;
  }

  // --- Easy: completely random ---
  function getEasyMove() {
    var available = getAvailableMoves();
    return available[Math.floor(Math.random() * available.length)];
  }

  // --- Move ordering helper: prioritize center, then corners, then edges ---
  // This dramatically improves alpha-beta pruning efficiency on a 27-cell board.
  function prioritizeMoves(emptyCells) {
    var priorityOrder = [
      13, // center (most strategic)
      0, 2, 6, 8, 18, 20, 24, 26, // corners
      1, 3, 4, 5, 7, 9, 10, 11, 12, 14, 15, 16, 17, 19, 21, 22, 23 // edges
    ];
    var result = [];
    for (var i = 0; i < priorityOrder.length; i++) {
      if (emptyCells.indexOf(priorityOrder[i]) !== -1) {
        result.push(priorityOrder[i]);
      }
    }
    // Any empty cells not in the priority order come last
    for (var j = 0; j < emptyCells.length; j++) {
      if (result.indexOf(emptyCells[j]) === -1) {
        result.push(emptyCells[j]);
      }
    }
    return result;
  }

  // --- Medium: shallow minimax (depth=2) + occasional mistakes ---
  function getMediumMove() {
    var emptyCells = getAvailableMoves();

    if (!emptyCells.length) return -1;
    if (emptyCells.length === 1) return emptyCells[0];

    // ~30% chance to make a random mistake
    if (Math.random() < 0.30) {
      return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    var orderedCells = prioritizeMoves(emptyCells);

    var bestVal = -Infinity;
    var bestMove = orderedCells[0];
    for (var i = 0; i < orderedCells.length; i++) {
      var cell = orderedCells[i];
      board[cell] = PLAYER_O;
      // Pass a copy to minimax so we don't mutate shared state
      var moveVal = minimax(board.slice(), 2, false, -Infinity, Infinity);
      board[cell] = '';

      // Early exit on instant win — no need to check other cells
      if (moveVal >= 10) return cell;

      if (moveVal > bestVal) { bestVal = moveVal; bestMove = cell; }
    }

    // Safety fallback: if nothing improved, pick first available
    if (!bestMove || board[bestMove] !== '') {
      bestMove = emptyCells[0];
    }
    return bestMove;
  }

  // --- Hard: deeper minimax with alpha-beta (depth=3 for responsiveness on 27-cell board) ---
  function getHardMove() {
    var emptyCells = getAvailableMoves();

    if (!emptyCells.length) return -1;
    if (emptyCells.length === 1) return emptyCells[0];

    var orderedCells = prioritizeMoves(emptyCells);

    var bestVal = -Infinity;
    var bestMove = orderedCells[0];
    for (var i = 0; i < orderedCells.length; i++) {
      var cell = orderedCells[i];
      board[cell] = PLAYER_O;
      // Pass a copy to minimax so we don't mutate shared state
      var moveVal = minimax(board.slice(), 3, false, -Infinity, Infinity);
      board[cell] = '';

      // Early exit on instant win — no need to check other cells
      if (moveVal >= 10) return cell;

      if (moveVal > bestVal) { bestVal = moveVal; bestMove = cell; }
    }

    // Safety fallback: pick first available if nothing improved
    if (!bestMove || board[bestMove] !== '') {
    }
    return bestMove;
  }

  // ============================================================
  // CUBE FRAME OVERLAY (wireframe edges + face planes)
  // ============================================================

  function createCubeFrame() {
    var frame = document.createElement('div');
    frame.className = 'cube-frame';

    var faces = [
      { name: 'front',  transform: 'translateZ(135px)' },
      { name: 'back',   transform: 'rotateY(180deg) translateZ(135px)' },
      { name: 'top',    transform: 'rotateX(90deg) translateZ(135px)' },
      { name: 'bottom', transform: 'rotateX(-90deg) translateZ(135px)' },
      { name: 'left',   transform: 'rotateY(-90deg) translateZ(135px)' },
      { name: 'right',  transform: 'rotateY(90deg) translateZ(135px)' }
    ];

    for (var f = 0; f < faces.length; f++) {
      var plane = document.createElement('div');
      plane.className = 'face-plane face-' + faces[f].name;
      frame.appendChild(plane);
    }

    function addEdge(cls, tx, ty, tz) {
      var el = document.createElement('div');
      el.className = 'edge-line ' + cls;
      el.style.transform = 'translateX('+(tx||0)+'px) translateY('+(ty||0)+'px) translateZ('+(tz||0)+'px)';
      frame.appendChild(el);
    }

    var half = 135;
    // Bottom face (4 edges, z=-half)
    addEdge('edge-h', 0, -half, -half);
    addEdge('edge-v', -half, 0, -half);
    addEdge('edge-h', 0, half, -half);
    addEdge('edge-v', half, 0, -half);
    // Top face (4 edges, z=+half)
    addEdge('edge-h', 0, -half, half);
    addEdge('edge-v', -half, 0, half);
    addEdge('edge-h', 0, half, half);
    addEdge('edge-v', half, 0, half);
    // Connecting edges (4 pillars along Z)
    addEdge('edge-z', -half, -half, 0);
    addEdge('edge-z', half, -half, 0);
    addEdge('edge-z', -half, half, 0);
    addEdge('edge-z', half, half, 0);

    cubeElement.prepend(frame);
  }

  // ============================================================
  // RENDERING
  // ============================================================
  // RENDERING
  // ============================================================

  function renderBoard() {
    cubeElement.innerHTML = '';

    for (var z = 0; z < SIZE; z++) {
      var layerEl = document.createElement('div');
      layerEl.className = 'layer';
      layerEl.dataset.z = z;

      for (var y = 0; y < SIZE; y++) {
        for (var x = 0; x < SIZE; x++) {
          var index = xyzToIndex(x, y, z);
          var cellEl = document.createElement('div');
          cellEl.className = 'cell';
          if (board[index] === PLAYER_X) cellEl.classList.add('player-x');
          else if (board[index] === PLAYER_O) cellEl.classList.add('player-o');

          cellEl.textContent = board[index];
          cellEl.dataset.index = index;

          layerEl.appendChild(cellEl);
        }
      }
      cubeElement.appendChild(layerEl);
    }
  }

  function updateStatus(message, type) {
    statusDisplay.textContent = message;
    statusDisplay.className = 'status ' + type;
  }

  // ============================================================
  // GAME FLOW
  // ============================================================

  function handleCellClick(e) {
    var cell = e.target.closest('.cell');
    if (!cell || !isGameActive || currentPlayer !== PLAYER_X) return;

    var index = parseInt(cell.dataset.index);
    if (board[index] !== '') return;

    makeMove(index, PLAYER_X);
    checkGameStatus();

    if (isGameActive && currentPlayer === PLAYER_O) {
      setTimeout(aiMove, 350);
    }
  }

  function makeMove(index, player) {
    board[index] = player;
    renderBoard();
  }

  function checkGameStatus() {
    var winner = checkWinner();
    if (winner) {
      isGameActive = false;
      updateStatus(winner + ' wins!', 'winner');
      highlightWinningLine(winner);
      return;
    }
    if (isBoardFull()) {
      isGameActive = false;
      updateStatus("It's a draw!", 'draw');
      return;
    }
    currentPlayer = (currentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
    var turnClass = currentPlayer === PLAYER_X ? 'player-x-turn' : 'player-o-turn';
    updateStatus(currentPlayer + "'s turn", turnClass);
  }

  function highlightWinningLine(winner) {
    var line = getWinningLine();
    if (!line) return;

    // Re-render with winning highlights
    cubeElement.innerHTML = '';

    for (var z = 0; z < SIZE; z++) {
      var layerEl = document.createElement('div');
      layerEl.className = 'layer';
      layerEl.dataset.z = z;

      for (var y = 0; y < SIZE; y++) {
        for (var x = 0; x < SIZE; x++) {
          var index = xyzToIndex(x, y, z);
          var cellEl = document.createElement('div');
          cellEl.className = 'cell';
          if (board[index] === PLAYER_X) cellEl.classList.add('player-x');
          else if (board[index] === PLAYER_O) cellEl.classList.add('player-o');

          // Highlight winning cells
          for (var w = 0; w < line.length; w++) {
            if (line[w] === index) {
              cellEl.classList.add('winning-line');
              break;
            }
          }

          cellEl.textContent = board[index];
          layerEl.appendChild(cellEl);
        }
      }
      cubeElement.appendChild(layerEl);
    }
  }

  function aiMove() {
    if (!isGameActive) return;
    var moveIndex;
    switch (selectedDifficulty) {
      case 'easy':   moveIndex = getEasyMove(); break;
      case 'medium': moveIndex = getMediumMove(); break;
      default:       moveIndex = getHardMove(); break;
    }
    if (moveIndex >= 0 && board[moveIndex] === '') {
      makeMove(moveIndex, PLAYER_O);
      checkGameStatus();
    }
  }

  // ============================================================
  // ROTATION CONTROLS
  // ============================================================

  function updateRotation() {
    var rotateX = rotateXSlider ? rotateXSlider.value : 30;
    var rotateY = rotateYSlider ? rotateYSlider.value : 45;
    cubeElement.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
  }

  // ============================================================
  // INITIALIZATION & RESET
  // ============================================================

  function init() {
    statusDisplay = document.getElementById('status-display');
    resetButton = document.getElementById('reset-btn');
    difficultySelect = document.getElementById('difficulty-select');
    cubeElement = document.getElementById('tic-tac-toe-cube');
    rotateXSlider = document.getElementById('rotateX-slider');
    rotateYSlider = document.getElementById('rotateY-slider');

    // Generate winning lines once at start
    winningLines = generateWinningLines();

    // Set initial rotation
    updateRotation();

    // Event listeners for rotation sliders
    if (rotateXSlider) {
      rotateXSlider.addEventListener('input', updateRotation);
    }
    if (rotateYSlider) {
      rotateYSlider.addEventListener('input', updateRotation);
    }

    // Difficulty selector
    difficultySelect.addEventListener('change', function() {
      selectedDifficulty = this.value;
      resetGame();
    });

    // Reset button
    resetButton.addEventListener('click', resetGame);

    // Cell click handler (event delegation)
    cubeElement.addEventListener('click', handleCellClick);
  }

  function resetGame() {
    board = new Array(TOTAL_CELLS).fill('');
    currentPlayer = PLAYER_X;
    isGameActive = true;
    renderBoard();
    updateStatus("Your turn (X)", 'player-x-turn');
  }

  // --- Start on DOM ready ---
  document.addEventListener('DOMContentLoaded', function() {
    init();
    resetGame();
  });

})();
