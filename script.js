document.addEventListener("DOMContentLoaded", function() {

    // --- Game Constants ---
    var PLAYER_X = 'X';
    var PLAYER_O = 'O';

    // --- Game State ---
    var currentBoard = Array(9).fill('');
    var selectedDifficulty = difficultySelect.value || 'medium';
    var gameActive = true;

    // --- Winning Conditions ---
    var winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // --- DOM Elements ---
    var cells = document.querySelectorAll('.cell');
    var difficultySelector = document.getElementById('difficulty-select');
    var resetButton = document.getElementById('reset-btn');
    var statusDisplay = document.getElementById('status-display');

    // --- Helper Functions ---
    function checkWinner(board) {
        for (var i = 0; i < winningConditions.length; i++) {
            var a = board[winningConditions[i][0]];
            if (a && a === board[winningConditions[i][1]] && a === board[winningConditions[i][2]]) {
                return a;
            }
        }
        return null;
    }

    function getEmptyCells(board) {
        var empty = [];
        for (var i = 0; i < 9; i++) {
            if (board[i] === '') empty.push(i);
        }
        return empty;
    }

    function isBoardFull(board) {
        return getEmptyCells(board).length === 0;
    }

    // --- Minimax Core ---
    function evaluate(board) {
        var winner = checkWinner(board);
        if (winner === PLAYER_O) return 10;
        if (winner === PLAYER_X) return -10;
        return 0;
    }

    /**
     * Minimax with optional depth limit.
     * depth = null/undefined → full search (unbeatable)
     * depth = positive int → limited lookahead
     */
    function minimax(board, depth, isMaximizingPlayer) {
        var score = evaluate(board);

        if (score === 10) return { score: score - ((depth !== null && depth !== undefined) ? depth : 0) };
        if (score === -10) return { score: score + ((depth !== null && depth !== undefined) ? depth : 0) };
        if (isBoardFull(board)) return { score: 0 };

        // Depth limit reached → return current evaluation
        if (depth !== null && depth !== undefined && depth <= 0) {
            return { score: evaluate(board) };
        }

        var emptyCells = getEmptyCells(board);
        var bestScore = isMaximizingPlayer ? -Infinity : Infinity;
        var bestIndex = -1;

        for (var i = 0; i < emptyCells.length; i++) {
            var idx = emptyCells[i];
            board[idx] = isMaximizingPlayer ? PLAYER_O : PLAYER_X;

            // Decrease depth by 1 each recursion level
            var newDepth = (depth !== null && depth !== undefined) ? depth - 1 : null;
            var result = minimax(board, newDepth, !isMaximizingPlayer);

            board[idx] = ''; // undo move

            if (isMaximizingPlayer) {
                if (result.score > bestScore || bestIndex === -1) { bestScore = result.score; bestIndex = idx; }
            } else {
                if (result.score < bestScore || bestIndex === -1) { bestScore = result.score; bestIndex = idx; }
            }
        }

        return { score: bestScore, index: bestIndex };
    }

    // --- AI Strategy Functions ---

    function getEasyMove(board) {
        var emptyCells = getEmptyCells(board);
        if (emptyCells.length === 0) return -1;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    /** Medium: shallow minimax depth=2 + 20% random mistake injection */
    function getMediumMove(board) {
        var emptyCells = getEmptyCells(board);
        if (emptyCells.length === 0) return -1;

        // 20% chance to make a completely random move (simulates human error)
        if (Math.random() < 0.2 && emptyCells.length > 1) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        var result = minimax(board, 2, true);
        return result.index;
    }

    /** Hard: full minimax (unbeatable) */
    function getHardMove(board) {
        var result = minimax(board, null, true);
        return result.index;
    }

    // --- AI Dispatcher ---
    function makeAIMove(board, difficulty) {
        if (difficulty === 'easy') return getEasyMove(board);
        else if (difficulty === 'medium') return getMediumMove(board);
        else return getHardMove(board); // default to hard
    }

    // --- Game Logic & UI ---
    function updateBoard() {
        for (var i = 0; i < cells.length; i++) {
            cells[i].textContent = currentBoard[i];
        }
    }

    function setStatus(msg, type) {
        statusDisplay.textContent = msg;
        statusDisplay.className = "status " + type;
    }

    function handleGameOver() {
        gameActive = false;
        var winner = checkWinner(currentBoard);
        if (winner) setStatus(winner + " wins!", "winner");
        else if (isBoardFull(currentBoard)) setStatus("It's a draw!", "draw");
    }

    function resetGame() {
        currentBoard = Array(9).fill('');
        gameActive = true;
        updateBoard();
        selectedDifficulty = difficultySelector.value || 'medium';
        setStatus("Ready! Make your move.", "player-x-turn");
    }

    // --- Event Listeners & Init ---
    cells.forEach(function(cell) {
        cell.addEventListener('click', function() {
            if (!gameActive || currentBoard[this.dataset.index] !== '') return;

            currentBoard[this.dataset.index] = PLAYER_X;
            updateBoard();

            if (checkWinner(currentBoard) || isBoardFull(currentBoard)) {
                handleGameOver();
                return;
            }

            // AI's turn with delay
            setTimeout(function() {
                if (!gameActive) return;
                var aiMove = makeAIMove(currentBoard, selectedDifficulty);
                if (aiMove !== -1 && currentBoard[aiMove] === '') {
                    currentBoard[aiMove] = PLAYER_O;
                    updateBoard();
                    if (checkWinner(currentBoard) || isBoardFull(currentBoard)) {
                        handleGameOver();
                    }
                }
            }, 500);
        });
    });

    difficultySelector.addEventListener('change', function() {
        selectedDifficulty = this.value;
        resetGame();
    });

    resetButton.addEventListener('click', resetGame);

    // Start
    resetGame();
});