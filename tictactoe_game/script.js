document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const gameStatusElement = document.getElementById('gameStatus');
    const restartButton = document.getElementById('restartButton');
    const playerScoreElement = document.getElementById('playerScore');
    const aiScoreElement = document.getElementById('aiScore');

    let board; // Represents the game board: 0-8 for empty cells, 'X' or 'O' for occupied
    const huPlayer = 'X'; // Human player
    const aiPlayer = 'O'; // AI player
    let currentPlayer = huPlayer; // 'X' always starts
    let gameOver = false;
    let scores = {
        'X': 0,
        'O': 0
    };

    // All possible winning combinations for a 3x3 Tic-Tac-Toe board
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // --- Game Initialization & Reset ---
    function initializeGame() {
        // Reset board: each element is its index, signifying it's empty
        board = Array.from(Array(9).keys());
        gameOver = false;
        currentPlayer = huPlayer; // Always start with human player
        gameStatusElement.textContent = `Your Turn (${huPlayer})`;
        renderBoard(); // Draw the board
        updateScoreDisplay(); // Update scores display
        
        // Remove winning animation class from all cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('winning');
        });
    }

    // --- Rendering Functions ---
    function renderBoard() {
        boardElement.innerHTML = ''; // Clear existing cells
        board.forEach((cell, index) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.index = index; // Store index for event handling
            
            // If cell is occupied, display X or O, otherwise empty
            cellDiv.textContent = typeof cell === 'number' ? '' : cell; 
            
            if (typeof cell !== 'number') { // If cell is not empty
                cellDiv.classList.add(cell.toLowerCase()); // Add 'x' or 'o' class for styling
                cellDiv.style.cursor = 'default'; // No hover cursor for occupied cells
            } else if (!gameOver) {
                // Only add click listener if game is not over and cell is empty
                cellDiv.addEventListener('click', handleCellClick);
            }
            boardElement.appendChild(cellDiv);
        });
    }

    function updateScoreDisplay() {
        playerScoreElement.textContent = scores[huPlayer];
        aiScoreElement.textContent = scores[aiPlayer];
    }

    function updateGameStatus(message) {
        gameStatusElement.textContent = message;
    }

    function markWinningCells(combo) {
        combo.forEach(index => {
            const cell = document.querySelector(`.cell[data-index='${index}']`);
            if (cell) {
                cell.classList.add('winning');
            }
        });
    }

    // --- Core Game Logic ---
    function checkWin(boardToCheck, player) {
        // Filter winCombos to find any where all cells match the player
        let wins = winCombos.filter(combo =>
            combo.every(index => boardToCheck[index] === player)
        );
        return wins.length > 0 ? wins[0] : null; // Return the winning combo (e.g., [0,1,2]) or null
    }

    function getEmptyCells(boardToCheck) {
        // Return an array of indices where the board cells are numbers (empty)
        return boardToCheck.filter(cell => typeof cell === 'number');
    }

    function checkDraw(boardToCheck) {
        // A draw occurs if there are no empty cells AND no one has won
        return getEmptyCells(boardToCheck).length === 0 && !checkWin(boardToCheck, huPlayer) && !checkWin(boardToCheck, aiPlayer);
    }

    function placeMark(index, player) {
        board[index] = player; // Update the internal board array
        const cellDiv = document.querySelector(`.cell[data-index='${index}']`);
        if (cellDiv) {
            cellDiv.textContent = player; // Update the UI
            cellDiv.classList.add(player.toLowerCase());
            cellDiv.style.cursor = 'default'; // No more clicking this cell
            cellDiv.removeEventListener('click', handleCellClick); // Remove listener
        }
    }

    function endGame(winnerCombo, winner) {
        gameOver = true;
        if (winnerCombo) {
            markWinningCells(winnerCombo);
            updateGameStatus(`${winner === huPlayer ? 'You' : 'AI'} Win!`);
            scores[winner]++; // Increment winner's score
        }
        else {
            updateGameStatus('Draw!');
        }
        updateScoreDisplay();
        
        // Disable all remaining click listeners on the board
        document.querySelectorAll('.cell').forEach(cell => {
            cell.removeEventListener('click', handleCellClick);
            cell.style.cursor = 'default';
        });
    }

    // --- Human Player (X) Logic ---
    function handleCellClick(event) {
        // Do nothing if game is over or it's not human's turn
        if (gameOver || currentPlayer !== huPlayer) return;

        const index = parseInt(event.target.dataset.index);

        // Check if the clicked cell is empty
        if (typeof board[index] === 'number') {
            placeMark(index, huPlayer);
            let winCombo = checkWin(board, huPlayer);

            if (winCombo) {
                endGame(winCombo, huPlayer);
            } else if (checkDraw(board)) {
                endGame(null);
            } else {
                currentPlayer = aiPlayer;
                updateGameStatus('AI is thinking...');
                setTimeout(aiMove, 700);
            }
        }
    }

    // --- AI Player (O) Logic (Minimax Algorithm) ---
    function aiMove() {
        if (gameOver) return;

        let bestSpot = findBestMove(board, aiPlayer);
        placeMark(bestSpot.index, aiPlayer);

        let winCombo = checkWin(board, aiPlayer);
        if (winCombo) {
            endGame(winCombo, aiPlayer);
        } else if (checkDraw(board)) {
            endGame(null);
        } else {
            currentPlayer = huPlayer;
            updateGameStatus(`Your Turn (${huPlayer})`);
        }
    }

    // Minimax algorithm to find the optimal move
    function findBestMove(newBoard, player) {
        let availSpots = getEmptyCells(newBoard);

        if (checkWin(newBoard, huPlayer)) {
            return { score: -10 };
        }
        else if (checkWin(newBoard, aiPlayer)) {
            return { score: 10 };
        }
        else if (availSpots.length === 0) {
            return { score: 0 };
        }

        let moves = [];

        for (let i = 0; i < availSpots.length; i++) {
            let move = {};
            move.index = availSpots[i];

            newBoard[availSpots[i]] = player;

            if (player === aiPlayer) {
                let result = findBestMove(newBoard, huPlayer);
                move.score = result.score;
            } else {
                let result = findBestMove(newBoard, aiPlayer);
                move.score = result.score;
            }

            newBoard[availSpots[i]] = move.index;
            moves.push(move);
        }

        let bestMove;
        if (player === aiPlayer) {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = moves[i];
                }
            }
        }
        else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = moves[i];
                }
            }
        }
        return bestMove;
    }

    // --- Event Listeners ---
    restartButton.addEventListener('click', initializeGame);

    // Initial game setup when the page loads
    initializeGame();
});