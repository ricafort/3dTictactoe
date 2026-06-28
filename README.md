# 🎮 3D Tic-Tac-Toe

A modern, interactive implementation of the classic 3D Tic-Tac-Toe game (also known as Qubic). Play against an AI on a fully rotatable 3x3x3 grid in your browser.

## ✨ Features

*   **True 3D Gameplay:** A 3x3x3 board with 27 winning lines (rows, columns, pillars, face diagonals, and space diagonals).
*   **Intuitive Controls:**
    *   **Drag to Rotate:** Click and drag (or swipe on mobile) to rotate the cube and inspect the board from any angle.
    *   **Click to Play:** Tap an empty cell to place your mark. The game intelligently distinguishes between a click and a drag.
*   **Smart AI:** Choose from Easy, Medium, or Hard difficulty levels. The AI blocks your moves and attempts to set up its own winning lines.
*   **Visual Feedback:**
    *   **Whole-Block Coloring:** When a cell is taken, the entire small cube changes color (Red for X, Blue for O).
    *   **Win Highlighting:** Winning lines glow green to clearly show how the game was won.
    *   **Hover Effects:** Clean glow effects on empty cells to guide your moves.
*   **Explode View:** A button to "explode" the cube, separating the layers for a clearer view of the internal structure.

## 🛠️ Tech Stack

*   **HTML5:** Semantic structure.
*   **CSS3:** 3D transforms (`perspective`, `transform-style: preserve-3d`), variables, and responsive design.
*   **JavaScript (ES6+):** Vanilla JS for game logic, DOM manipulation, and AI algorithms (no heavy frameworks required).

## 🚀 How to Play

1.  **Start:** You play as **X** (Red). The AI plays as **O** (Blue).
2.  **Rotate:** If you can't see a good spot, click and drag anywhere on the board to spin it.
3.  **Move:** Click on any empty white block to place your X.
4.  **Win:** Get 3 of your marks in a row along any axis (horizontal, vertical, depth, or diagonal).

## 📂 Project Structure

```text
├── index.html      # Main HTML structure
├── styles.css      # CSS for layout, 3D scene, and animations
├── script.js       # Game logic, AI, and event handling
└── README.md       # This documentation file
```

## 💻 Running Locally

Simply open `index.html` in any modern web browser. No build process or server is required for this static implementation.

## 🤝 Contributing

Feel free to fork this repository and submit pull requests if you have improvements for the AI logic or visual style!

---
*Built with ❤️ using Vanilla Web Technologies*