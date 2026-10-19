const GAME_NAME = "Tic-Tac-Toe";
const PLAYER = "X";
const AI = "O";
const EMPTY = "";

const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const PLAYER_NAMES = {
    [PLAYER]: "Player",
    [AI]: "AI"
};

const AI_DELAY = 350;

const cells = [...document.querySelectorAll(".cell")];
const statusText = document.getElementById("status");
const difficultySelect = document.getElementById("difficulty");
const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");

let board = Array(9).fill(EMPTY);
let difficulty = "normal";
let gameOver = false;
let playerTurn = true;
let aiTimer = null;

function renderBoard() {
    cells.forEach((cell, index) => {
        const value = board[index];

        cell.textContent = value;
        cell.classList.toggle("x", value === PLAYER);
        cell.classList.toggle("o", value === AI);

        cell.disabled =
            gameOver ||
            !playerTurn ||
            value !== EMPTY;

        cell.setAttribute(
            "aria-label",
            `Position ${index + 1}: ${value || "empty"}`
        );
    });
}

function setStatus(message) {
    statusText.textContent = message;
}

function getWinner() {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;

        if (
            board[a] !== EMPTY &&
            board[a] === board[b] &&
            board[b] === board[c]
        ) {
            return {
                winner: board[a],
                combination
            };
        }
    }

    return null;
}

function isDraw() {
    return board.every(cell => cell !== EMPTY) &&
        getWinner() === null;
}

function getEmptySpaces() {
    return board.reduce((spaces, value, index) => {
        if (value === EMPTY) {
            spaces.push(index);
        }

        return spaces;
    }, []);
}

function findWinningMove(symbol) {
    for (const position of getEmptySpaces()) {
        board[position] = symbol;

        const wins = getWinner()?.winner === symbol;

        board[position] = EMPTY;

        if (wins) {
            return position;
        }
    }

    return -1;
}

function getRandomMove() {
    const spaces = getEmptySpaces();

    if (spaces.length === 0) {
        return -1;
    }

    return spaces[Math.floor(Math.random() * spaces.length)];
}

function getAIMove() {
    if (difficulty === "easy") {
        return getRandomMove();
    }

    let position = findWinningMove(AI);

    if (position !== -1) {
        return position;
    }

    position = findWinningMove(PLAYER);

    if (position !== -1) {
        return position;
    }

    if (difficulty === "hard" && board[4] === EMPTY) {
        return 4;
    }

    return getRandomMove();
}

function makeAIMove() {
    if (gameOver) {
        return;
    }

    const position = getAIMove();

    if (position === -1) {
        finishGame();
        return;
    }

    board[position] = AI;

    setStatus(`${PLAYER_NAMES[AI]} chose position ${position + 1}.`);

    renderBoard();

    if (finishGame()) {
        return;
    }

    playerTurn = true;

    setStatus("Your turn! Choose an empty square.");

    renderBoard();
}

function highlightWinningCells(combination) {
    if (!combination) {
        return;
    }

    combination.forEach(index => {
        cells[index].classList.add("winning");
    });
}

function finishGame() {
    const result = getWinner();

    if (result) {
        gameOver = true;
        playerTurn = false;

        highlightWinningCells(result.combination);

        setStatus(
            result.winner === PLAYER
                ? "You win! Great job!"
                : "AI wins! Try again!"
        );

        renderBoard();
        return true;
    }

    if (isDraw()) {
        gameOver = true;
        playerTurn = false;

        setStatus("It's a draw! Well played.");

        renderBoard();
        return true;
    }

    return false;
}

function handlePlayerMove(event) {
    const position = Number(event.currentTarget.dataset.index);

    if (
        gameOver ||
        !playerTurn ||
        board[position] !== EMPTY
    ) {
        return;
    }

    board[position] = PLAYER;
    playerTurn = false;

    renderBoard();

    if (finishGame()) {
        return;
    }

    setStatus("AI is thinking...");

    aiTimer = window.setTimeout(() => {
        aiTimer = null;
        makeAIMove();
    }, AI_DELAY);
}

function startNewGame() {
    if (aiTimer !== null) {
        window.clearTimeout(aiTimer);
        aiTimer = null;
    }

    board = Array(9).fill(EMPTY);
    difficulty = difficultySelect.value;
    gameOver = false;
    playerTurn = true;

    cells.forEach(cell => {
        cell.classList.remove("winning");
    });

    setStatus(
        `New game started! Difficulty: ${difficulty.toUpperCase()}`
    );

    renderBoard();
}

cells.forEach(cell => {
    cell.addEventListener("click", handlePlayerMove);
});

startButton.addEventListener("click", startNewGame);
restartButton.addEventListener("click", startNewGame);

document.title = `${GAME_NAME}: Player vs AI`;

startNewGame();
