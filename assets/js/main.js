const darkModeBtn = document.getElementById("toggleDarkButton");
checkTheme();

function checkTheme() {
    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
        darkModeBtn.classList.add("bi-moon-fill");
    } else {
        document.documentElement.classList.remove("dark");
        darkModeBtn.classList.add("bi-moon");
    }
    document.body.style.display = "flex";
}

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark") ? (localStorage.theme = "dark") : (localStorage.theme = "light");
    darkModeBtn.classList.toggle("bi-moon");
    darkModeBtn.classList.toggle("bi-moon-fill");
}
