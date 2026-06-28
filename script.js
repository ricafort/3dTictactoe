// ============================================================
// 3D Tic-Tac-Toe — Full Game Logic
// Board: 3x3x3 = 27 cells, indexed as z*9 + y*3 + x
// Winning lines: 49 total (rows + columns + pillars + face diags + space diags)
// ============================================================
(function() {
    // ------------------------------------------------------------
    // Constants and DOM Elements
    // ------------------------------------------------------------
    const BOARD_SIZE = 3;
    const NUM_CELLS = BOARD_SIZE * BOARD_SIZE * BOARD_SIZE; // 27
    const CELL_SPACING = 74; // Distance between block centers (68px block size + 6px gap)
    
    const statusDisplay = document.getElementById('status-display');
    const cubeElement = document.getElementById('tic-tac-toe-cube');
    const resetBtn = document.getElementById('reset-btn');
    const explodeBtn = document.getElementById('explode-btn');
    const difficultySelect = document.getElementById('difficulty-select');

    // All 49 winning lines for a 3x3x3 board
    // Each array contains 3 cell indices that form a line
    const WINNING_LINES = [
        // 1. 27 Lines within each plane (XY, XZ, YZ)
        
        // 1.1. 9 Rows (3 per Z-level)
        // Z=0 [0, 1, 2], [3, 4, 5], [6, 7, 8]
        // Z=1 [9, 10, 11], [12, 13, 14], [15, 16, 17]
        // Z=2 [18, 19, 20], [21, 22, 23], [24, 25, 26]
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [9, 10, 11], [12, 13, 14], [15, 16, 17],
        [18, 19, 20], [21, 22, 23], [24, 25, 26],

        // 1.2. 9 Columns (3 per Z-level)
        // Z=0 [0, 3, 6], [1, 4, 7], [2, 5, 8]
        // Z=1 [9, 12, 15], [10, 13, 16], [11, 14, 17]
        // Z=2 [18, 21, 24], [19, 22, 25], [20, 23, 26]
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [9, 12, 15], [10, 13, 16], [11, 14, 17],
        [18, 21, 24], [19, 22, 25], [20, 23, 26],

        // 1.3. 9 Pillars (vertical lines through Z)
        [0, 9, 18], [1, 10, 19], [2, 11, 20],
        [3, 12, 21], [4, 13, 22], [5, 14, 23],
        [6, 15, 24], [7, 16, 25], [8, 17, 26],

        // 2. 12 Diagonal Lines within each face (XY, XZ, YZ)
        
        // 2.1. 6 Diagonals on XY planes (2 per Z-level)
        // Z=0 [0, 4, 8], [2, 4, 6]
        // Z=1 [9, 13, 17], [11, 13, 15]
        // Z=2 [18, 22, 26], [20, 22, 24]
        [0, 4, 8], [2, 4, 6],
        [9, 13, 17], [11, 13, 15],
        [18, 22, 26], [20, 22, 24],

        // 2.2. 6 Diagonals on XZ planes (2 per Y-level)
        // Y=0 [0, 10, 20], [2, 10, 18]
        // Y=1 [3, 13, 23], [5, 13, 21]
        // Y=2 [6, 16, 26], [8, 16, 24]
        [0, 10, 20], [2, 10, 18],
        [3, 13, 23], [5, 13, 21],
        [6, 16, 26], [8, 16, 24],

        // 2.3. 6 Diagonals on YZ planes (2 per X-level)
        // X=0 [0, 12, 24], [6, 12, 18]
        // X=1 [1, 13, 25], [7, 13, 19]
        // X=2 [2, 14, 26], [8, 14, 20]
        [0, 12, 24], [6, 12, 18],
        [1, 13, 25], [7, 13, 19],
        [2, 14, 26], [8, 14, 20],

        // 3. 4 Space Diagonals (main diagonals through the cube)
        [0, 13, 26], [2, 13, 24],
        [6, 13, 20], [8, 13, 18]
    ];

    // ------------------------------------------------------------
    // Game State
    let currentPlayer = 'X';
    let gameActive = true;
    let isExploded = false;
    let rotationX = -28;  // Diagonal/isometric view showing top face
    let rotationY = -45;   // Angled to show side face simultaneously
    let currentDifficulty = difficultySelect.value;
    let blockElements = []; // Store references to all block wrapper elements
    // ------------------------------------------------------------
    // UI Update Functions
    // ------------------------------------------------------------
    function updateStatus(message, className = '') {
        statusDisplay.textContent = message;
        statusDisplay.className = 'status ' + className;
    }

    function applyCubeRotation() {
        cubeElement.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

    // ------------------------------------------------------------
    // Board Generation and 3D Positioning
    // ------------------------------------------------------------
    function createBoard() {
        cubeElement.innerHTML = '';
        blockElements = []; // Clear stored references
        
        const halfBoardSize = (BOARD_SIZE - 1) / 2; // For centering calculations

        for (let i = 0; i < NUM_CELLS; i++) {
            const blockWrapper = document.createElement('div');
            blockWrapper.classList.add('block-wrapper');
            blockWrapper.dataset.index = i;

            // Calculate 3D position (x, y, z coordinates in grid)
            // index = z*9 + y*3 + x
            const z = Math.floor(i / (BOARD_SIZE * BOARD_SIZE));   // 0, 1, 2
            const y = Math.floor((i % (BOARD_SIZE * BOARD_SIZE)) / BOARD_SIZE); // 0, 1, 2
            const x = i % BOARD_SIZE;                                // 0, 1, 2

            // Center the cube: coordinates range from -1 to 1 instead of 0 to 2
            const transX = (x - halfBoardSize) * CELL_SPACING;
            const transY = (y - halfBoardSize) * CELL_SPACING;
            const transZ = (z - halfBoardSize) * CELL_SPACING;

            // Apply initial positioning (will be updated by explode/implode)
            blockWrapper.style.transform = `translate3d(${transX}px, ${transY}px, ${transZ}px)`;

            // Create faces for the block
            const faces = ['front', 'back', 'top', 'bottom', 'left', 'right'];
            faces.forEach(faceName => {
                const face = document.createElement('div');
                face.classList.add('block-face', `block-${faceName}`);
                blockWrapper.appendChild(face);
            });

            cubeElement.appendChild(blockWrapper);
            blockElements.push(blockWrapper); // Store reference
        }

        // Add cube frame overlay for visual guidance
        const cubeFrame = document.createElement('div');
        cubeFrame.classList.add('cube-frame');
        cubeElement.appendChild(cubeFrame);

        // Add face planes to the frame (these are styled in CSS to create the transparent cube outline)
        const facePlanes = ['front', 'back', 'top', 'bottom', 'left', 'right'];
        facePlanes.forEach(faceName => {
            const plane = document.createElement('div');
            plane.classList.add('face-plane', `face-${faceName}`);
            cubeFrame.appendChild(plane);
        });
    }

    // ------------------------------------------------------------
    // Game Logic
    // ------------------------------------------------------------
    function checkWin() {
        for (const line of WINNING_LINES) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                gameActive = false;
                updateStatus(`${board[a]} wins!`, 'winner');
                highlightWinningLine(line);
                return true;
            }
        }
        return false;
    }

    function checkDraw() {
        return gameActive && board.every(cell => cell !== null);
    }

    function highlightWinningLine(line) {
        line.forEach(index => {
            const blockWrapper = blockElements[index];
            if (blockWrapper) {
                // Highlight all faces of the winning block
                Array.from(blockWrapper.children).forEach(face => {
                    if (face.classList.contains('block-face')) {
                        face.classList.add('winning-line');
                    }
                });
            }
        });
    }

    function placeMark(index, player) {
        if (!gameActive || board[index] !== null) {
            return false;
        }
        
        board[index] = player;
        const blockWrapper = blockElements[index];
        // Apply player class to the ENTIRE wrapper so all faces change color
        blockWrapper.classList.add('occupied', `player-${player.toLowerCase()}`);

        // Display X or O on the front face
        const frontFace = blockWrapper.querySelector('.block-front');
        if (frontFace) {
            frontFace.textContent = player;
            frontFace.style.display = 'flex';
            frontFace.style.justifyContent = 'center';
            frontFace.style.alignItems = 'center';
            frontFace.style.fontSize = '2.5rem';
            frontFace.style.fontWeight = 'bold';
        }
        return true;
    }

    function handleClick(event) {
        // If the user was dragging, ignore the click event
        if (wasDragging) {
            wasDragging = false;
            return;
        }

        if (!gameActive || currentPlayer === 'O') return; // Prevent clicks during AI turn

        const blockWrapper = event.target.closest('.block-wrapper');
        if (!blockWrapper) return;

        const index = parseInt(blockWrapper.dataset.index);

        if (placeMark(index, currentPlayer)) {
            if (checkWin()) { return; }
            if (checkDraw()) {
                gameActive = false;
                updateStatus('It\'s a draw!', 'draw');
                return;
            }
            switchPlayer();

            if (currentPlayer === 'O') {
                setTimeout(makeAIMove, 700); // AI moves after a short delay
            }
        }
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (gameActive) {
            updateStatus(`${currentPlayer}'s turn`, `player-${currentPlayer.toLowerCase()}-turn`);
        }
    }

    // ------------------------------------------------------------
    // AI Logic
    // ------------------------------------------------------------
    function getEmptyCells() {
        return board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
    }

    function makeAIMove() {
        const emptyCells = getEmptyCells();
        if (emptyCells.length === 0 || !gameActive) return;

        let bestMove = -1;
        const aiPlayer = 'O';
        const humanPlayer = 'X';

        // Helper for AI to check win conditions without altering actual game state permanently
        function checkWinSimulated(playerToCheck, currentBoard) {
            for (const line of WINNING_LINES) {
                const [a, b, c] = line;
                if (currentBoard[a] === playerToCheck && currentBoard[b] === playerToCheck && currentBoard[c] === playerToCheck) {
                    return true;
                }
            }
            return false;
        }

        if (currentDifficulty === 'easy') {
            bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } else if (currentDifficulty === 'medium' || currentDifficulty === 'hard') {
            // 1. Try to win
            for (const cellIndex of emptyCells) {
                board[cellIndex] = aiPlayer;
                if (checkWinSimulated(aiPlayer, board)) {
                    bestMove = cellIndex;
                    board[cellIndex] = null; // Reset
                    break;
                }
                board[cellIndex] = null; // Reset
            }

            // 2. Block player's win
            if (bestMove === -1) {
                for (const cellIndex of emptyCells) {
                    board[cellIndex] = humanPlayer;
                    if (checkWinSimulated(humanPlayer, board)) {
                        bestMove = cellIndex;
                        board[cellIndex] = null; // Reset
                        break;
                    }
                    board[cellIndex] = null; // Reset
                }
            }

            // 3. Take center cell (most strategic for 3D)
            // Index 13 is the very center of a 3x3x3 board (1,1,1)
            if (bestMove === -1 && emptyCells.includes(13)) {
                bestMove = 13;
            }

            // 4. For 'hard', try to set up forks or block opponent's forks (simplified)
            // This is a simplification; a full minimax is very complex for 3D Tic-Tac-Toe
            if (currentDifficulty === 'hard' && bestMove === -1) {
                // Look for cells that create two winning lines for AI
                // Or block a cell that creates two winning lines for human
                // (This would require more sophisticated logic, for now, fall back to strategic cells)
            }

            // 5. Otherwise, pick a strategic available cell (corners, edges)
            if (bestMove === -1) {
                const strategicCells = [
                    0, 2, 6, 8, 18, 20, 24, 26, // Corners
                    4, 10, 12, 14, 16, 22,       // Middle of faces/edges
                    1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25 // Remaining edges
                ];
                const availableStrategic = emptyCells.filter(idx => strategicCells.includes(idx));
                if (availableStrategic.length > 0) {
                    bestMove = availableStrategic[0]; // Just take the first one found, could be randomized
                } else {
                    bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                }
            }
        }

        if (bestMove !== -1) {
            if (placeMark(bestMove, aiPlayer)) {
                if (checkWin()) { return; }
                if (checkDraw()) {
                    gameActive = false;
                    updateStatus('It\'s a draw!', 'draw');
                    return;
                }
                switchPlayer();
            }
        }
    }

    // ------------------------------------------------------------
    // Explode View
    // ------------------------------------------------------------
    function toggleExplodeView() {
        isExploded = !isExploded;
        const halfBoardSize = (BOARD_SIZE - 1) / 2;
        const explodeFactor = isExploded ? 1.5 : 0; // Adjust for desired separation

        blockElements.forEach((blockWrapper, i) => {
            const z = Math.floor(i / (BOARD_SIZE * BOARD_SIZE));
            const y = Math.floor((i % (BOARD_SIZE * BOARD_SIZE)) / BOARD_SIZE);
            const x = i % BOARD_SIZE;

            // Calculate initial position offsets
            const baseTransX = (x - halfBoardSize) * CELL_SPACING;
            const baseTransY = (y - halfBoardSize) * CELL_SPACING;
            const baseTransZ = (z - halfBoardSize) * CELL_SPACING;

            // Calculate explosion offset based on its position relative to the center
            const explodeX = (x - halfBoardSize) * CELL_SPACING * explodeFactor * 0.5; // Reduced explode factor to avoid over-explosion
            const explodeY = (y - halfBoardSize) * CELL_SPACING * explodeFactor * 0.5;
            const explodeZ = (z - halfBoardSize) * CELL_SPACING * explodeFactor * 0.5;

            blockWrapper.style.transform = `translate3d(${baseTransX + explodeX}px, ${baseTransY + explodeY}px, ${baseTransZ + explodeZ}px)`;
        });
    }

    // ------------------------------------------------------------
    // Reset Game
    // ------------------------------------------------------------
    function resetGame() {
        board.fill(null);
        currentPlayer = 'X';
        gameActive = true;
        updateStatus('Your turn (X)', 'player-x-turn');

        blockElements.forEach(blockWrapper => {
            blockWrapper.classList.remove('occupied', 'player-x', 'player-o');
            const frontFace = blockWrapper.querySelector('.block-front');
            if (frontFace) { frontFace.textContent = ''; }

            Array.from(blockWrapper.children).forEach(face => {
                if (face.classList.contains('block-face')) {
                    face.classList.remove('winning-line');
                }
            });
        });

        if (isExploded) {
            toggleExplodeView(); // Collapse if exploded
        }
    }

    // ------------------------------------------------------------
    // Event Listeners
    // ------------------------------------------------------------
    function setupEventListeners() {
        // --- Mouse Drag Rotation & Click Handling ---
        cubeElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            wasDragging = false;
            lastX = e.clientX;
            lastY = e.clientY;
            cubeElement.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            // If mouse moved more than 3px, treat it as a drag (not a click)
            if (!wasDragging && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
                wasDragging = true;
            }

            if (wasDragging) {
                rotationY += deltaX * 0.5; // Rotate around Y-axis for horizontal mouse movement
                rotationX -= deltaY * 0.5; // Rotate around X-axis for vertical mouse movement
                rotationX = Math.max(-90, Math.min(90, rotationX)); // Limit X rotation to avoid flipping
                applyCubeRotation();
            }
            lastX = e.clientX;
            lastY = e.clientY;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            cubeElement.style.cursor = 'grab';
        });

        // Prevent context menu on right-click drag
        cubeElement.addEventListener('contextmenu', (e) => e.preventDefault());

        // --- Touch Rotation ---
        cubeElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) { // Single touch for rotation
                isDragging = true;
                wasDragging = false;
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
            }
        }, { passive: false }); // Use { passive: false } to allow preventDefault

        cubeElement.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            e.preventDefault(); // Prevent scrolling
            const deltaX = e.touches[0].clientX - lastX;
            const deltaY = e.touches[0].clientY - lastY;

            // If touch moved more than 3px, treat it as a drag (not a tap/click)
            if (!wasDragging && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
                wasDragging = true;
            }

            if (wasDragging) {
                rotationY += deltaX * 0.5;
                rotationX -= deltaY * 0.5;
                rotationX = Math.max(-90, Math.min(90, rotationX));
                applyCubeRotation();
            }
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
        }, { passive: false });

        cubeElement.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Cell clicks (delegated from cubeElement)
        cubeElement.addEventListener('click', handleClick);

        // Controls
        resetBtn.addEventListener('click', resetGame);
        explodeBtn.addEventListener('click', toggleExplodeView);
        difficultySelect.addEventListener('change', (e) => {
            currentDifficulty = e.target.value;
            resetGame(); // Reset game with new difficulty
        });
    }

    // ------------------------------------------------------------
    // Initialization
    // ------------------------------------------------------------
    function init() {
        createBoard();
        setupEventListeners();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();