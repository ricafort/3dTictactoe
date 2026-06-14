const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const resetBtn = document.getElementById('resetBtn');

let board = Array(9).fill(null);
let currentPlayer = 'X'; // X is the human player
let gameActive = true;
let scoreX = 0;
let scoreO = 0;

const winningConditions = [
    [0, 1, 2], 
    [3, 4, 5], 
    [6, 7, 8], 
    [0, 3, 6], 
    [1, 4, 7], 
    [2, 5, 8], 
    [0, 4, 8], 
    [2, 4, 6]
];

function handleCellClick(e) {
    const cell = e.target;
    const index = cell.getAttribute('data-index');

    if (board[index] !== null || !gameActive || currentPlayer === 'O') {
        return;
    }

    makeMove(index, 'X');

    if (gameActive && currentPlayer === 'O') {
        statusDisplay.innerText = "AI is thinking...";
        // Small delay to make it feel more natural
        setTimeout(() => {
            const bestMove = minimax(board, 'O').index;
            makeMove(bestMove, 'O');
        }, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add('taken');
    cells[index].style.color = player === 'X' ? '#4ecca3' : '#e94560';

    if (checkWin(board, player)) {
        statusDisplay.innerText = player === 'X' ? "You Win!" : "AI Wins!";
        gameActive = false;
        updateScore(player);
        return;
    }

    if (board.every(cell => cell !== null)) {
        statusDisplay.innerText = "It's a Draw!";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (gameActive) {
        statusDisplay.innerText = currentPlayer === 'X' ? "Your Turn (X)" : "AI is thinking...";
    }
}

function checkWin(currentBoard, player) {
    return winningConditions.some(condition => {
        return condition.every(index => currentBoard[index] === player);
    });
}

function updateScore(winner) {
    if (winner === 'X') {
        scoreX++;
        scoreXDisplay.innerText = scoreX;
    }
    if (winner === 'O') {
        scoreO++;
        scoreODisplay.innerText = scoreO;
    }
}

function minimax(newBoard, player) {
    const availSpots = newBoard.filter(Bool).map((v, i) => v === null ? i : null).filter(v => v !== null);
    
    // Check for win/loss/draw
    if (checkWin(newBoard, 'X')) return { score: -10 };
    if (checkWin(newBoard, 'O')) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];
    for (let i = 0; i < 9; i++) {
        if (newBoard[i] === null) {
            newBoard[i] = player;
            moves.push(minimax(newBoard, player === 'X' ? 'O' : 'X'));
            newBoard[i] = null;
        }
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = 'O';
                let score = minimax(newBoard, 'X').score;
                newBoard[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return { score: bestScore, index: bestMove };
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = 'X';
                let score = minimax(newBoard, 'O').score;
                newBoard[i] = null;
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return { score: bestScore, index: bestMove };
    }
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    statusDisplay.innerText = "Your Turn (X)";
    cells.forEach(cell => {
        cell.innerText = "";
        cell.classList.remove('taken');
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
