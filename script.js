document.addEventListener("DOMContentLoaded", function() {

    // --- Game State ---
    var board = Array(9).fill('');
    var currentPlayer = 'X';
    var isGameActive = true;
    var selectedDifficulty = document.getElementById("difficulty-select").value || "medium";

    var PLAYER_X = 'X';
    var PLAYER_O = 'O';
    var EMPTY = '';

    // --- DOM Elements ---
    var cells = Array.from(document.querySelectorAll(".cell"));
    var statusDisplay = document.getElementById("status-display");
    var resetButton = document.getElementById("reset-btn");
    var difficultySelect = document.getElementById("difficulty-select");

    // --- Winning Conditions ---
    var winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // --- Core Functions ---

    function renderBoard() {
        cells.forEach(function(cell, index) {
            cell.textContent = board[index];
            cell.classList.remove("player-x", "player-o");
            if (board[index] === PLAYER_X) {
                cell.classList.add("player-x");
            } else if (board[index] === PLAYER_O) {
                cell.classList.add("player-o");
            }
        });
    }

    function updateStatus(message, type) {
        statusDisplay.textContent = message;
        statusDisplay.className = "status " + type;
    }

    // --- Player Move ---

    cells.forEach(function(cell, index) {
        cell.addEventListener("click", function() {
            if (!isGameActive || board[index] !== EMPTY || currentPlayer === PLAYER_O) {
                return;
            }
            makeMove(index, PLAYER_X);
            checkGameStatus();

            if (isGameActive && currentPlayer === PLAYER_O) {
                setTimeout(aiMove, 400);
            }
        });
    });

    function makeMove(index, player) {
        board[index] = player;
        renderBoard();
    }

    // --- Game Status Checks ---

    function checkWinner(currentBoard) {
        if (!currentBoard) currentBoard = board;
        for (var i = 0; i < winningConditions.length; i++) {
            var cond = winningConditions[i];
            if (currentBoard[cond[0]] &&
                currentBoard[cond[0]] === currentBoard[cond[1]] &&
                currentBoard[cond[0]] === currentBoard[cond[2]]) {
                return currentBoard[cond[0]];
            }
        }
        return null;
    }

    function checkDraw(currentBoard) {
        var target = currentBoard || board;
        return target.every(function(cell) { return cell !== EMPTY; }) && !checkWinner(target);
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
    }

    function checkGameStatus() {
        var winner = checkWinner();
        if (winner) {
            isGameActive = false;
            updateStatus(winner + " wins!", "winner");
            return;
        }
        if (checkDraw()) {
            isGameActive = false;
            updateStatus("It's a draw!", "draw");
            return;
        }
        switchPlayer();
        var turnClass = currentPlayer === PLAYER_X ? "player-x-turn" : "player-o-turn";
        updateStatus(currentPlayer + "'s turn", turnClass);
    }

    // --- AI: Easy (completely random) ---

    function getEasyMove(currentBoard) {
        var available = [];
        for (var i = 0; i < 9; i++) {
            if (currentBoard[i] === EMPTY) available.push(i);
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    // --- AI: Medium (shallow minimax depth=2 + occasional mistakes) ---

    function getMediumMove(currentBoard) {
        var emptyCells = [];
        for (var i = 0; i < 9; i++) {
            if (currentBoard[i] === EMPTY) emptyCells.push(i);
        }
        // ~25% chance to make a random mistake
        if (Math.random() < 0.25 && emptyCells.length > 1) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        var bestVal = -Infinity, bestMove = emptyCells[0];
        for (var i = 0; i < emptyCells.length; i++) {
            currentBoard[i] = PLAYER_O;
            var moveVal = minimax(currentBoard, 2, false);
            currentBoard[i] = EMPTY;
            if (moveVal > bestVal) { bestVal = moveVal; bestMove = i; }
        }
        return bestMove;
    }

    // --- AI: Hard/Expert (full minimax — unbeatable) ---

    function getHardMove(currentBoard) {
        var bestVal = -Infinity, bestMove = -1;
        for (var i = 0; i < 9; i++) {
            if (currentBoard[i] === EMPTY) {
                currentBoard[i] = PLAYER_O;
                var moveVal = minimax(currentBoard, 0, false);
                currentBoard[i] = EMPTY;
                if (moveVal > bestVal) { bestVal = moveVal; bestMove = i; }
            }
        }
        return bestMove;
    }

    // --- Minimax Engine ---

    function evaluate(currentBoard) {
        var winner = checkWinner(currentBoard);
        if (winner === PLAYER_O) return 10;
        if (winner === PLAYER_X) return -10;
        return 0;
    }

    /**
     * @param {Array} board - current board state to evaluate recursively
     * @param {number|null} depthLeft - remaining depth budget; null = unlimited search
     * @param {boolean} isMaximizing - true for AI (PLAYER_O), false for player X
     */
    function minimax(board, depthLeft, isMaximizing) {
        var score = evaluate(board);

        // Terminal state: someone won
        if (score === 10) return score - ((depthLeft !== null && depthLeft !== undefined) ? depthLeft : 0);
        if (score === -10) return score + ((depthLeft !== null && depthLeft !== undefined) ? depthLeft : 0);
        if (checkDraw(board)) return 0;

        // Depth limit reached → return current evaluation without looking deeper
        if (depthLeft !== null && depthLeft !== undefined && depthLeft <= 0) {
            return evaluate(board);
        }

        var emptyCells = [];
        for (var i = 0; i < 9; i++) {
            if (board[i] === EMPTY) emptyCells.push(i);
        }

        if (isMaximizing) { // AI's turn
            var bestVal = -Infinity;
            for (var i = 0; i < emptyCells.length; i++) {
                board[emptyCells[i]] = PLAYER_O;
                var newVal = minimax(board,
                    (depthLeft !== null && depthLeft !== undefined) ? depthLeft - 1 : null,
                    false);
                board[emptyCells[i]] = EMPTY;
                if (newVal > bestVal) bestVal = newVal;
            }
            return bestVal;
        } else { // Player X's turn
            var bestVal = Infinity;
            for (var i = 0; i < emptyCells.length; i++) {
                board[emptyCells[i]] = PLAYER_X;
                var newVal = minimax(board,
                    (depthLeft !== null && depthLeft !== undefined) ? depthLeft - 1 : null,
                    true);
                board[emptyCells[i]] = EMPTY;
                if (newVal < bestVal) bestVal = newVal;
            }
            return bestVal;
        }
    }

    // --- AI Dispatcher ---

    function aiMove() {
        var moveIndex;
        switch (selectedDifficulty) {
            case "easy":   moveIndex = getEasyMove(board); break;
            case "medium": moveIndex = getMediumMove(board); break;
            default:       moveIndex = getHardMove(board); break; // hard/expert
        }
        if (moveIndex !== undefined && board[moveIndex] === EMPTY) {
            makeMove(moveIndex, PLAYER_O);
            checkGameStatus();
        }
    }

    // --- Difficulty Selector & Reset ---

    difficultySelect.addEventListener("change", function() {
        selectedDifficulty = this.value;
        resetGame();
    });

    resetButton.addEventListener("click", resetGame);

    function resetGame() {
        board = Array(9).fill(EMPTY);
        currentPlayer = PLAYER_X;
        isGameActive = true;
        renderBoard();
        updateStatus("Your turn (X)", "player-x-turn");
    }

    // --- Start ---
    resetGame();
});
