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

let path;
let events = [];
let eventsContainer;

function firstFilterEvents(p) {
    path = p;
    if (path === "index") {
        events = data.events;
    } else if (path === "upcoming") {
        events = data.events.filter((e) => new Date(data.currentDate) < new Date(e.date));
    } else if (path === "past") {
        events = data.events.filter((e) => new Date(data.currentDate) > new Date(e.date));
    } else if (path === "details") {
        eventId = new URLSearchParams(window.location.search).get("id");
        events.push(data.events.find((e) => e._id == eventId));
    }

    if (path !== "details") renderCategories();

    eventsContainer = document.querySelector("#container");
    events.sort(function (event1, event2) {
        return new Date(event2.date) - new Date(event1.date);
    });
    renderCards(events);
}

function renderCategories() {
    let categoryContainer = document.querySelector(".category-container");
    let category = [];

    events.forEach((e) => {
        !category.includes(e.category) ? category.push(e.category) : undefined;
    });

    category.forEach((c) => (categoryContainer.innerHTML += `<input type="checkbox" id="${c}" name="category" value="${c}" onChange="filterEvents()"><label for="${c}">${c}</label>`));
}

function renderCards(events) {
    if (!path.includes("details")) eventsContainer.innerHTML = "";

    events.forEach((e) => {
        let card;
        if (path.includes("details")) {
            card = document.querySelector(".card");
            card.querySelector(".event-capacity").innerHTML += e.capacity;
            card.querySelector(".event-assistance").innerHTML += e.assistance;
        } else {
            card = document.querySelector(".event-container").cloneNode(true);
            card.href = "details.html?id=" + e._id;
        }

        if (new Date(data.currentDate) > new Date(e.date) && path.includes("index")) card.classList.add("grayscale");
        card.querySelector(".event-category").textContent = e.category;
        card.querySelector("img").src = e.image;
        card.querySelector(".event-title").textContent = e.name;
        card.querySelector(".event-description").textContent = e.description;
        card.querySelector(".event-price").innerHTML += e.price;
        card.querySelector(".event-place").innerHTML += e.place;
        renderDate(e, card);

        if (!path.includes("details")) eventsContainer.appendChild(card);
    });
}

function renderDate(currentEvent, card) {
    let dates = new Date(currentEvent.date).toDateString().split(" ");
    card.querySelector(".event-weekDay").textContent = dates[0];
    card.querySelector(".event-month").textContent = dates[1].toUpperCase();
    card.querySelector(".event-day").textContent = dates[2];
    card.querySelector(".event-year").textContent = dates[3];
}

function filterEvents() {
    let filteredEvents = [];
    let checkedCategories = [];
    let searchText = document.querySelector('input[type="search"]').value;
    //Captura de todos los input checked y agregados al array checkedCategories
    document.querySelectorAll('input[name="category"]:checked').forEach((c) => checkedCategories.push(c.value));

    //Filtrado de eventos para cada event, si su categoria esta incluida en checkedCategories o si no se capturo ningun checked
    filteredEvents = events.filter((event) => {
        let categoryMatch = checkedCategories.includes(event.category) || checkedCategories.length === 0;
        // let searchMatch = e.name.toLowerCase().includes(searchText.toLowerCase());
        let searchMatch = Object.keys(event).some((key) => event[key].toString().toLowerCase().includes(searchText.toLowerCase())); //Conversion a arrays los atributos del objeto evento. Funcion some() para verificar si cumple al menos una
        return categoryMatch && searchMatch;
    });

    renderCards(filteredEvents);
}
