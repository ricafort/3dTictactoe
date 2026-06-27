// --- Game State ---
var board = Array(9).fill('');
var currentPlayer = 'X';
var isGameActive = true;

// --- DOM Elements (cached at init) ---
var cells, statusDisplay, resetButton, difficultySelect;

// --- Winning Conditions ---
var winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// --- Core Functions ---

function renderBoard() {
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        cell.textContent = board[i];
        cell.classList.remove("player-x", "player-o");
        if (board[i] === 'X') {
            cell.classList.add("player-x");
        } else if (board[i] === 'O') {
            cell.classList.add("player-o");
        }
    }
}

function updateStatus(message, type) {
    statusDisplay.textContent = message;
    statusDisplay.className = "status " + type;
}

// --- Player Move via click on cell by index (avoids `this` binding issues with arrow functions) ---

function initClickHandlers() {
    cells.forEach(function(cell, index) {
        cell.addEventListener("click", function(idx) {
            return function() { handlePlayerMove(idx); };
        }(index));
    });
}

function handlePlayerMove(index) {
    if (!isGameActive || board[index] !== '' || currentPlayer === 'O') {
        return;
    }
    makeMove(index, 'X');
    checkGameStatus();

    if (isGameActive && currentPlayer === 'O') {
        setTimeout(aiMove, 400);
    }
}

function makeMove(index, player) {
    board[index] = player;
    renderBoard();
}

// --- Game Status Checks ---

function checkWinner(currentBoard) {
    var target = currentBoard || board;
    for (var i = 0; i < winningConditions.length; i++) {
        var cond = winningConditions[i];
        if (target[cond[0]] &&
            target[cond[0]] === target[cond[1]] &&
            target[cond[0]] === target[cond[2]]) {
            return target[cond[0]];
        }
    }
    return null;
}

function checkDraw(currentBoard) {
    var target = currentBoard || board;
    for (var i = 0; i < 9; i++) {
        if (target[i] === '') return false;
    }
    return true;
}

function switchPlayer() {
    currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
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
    var turnClass = currentPlayer === 'X' ? "player-x-turn" : "player-o-turn";
    updateStatus(currentPlayer + "'s turn", turnClass);
}

// --- AI: Easy (completely random) ---

function getEasyMove() {
    var available = [];
    for (var i = 0; i < 9; i++) {
        if (board[i] === '') available.push(i);
    }
    return available[Math.floor(Math.random() * available.length)];
}

// --- AI: Medium (shallow minimax depth=2 + heuristic + occasional mistakes) ---

function getMediumMove() {
    var emptyCells = [];
    for (var i = 0; i < 9; i++) {
        if (board[i] === '') emptyCells.push(i);
    }
    // ~25% chance to make a random mistake
    if (Math.random() < 0.25 && emptyCells.length > 1) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    var bestVal = -Infinity, bestMove = emptyCells[0];
    for (var i = 0; i < emptyCells.length; i++) {
        board[emptyCells[i]] = 'O';          // FIX: use emptyCells[i], not loop index i
        var moveVal = minimax(board.slice(), 2, false);
        board[emptyCells[i]] = '';            // FIX: use emptyCells[i], not loop index i
        if (moveVal > bestVal) {
            bestVal = moveVal;
            bestMove = emptyCells[i];          // FIX: return actual cell value, not loop index
        }
    }
    return bestMove;
}

// --- AI: Hard/Expert (full minimax — unbeatable) ---

function getHardMove() {
    var emptyCells = [];
    for (var i = 0; i < 9; i++) {
        if (board[i] === '') emptyCells.push(i);
    }
    // Edge case: no valid moves at all
    if (emptyCells.length === 0) return -1;

    var bestVal = -Infinity, bestMove = emptyCells[0];
    for (var i = 0; i < emptyCells.length; i++) {
        board[emptyCells[i]] = 'O';
        var moveVal = minimax(board.slice(), null, false);
        board[emptyCells[i]] = '';
        if (moveVal > bestVal) {
            bestVal = moveVal;
            bestMove = emptyCells[i];
        }
    }
    return bestMove;
}

