document.addEventListener("DOMContentLoaded", function() {
    var statusDisplay = document.getElementById("status-display");
    var gameBoard = document.getElementById("game-board");
    var resetButton = document.getElementById("reset-btn");
    var cells = Array.from(document.querySelectorAll(".cell"));
    var difficultySelect = document.getElementById("difficulty-select");

    var PLAYER_X = 'X';
    var PLAYER_O = 'O';
    var EMPTY = '';

    var board = ['', '', '', '', '', '', '', '', ''];
    var currentPlayer = PLAYER_X;
    var isGameActive = true;
    var isVsAI = true; // Set to true for AI opponent

    // Difficulty levels: 'easy', 'medium', 'hard'
    var selectedDifficulty = difficultySelect.value || 'medium';

    var winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function initializeGame() {
        board = Array(9).fill(EMPTY);
        currentPlayer = PLAYER_X;
        isGameActive = true;
        renderBoard();
        updateStatus("Ready! Select difficulty if needed.", "player-x-turn");
    }

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
        statusDisplay.className = "status " + type; // Overwrites existing classes, ensuring only one status type is active
    }

    function handleCellClick(event) {
        var clickedCell = event.target;
        var clickedCellIndex = parseInt(clickedCell.dataset.index);

        // Prevent moves if game is not active, cell is occupied, or it's AI's turn
        if (!isGameActive || board[clickedCellIndex] !== EMPTY || (isVsAI && currentPlayer === PLAYER_O)) {
            return;
        }

        makeMove(clickedCellIndex, currentPlayer);
        checkGameStatus();

        // If game is still active and it's AI's turn, make AI move after a short delay
        if (isGameActive && isVsAI && currentPlayer === PLAYER_O) {
            setTimeout(aiMove, 500); 
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
            updateStatus(winner + " wins!", "winner");
            return;
        }

        if (checkDraw()) {
            isGameActive = false;
            updateStatus("It's a draw!", "draw");
            return;
        }

        // If no winner and no draw, switch player
        switchPlayer();
        updateStatus(currentPlayer + "'s turn", currentPlayer === PLAYER_X ? "player-x-turn" : "player-o-turn");
    }

    function checkWinner(currentBoard) {
        if (!currentBoard) currentBoard = board; // Use global board if no specific board is passed
        for (var i = 0; i < winningConditions.length; i++) {
            var cond = winningConditions[i];
            if (currentBoard[cond[0]] && 
                currentBoard[cond[0]] === currentBoard[cond[1]] && 
                currentBoard[cond[0]] === currentBoard[cond[2]]) {
                return currentBoard[cond[0]]; // Return the winning player (X or O)
            }
        }
        return null; // No winner
    }

    function checkDraw(currentBoardState) {
        var targetBoard = currentBoardState || board;
        // Check if all cells are filled AND there is no winner
        return targetBoard.every(function(cell) { return cell !== EMPTY; }) && !checkWinner(targetBoard);
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
    }

    // Easy difficulty: Random moves
    function aiMoveEasy(currentBoard) {
        var availableMoves = [];
        for (var i = 0; i < 9; i++) {
            if (currentBoard[i] === EMPTY) {
                availableMoves.push(i);
            }
        }
        return Math.floor(Math.random() * availableMoves.length);
    }

    // Medium difficulty: Shallow minimax with depth limit (2-3)
    function aiMoveMedium(currentBoard) {
        var bestVal = -Infinity;
        var bestMove = -1;

        for (var i = 0; i < 9; i++) {
            if (currentBoard[i] === EMPTY) {
                currentBoard[i] = PLAYER_O;
                var moveVal = minimax(currentBoard, 2, false);
                currentBoard[i] = EMPTY;

                if (moveVal > bestVal) {
                    bestVal = moveVal;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    // Hard/Expert difficulty: Full minimax with complete evaluation (unbeatable)
    function aiMoveHard(currentBoard) {
        var bestVal = -Infinity;
        var bestMove = -1;

        for (var i = 0; i < 9; i++) {
            if (currentBoard[i] === EMPTY) {
                currentBoard[i] = PLAYER_O;
                var moveVal = minimax(currentBoard, 0, false);
                currentBoard[i] = EMPTY;

                if (moveVal > bestVal) {
                    bestVal = moveVal;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    // Minimax AI functions
    function evaluate(currentBoard) {
        var winner = checkWinner(currentBoard);
        if (winner === PLAYER_O) return 10; // AI wins
        if (winner === PLAYER_X) return -10; // Player X wins
        return 0; // Draw or game still in progress
    }

    function minimax(currentBoard, depth, isMaximizingPlayer) {
        var score = evaluate(currentBoard);

        // Base cases: If game is over, return score adjusted by depth
        if (score === 10) return score - depth; // AI wins: Prefer quicker wins
        if (score === -10) return score + depth; // Player X wins: Prefer delaying loss
        if (checkDraw(currentBoard)) return 0; // Draw

        if (isMaximizingPlayer) { // AI's turn (PLAYER_O)
            var best = -Infinity;
            for (var i = 0; i < 9; i++) {
                if (currentBoard[i] === EMPTY) {
                    currentBoard[i] = PLAYER_O; // Make the move
                    best = Math.max(best, minimax(currentBoard, depth + 1, false)); // Recurse for opponent
                    currentBoard[i] = EMPTY; // Undo the move (backtrack)
                }
            }
            return best;
        } else { // Player X's turn (Minimizing player)
            var best = Infinity;
            for (var i = 0; i < 9; i++) {
                if (currentBoard[i] === EMPTY) {
                    currentBoard[i] = PLAYER_X; // Make the move
                    best = Math.min(best, minimax(currentBoard, depth + 1, true)); // Recurse for AI
                    currentBoard[i] = EMPTY; // Undo the move (backtrack)
                }
            }
            return best;
        }
    }

    function findBestMove(currentBoard) {
        if (selectedDifficulty === 'easy') {
            return aiMoveEasy(currentBoard);
        } else if (selectedDifficulty === 'medium') {
            return aiMoveMedium(currentBoard);
        } else {
            return aiMoveHard(currentBoard); // Hard/Expert: Full minimax
        }
    }

    function aiMove() {
        if (!isGameActive || currentPlayer !== PLAYER_O) return; // Ensure it's AI's turn and game is active
        var bestMoveIndex = findBestMove(board);
        if (bestMoveIndex !== -1) { // If a valid move is found
            makeMove(bestMoveIndex, PLAYER_O);
            checkGameStatus();
        }
    }

    // Event Listeners
    cells.forEach(function(cell) {
        cell.addEventListener("click", handleCellClick);
    });
    resetButton.addEventListener("click", initializeGame);

    // Initial game setup
    initializeGame();
});