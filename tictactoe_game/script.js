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
        setTimeout(() => {
            const bestMove = getBestMove();
            makeMove(bestMove, 'O');
        }, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add('taken');
    cells[index].style.color = player === 'X' ? '#4ecca3' : '#e94560';

    const winner = getWinner(board);
    if (winner) {
        statusDisplay.innerText = winner === 'X' ? "You Win!" : "AI Wins!";
        gameActive = false;
        updateScore(winner);
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

function getWinner(currentBoard) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
            return currentBoard[a];
        }
    }
    return null;
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

function getBestMove() {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            let score = minimax(board, false); 
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(newBoard, isMaximizing) {
    const winner = getWinner(newBoard);
    if (winner === 'X') return -10;
    if (winner === 'O') return 10;
    if (newBoard.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = 'O';
                let score = minimax(newBoard, false);
                newBoard[i] = null;
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === null) {
                newBoard[i] = 'X';
                let score = minimax(newBoard, true);
                newBoard[i] = null;
                bestScore = Math.min(bestScore, score);
            }
        }
        return bestScore;
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
