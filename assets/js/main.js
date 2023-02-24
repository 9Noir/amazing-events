const darkModeBtn = document.querySelector(".toggleDark-btn");
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

// let category = [];
// data.events.forEach((e) => {
//     !category.includes(e.category) ? category.push(e.category) : undefined;
// });

// let categoryContainer = document.querySelector(".category-container");
// category.forEach((c) => (categoryContainer.innerHTML += `<input type="checkbox" id="${c}" name="category" value="${c}" onChange="filterEvents()"><label for="${c}">${c}</label>`));

let events=[];
let path = location.pathname;
let pathCards = ["index", "upcoming", "past", "details"];

if (path.includes(pathCards[0])) {
    events = data.events;
} else if (path.includes(pathCards[1])) {
    events = data.events.filter((e) => new Date(data.currentDate) < new Date(e.date));
} else if (path.includes(pathCards[2])) {
    events = data.events.filter((e) => new Date(data.currentDate) > new Date(e.date));
} else if (path.includes(pathCards[3])) {
    eventId = new URLSearchParams(window.location.search).get('id');
    events.push(data.events.find((e) => e._id == eventId));
}

//Para renderizar solo en las pathCards
if (pathCards.some((p) => path.includes(p))) {
    var eventsContainer = document.querySelector(".events-container");
    //Render de todos los eventos
    renderCards(events);
}

function renderCards(events) {
    if(!path.includes("details"))eventsContainer.innerHTML = "";
    events.forEach((e) => {
        let card;
        if (path.includes("details")) {
            card = document.querySelector(".card");
            card.querySelector(".event-capacity").innerHTML += e.capacity;
        } else {
            card = document.querySelector(".event-container").cloneNode(true);
            card.classList.remove("hidden");
            card.href = "details.html?id=" + e._id;
        }

        new Date(data.currentDate) > new Date(e.date) && path.includes("index") ? card.classList.add("grayscale") : undefined;
        card.querySelector(".event-category").textContent = e.category;
        card.querySelector("img").src = e.image;
        card.querySelector(".event-title").textContent = e.name;
        card.querySelector(".event-description").textContent = e.description;
        card.querySelector(".event-assistance").innerHTML += e.assistance;
        card.querySelector(".event-date").innerHTML += e.date;
        card.querySelector(".event-price").innerHTML += e.price;
        card.querySelector(".event-place").innerHTML += e.place;
        if(!path.includes("details"))eventsContainer.appendChild(card);
    });
}

function filterEvents() {
    let filteredEvents = [];
    let checkedCategories = [];
    let searchText = document.querySelector('input[type="search"]').value;

    //Captura de todos los input checked y agregados al array checkedCategories
    document.querySelectorAll('input[name="category"]:checked').forEach((c) => checkedCategories.push(c.value));

    //Comprobación para cada evento(e) si su categoria esta incluida en checkedCategories o si no se capturo ningun checked
    events.forEach((e) => {
        let categoryMatch = checkedCategories.includes(e.category) || checkedCategories.length === 0;
        let searchMatch = e.name.toLowerCase().includes(searchText.toLowerCase());
        if (!categoryMatch || !searchMatch) return;
        filteredEvents.push(e); //Si no hubo match en categoria o en search, se sigue con el siguiente, sino se agrega a filteredEvents
    });
    renderCards(filteredEvents); //Render de cards con los eventos filtrados
}
