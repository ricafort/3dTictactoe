// ============================================================
// 3D Tic-Tac-Toe — Full Game Logic
// Board: 3x3x3 = 27 cells, indexed as z*9 + y*3 + x
// Winning lines: 49 total (rows + columns + pillars + face diags + space diags)
// ============================================================

(function() {

  // --- Constants ---
  var SIZE = 3;
  var TOTAL_CELLS = SIZE * SIZE * SIZE; // 27
  var PLAYER_X = 'X';
  var PLAYER_O = 'O';

  // Cell block dimensions (used in rendering)
  var CELL_SIZE = 68;
  var GAP = 10;
  var STEP = CELL_SIZE + GAP; // center-to-center step between blocks
  
  // Total edge length of the big cube (must match CSS .cube, .face-plane, .edge-h/v)
  var CUBE_SIDE = 224;
  // Half-edge used for frame positioning and block offsets (must match CSS .face-plane margin/translateZ)
  var CUBE_HALF = 112;

  // --- Game State ---
  var board = new Array(TOTAL_CELLS).fill('');
  var currentPlayer = PLAYER_X;
  var isGameActive = true;
  var winningLines = [];
  var selectedDifficulty = 'medium';

  // --- DOM References (populated on init) ---
  var statusDisplay, resetButton, difficultySelect, cubeElement;

  // --- Drag state for rotation ---
  var isDragging = false;
  var dragStartX = 0, dragStartY = 0;
  var rotationX = 30, rotationY = 45;   // current tilt angles (degrees)

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

    // --- Rows (along X axis): fixed y, fixed z, varying x -> 3x3 = 9 ---
    for (var z = 0; z < SIZE; z++) {
      for (var y = 0; y < SIZE; y++) {
        lines.push([
          xyzToIndex(0, y, z),
          xyzToIndex(1, y, z),
          xyzToIndex(2, y, z)
        ]);
      }
    }

    // --- Columns (along Y axis): fixed x, fixed z, varying y -> 3x3 = 9 ---
    for (var z = 0; z < SIZE; z++) {
      for (var x = 0; x < SIZE; x++) {
        lines.push([
          xyzToIndex(x, 0, z),
          xyzToIndex(x, 1, z),
          xyzToIndex(x, 2, z)
        ]);
      }
    }

    // --- Pillars (along Z axis): fixed x, fixed y, varying z -> 3x3 = 9 ---
    for (var y = 0; y < SIZE; y++) {
      for (var x = 0; x < SIZE; x++) {
        lines.push([
          xyzToIndex(x, y, 0),
          xyzToIndex(x, y, 1),
          xyzToIndex(x, y, 2)
        ]);
      }
    }

    // --- Face Diagonals in XY planes (fixed z): 2 per layer x 3 = 6 ---
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

    // --- Face Diagonals in XZ planes (fixed y): 2 per slice x 3 = 6 ---
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

    // --- Face Diagonals in YZ planes (fixed x): 2 per column x 3 = 6 ---
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
      // AI (O) building lines -> positive score
      if (oCount > 0 && emptyCount > 0) score += oCount * 10;
      // Player X building lines -> negative score (block these)
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

    // Depth limit reached -> use heuristic
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
  function prioritizeMoves(emptyCells) {
    var priorityOrder = [
      13, // Center
      0, 2, 6, 8, 18, 20, 24, 26, // Corners (all 3 layers)
      1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25 // Edges (all 3 layers)
    ];
    var result = [];
    for (var i = 0; i < priorityOrder.length; i++) {
      if (emptyCells.indexOf(priorityOrder[i]) !== -1) {
        result.push(priorityOrder[i]);
      }
    }
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
      var moveVal = minimax(board.slice(), 2, false, -Infinity, Infinity);
      board[cell] = '';

      if (moveVal >= 10) return cell;

      if (moveVal > bestVal) { bestVal = moveVal; bestMove = cell; }
    }

    if (!bestMove || board[bestMove] !== '') {
      bestMove = orderedCells[0];
    }
    return bestMove;
  }

  // --- Hard: deeper minimax with alpha-beta (depth=3) ---
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
      var moveVal = minimax(board.slice(), 3, false, -Infinity, Infinity);
      board[cell] = '';

      if (moveVal >= 10) return cell;

      if (moveVal > bestVal) { bestVal = moveVal; bestMove = cell; }
    }

    if (!bestMove || board[bestMove] !== '') {
      bestMove = orderedCells[0];
    }
    return bestMove;
  }

  // ============================================================
  // CUBE FRAME OVERLAY (wireframe edges + face planes)
  // Uses the computed cube dimensions so frame matches blocks.
  // ============================================================

  function createCubeFrame() {
    var frame = document.createElement('div');
    frame.className = 'cube-frame';

    var faces = [
      { name: 'front',  transform: 'translateZ(' + CUBE_HALF + 'px)' },
      { name: 'back',   transform: 'rotateY(180deg) translateZ(' + CUBE_HALF + 'px)' },
      { name: 'top',    transform: 'rotateX(90deg) translateZ(' + CUBE_HALF + 'px)' },
      { name: 'bottom', transform: 'rotateX(-90deg) translateZ(' + CUBE_HALF + 'px)' },
      { name: 'left',   transform: 'rotateY(-90deg) translateZ(' + CUBE_HALF + 'px)' },
      { name: 'right',  transform: 'rotateY(90deg) translateZ(' + CUBE_HALF + 'px)' }
    ];

    for (var f = 0; f < faces.length; f++) {
      var plane = document.createElement('div');
      plane.className = 'face-plane face-' + faces[f].name;
      plane.style.transform = faces[f].transform; // Set transform from JS
      frame.appendChild(plane);
    }

    function addEdge(cls, tx, ty, tz) {
      var el = document.createElement('div');
      el.className = 'edge-line ' + cls;
      el.style.transform = 'translateX('+(tx||0)+'px) translateY('+(ty||0)+'px) translateZ('+(tz||0)+'px)';
      frame.appendChild(el);
    }

    var half = CUBE_HALF;
    // Bottom face (4 edges, z=-half)
    addEdge('edge-h', 0, -half, -half);  // Bottom-Front (center X, bottom Y, front Z)
    addEdge('edge-h', 0, -half, half);   // Bottom-Back
    addEdge('edge-v', -half, 0, -half);  // Bottom-Left (left X, center Y, front Z)
    addEdge('edge-v', half, 0, -half);   // Bottom-Right

    // Top face (4 edges, z=+half)
    addEdge('edge-h', 0, half, -half);   // Top-Front
    addEdge('edge-h', 0, half, half);    // Top-Back
    addEdge('edge-v', -half, 0, half);   // Top-Left
    addEdge('edge-v', half, 0, half);    // Top-Right

    // Connecting edges (4 pillars along Z)
    addEdge('edge-z', -half, -half, 0); // Front-Left
    addEdge('edge-z', half, -half, 0);  // Front-Right
    addEdge('edge-z', -half, half, 0);  // Back-Left
    addEdge('edge-z', half, half, 0);   // Back-Right

    cubeElement.prepend(frame);
  }

  // ============================================================
  // RENDERING — each cell becomes a small 3D block with visible faces.
  // The blocks are positioned in true 3D space forming the larger cube.
  // ============================================================

  function buildBlock(x, y, z) {
    var half = CELL_SIZE / 2;

    var wrapper = document.createElement('div');
    wrapper.className = 'block-wrapper';
    wrapper.dataset.index = xyzToIndex(x, y, z);

    // Position the block in 3D space (origin is center of the big cube)
    var txVal = x * STEP - CUBE_HALF;
    var tyVal = -y * STEP + CUBE_HALF; // Y-axis inverted for screen coordinates (0 at top)
    var tzVal = (z - 1) * STEP;         // Z-axis layers: -STEP, 0, +STEP
    
    wrapper.style.transform =
      'translateX(' + txVal + 'px)' +
      ' translateY(' + tyVal + 'px)' +
      ' translateZ(' + tzVal + 'px)';
    wrapper.style.transformStyle = 'preserve-3d';

    // --- Front face (the clickable X/O display surface) ---
    var frontFace = document.createElement('div');
    frontFace.className = 'block-face block-front';
    frontFace.innerHTML = '&nbsp;'; // Placeholder for X/O
    frontFace.style.transform = 'translateZ(' + (half) + 'px)';

    // --- Top face ---
    var topFace = document.createElement('div');
    topFace.className = 'block-face block-top';
    topFace.innerHTML = '&nbsp;';
    topFace.style.transform = 'rotateX(90deg) translateZ(' + (half) + 'px)';

    // --- Right face ---
    var rightFace = document.createElement('div');
    rightFace.className = 'block-face block-right';
    rightFace.innerHTML = '&nbsp;';
    rightFace.style.transform = 'rotateY(90deg) translateZ(' + (half) + 'px)';

    wrapper.appendChild(frontFace);
    wrapper.appendChild(topFace);
    wrapper.appendChild(rightFace);

    return wrapper;
  }

  function renderBoard() {
    cubeElement.innerHTML = ''; // Clear existing blocks and frame

    for (var z = 0; z < SIZE; z++) {
      for (var y = 0; y < SIZE; y++) {
        for (var x = 0; x < SIZE; x++) {
          var index = xyzToIndex(x, y, z);
          var block = buildBlock(x, y, z);

          // Mark occupied cells and add 'occupied' class to wrapper
          if (board[index] === PLAYER_X) {
            block.querySelector('.block-front').classList.add('player-x');
            block.classList.add('occupied');
          } else if (board[index] === PLAYER_O) {
            block.querySelector('.block-front').classList.add('player-o');
            block.classList.add('occupied');
          }

          cubeElement.appendChild(block);
        }
      }
    }
    createCubeFrame(); // Re-add the frame after blocks
  }

  function updateStatus(message, type) {
    statusDisplay.textContent = message;
    statusDisplay.className = 'status ' + type;
  }

  // ============================================================
  // GAME FLOW
  // ============================================================

  var wasDragging = false;   // track to distinguish click vs drag

  function handleCellClick(e) {
    if (wasDragging) return; // ignore clicks that were actually drags
    
    var block = e.target.closest('.block-wrapper');
    if (!block || !isGameActive || currentPlayer !== PLAYER_X) return;

    var index = parseInt(block.dataset.index, 10);
    if (board[index] !== '') return; // Cell already occupied

    makeMove(index, PLAYER_X);
    checkGameStatus();

    if (isGameActive && currentPlayer === PLAYER_O) {
      setTimeout(aiMove, 350);
    }
  }

  function makeMove(index, player) {
    board[index] = player;
    renderBoard(); // Re-render the entire board after a move
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

    // Re-render the board first to ensure all elements are fresh
    renderBoard(); 

    for (var w = 0; w < line.length; w++) {
      var idx = line[w];
      var block = cubeElement.querySelector('.block-wrapper[data-index="' + idx + '"]');
      if (!block) continue;
      // Add winning glow to all visible faces
      var faces = block.querySelectorAll('.block-face');
      for (var f = 0; f < faces.length; f++) {
        faces[f].classList.add('winning-line');
      }
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
  // ROTATION CONTROLS — Mouse Drag & Touch Drag
  // ============================================================

  function applyRotation() {
    cubeElement.style.transform = 'rotateX(' + rotationX + 'deg) rotateY(' + rotationY + 'deg)';
  }

  function onPointerDown(e) {
    wasDragging = false;
    dragStartX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    dragStartY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
  }

  function onPointerMove(e) {
    var clientX, clientY;
    if (e.clientX !== undefined) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    var dx = clientX - dragStartX;
    var dy = clientY - dragStartY;

    // Drag threshold: only count as drag after 3px movement
    if (!wasDragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      wasDragging = true;
      cubeElement.style.cursor = 'grabbing';
    }

    if (wasDragging) {
      rotationY += dx * 0.4;   // horizontal drag -> Y-axis rotation
      rotationX -= dy * 0.4;   // vertical drag   -> X-axis rotation

      // Clamp to avoid near-gimbal-lock extremes
      if (rotationX > 85) rotationX = 85;
      if (rotationX < -85) rotationX = -85;

      applyRotation();

      dragStartX = clientX;
      dragStartY = clientY;
    }
  }

  function onPointerUp() {
    wasDragging = false;
    cubeElement.style.cursor = 'grab';
    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('mouseup', onPointerUp);
  }

  // ============================================================
  // INITIALIZATION & RESET
  // ============================================================

  function init() {
    statusDisplay = document.getElementById('status-display');
    resetButton = document.getElementById('reset-btn');
    difficultySelect = document.getElementById('difficulty-select');
    cubeElement = document.getElementById('tic-tac-toe-cube');

    // Generate winning lines once at start
    winningLines = generateWinningLines(); // Frame is created in renderBoard

    // Set initial rotation via drag handlers (not sliders)
    applyRotation();

    // --- Attach mouse/touch drag listeners to the cube ---
    cubeElement.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });

    // Set cursor hint
    cubeElement.style.cursor = 'grab';

    // Difficulty selector
    difficultySelect.addEventListener('change', function() {
      selectedDifficulty = this.value;
      resetGame();
    });

    // Reset button
    resetButton.addEventListener('click', resetGame);

    // Cell click handler (event delegation on cube)
    cubeElement.addEventListener('click', handleCellClick);
  }

  function resetGame() {
    board = new Array(TOTAL_CELLS).fill('');
    currentPlayer = PLAYER_X;
    isGameActive = true;
    renderBoard(); // Initial render and frame creation
    updateStatus("Your turn (X)", 'player-x-turn');
  }

  // --- Start on DOM ready ---
  document.addEventListener('DOMContentLoaded', function() {
    init();
    resetGame();
  });

})();


