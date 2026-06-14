document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("action-btn");
    const output = document.getElementById("output");
    let clicks = 0;

    btn.addEventListener("click", () => {
        clicks++;
        output.textContent = `Button clicked ${clicks} time(s)!`;
    });
});
