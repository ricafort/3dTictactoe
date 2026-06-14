document.addEventListener("DOMContentLoaded", function() {
    var statusDisplay = document.getElementById("status-display");
    var gameBoard = document.getElementById("game-board");
    var resetButton = document.getElementById("reset-btn");
    var cells = Array.from(document.querySelectorAll(".cell"));

    var PLAYER_X = 'X';
    var PLAYER_O = 'O';
    var EMPTY = '';

    var board = ['', '', '', '', '', '', '', '', ''];
    var currentPlayer = PLAYER_X;
    var isGameActive = true;
    var isVsAI = true;

    var winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function initializeGame() {
        board = Array(9).fill(EMPTY);
        currentPlayer = PLAYER_X;
        isGameActive = true;
        renderBoard();
        updateStatus(PLAYER_X + " turn", "player-x-turn");
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
        statusDisplay.className = "status " + type;
    }

    function handleCellClick(event) {
        var clickedCell = event.target;
        var clickedCellIndex = parseInt(clickedCell.dataset.index);

        if (board[clickedCellIndex] !== EMPTY || !isGameActive || currentPlayer === PLAYER_O) {
            return;
        }

        makeMove(clickedCellIndex, currentPlayer);
        checkGameStatus();

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

        switchPlayer();
        updateStatus(currentPlayer + "'s turn", currentPlayer === PLAYER_X ? "player-x-turn" : "player-o-turn");
    }

    function checkWinner(currentBoard) {
        if (!currentBoard) currentBoard = board;
        for (var i = 0; i < winningConditions.length; i++) {
            var cond = winningConditions[i];
            if (currentBoard[cond[0]] && currentBoard[cond[0]] === currentBoard[cond[1]] && currentBoard[cond[0]] === currentBoard[cond[2]]) {
                return currentBoard[cond[0]];
            }
        }
        return null;
    }

    function checkDraw(currentBoardState) {
        var targetBoard = currentBoardState || board;
        return targetBoard.every(function(cell) { return cell !== EMPTY; }) && !checkWinner(targetBoard);
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
    }

    function evaluate(currentBoard) {
        var winner = checkWinner(currentBoard);
        if (winner === PLAYER_O) return 10;
        if (winner === PLAYER_X) return -10;
        return 0;
    }

    function minimax(currentBoard, depth, isMaximizingPlayer) {
        var score = evaluate(currentBoard);
        if (score === 10) return score - depth;
        if (score === -10) return score + depth;
        if (checkDraw(currentBoard)) return 0;

        if (isMaximizingPlayer) {
            var best = -Infinity;
            for (var i = 0; i < 9; i++) {
                if (currentBoard[i] === EMPTY) {
                    currentBoard[i] = PLAYER_O;
                    best = Math.max(best, minimax(currentBoard, depth + 1, false));
                    currentBoard[i] = EMPTY;
                }
            }
            return best;
        } else {
            var best = Infinity;
            for (var i = 0; i < 9; i++) {
                if (currentBoard[i] === EMPTY) {
                    currentBoard[i] = PLAYER_X;
                    best = Math.min(best, minimax(currentBoard, depth + 1, true));
                    currentBoard[i] = EMPTY;
                }
            }
            return best;
        }
    }

    function findBestMove(currentBoard) {
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

    function aiMove() {
        if (!isGameActive || currentPlayer !== PLAYER_O) return;
        var bestMoveIndex = findBestMove(board);
        if (bestMoveIndex !== -1) {
            makeMove(bestMoveIndex, PLAYER_O);
            checkGameStatus();
        }
    }

    cells.forEach(function(cell) {
        cell.addEventListener("click", handleCellClick);
    });
    resetButton.addEventListener("click", initializeGame);
    initializeGame();
});