// --- Minimax Engine ---

function evaluate(currentBoard) {
    var winner = checkWinner(currentBoard);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    return 0;
}

/**
 * Heuristic evaluation for non-terminal positions.
 * Counts open lines (rows/cols/diags) for each player and scores accordingly.
 */
function heuristicEvaluate(currentBoard) {
    var score = 0;
    // For each winning condition line, count how many cells are X or O
    for (var i = 0; i < winningConditions.length; i++) {
        var cond = winningConditions[i];
        var xCount = 0, oCount = 0, emptyInLine = 0;
        for (var j = 0; j < 3; j++) {
            if (currentBoard[cond[j]] === 'X') xCount++;
            else if (currentBoard[cond[j]] === 'O') oCount++;
            else emptyInLine++;
        }
        // Reward O's open lines, penalize X's open lines
        if (oCount > 0 && emptyInLine > 0) score += oCount * 3;
        if (xCount > 0 && emptyInLine > 0) score -= xCount * 3;
    }
    return score;
}

/**
 * @param {Array} board - current board state to evaluate recursively (passed by copy)
 * @param {number|null} depthLeft - remaining depth budget; null = unlimited search
 * @param {boolean} isMaximizing - true for AI ('O'), false for player X
 */
function minimax(board, depthLeft, isMaximizing) {
    var score = evaluate(board);

    // Terminal state: someone won
    if (score === 10) return score - ((depthLeft !== null && depthLeft !== undefined) ? depthLeft : 0);
    if (score === -10) return score + ((depthLeft !== null && depthLeft !== undefined) ? depthLeft : 0);
    if (checkDraw(board)) return 0;

    // Depth limit reached → use heuristic instead of plain evaluate()
    if (depthLeft !== null && depthLeft !== undefined && depthLeft <= 0) {
        return heuristicEvaluate(board.slice());
    }

    var emptyCells = [];
    for (var i = 0; i < 9; i++) {
        if (board[i] === '') emptyCells.push(i);
    }

    if (isMaximizing) { // AI's turn ('O')
        var bestVal = -Infinity;
        for (var i = 0; i < emptyCells.length; i++) {
            board[emptyCells[i]] = 'O';
            var newVal = minimax(board,
                (depthLeft !== null && depthLeft !== undefined) ? depthLeft - 1 : null,
                false);
            board[emptyCells[i]] = '';
            if (newVal > bestVal) bestVal = newVal;
        }
        return bestVal;
    } else { // Player X's turn
        var bestVal = Infinity;
        for (var i = 0; i < emptyCells.length; i++) {
            board[emptyCells[i]] = 'X';
            var newVal = minimax(board,
                (depthLeft !== null && depthLeft !== undefined) ? depthLeft - 1 : null,
                true);
            board[emptyCells[i]] = '';
            if (newVal < bestVal) bestVal = newVal;
        }
        return bestVal;
    }
}

// --- AI Dispatcher ---

function aiMove() {
    var moveIndex;
    switch (selectedDifficulty) {
        case "easy":   moveIndex = getEasyMove(); break;
        case "medium": moveIndex = getMediumMove(); break;
        default:       moveIndex = getHardMove(); break; // hard/expert
    }
    if (moveIndex >= 0 && board[moveIndex] === '') {
        makeMove(moveIndex, 'O');
        checkGameStatus();
    }
}

// --- Difficulty Selector & Reset ---

var selectedDifficulty;

function init() {
    cells = Array.from(document.querySelectorAll(".cell"));
    statusDisplay = document.getElementById("status-display");
    resetButton = document.getElementById("reset-btn");
    difficultySelect = document.getElementById("difficulty-select");
    selectedDifficulty = difficultySelect.value || "easy";

    initClickHandlers();

    difficultySelect.addEventListener("change", function() {
        selectedDifficulty = this.value;
        resetGame();
    });

    resetButton.addEventListener("click", resetGame);
}

document.addEventListener("DOMContentLoaded", function() {
    init();
    resetGame();
});

function resetGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    isGameActive = true;
    renderBoard();
    updateStatus("Your turn (X)", "player-x-turn");
}
