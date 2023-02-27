const darkModeBtn = document.querySelector(".toggleDark-btn");
setDarkMode();

function setDarkMode() {
    document.documentElement.classList.toggle("dark", localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches));
    darkModeBtn.classList.toggle("bi-moon-fill", document.documentElement.classList.contains("dark"));
    darkModeBtn.classList.toggle("bi-moon", !document.documentElement.classList.contains("dark"));
    document.body.style.display = "flex";
}

function toggleDarkMode() {
    localStorage.theme = localStorage.theme === "dark" ? "light" : "dark";
    setDarkMode();
}

let path;
let events = [];
let eventsContainer;

function firstFilterEvents(p) {
    eventsContainer = document.querySelector("#container");
    path = p;
    events = {
        index: data.events,
        upcoming: data.events.filter((e) => new Date(data.currentDate) < new Date(e.date)),
        past: data.events.filter((e) => new Date(data.currentDate) > new Date(e.date)),
        details: [data.events.find((e) => e._id == window.location.search.split("=")[1])],
    }[p];

    if (path !== "details") renderCategories();
    events.sort((event1, event2) => new Date(event2.date) - new Date(event1.date)); //Orden por fecha
    renderCards(events);
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

function renderCategories() {
    let categoryContainer = document.querySelector(".category-container");
    let category = [];

    events.forEach((e) => !category.includes(e.category) && category.push(e.category));
    category.forEach((c) => (categoryContainer.innerHTML += `<input type="checkbox" id="${c.replace(" ", "_")}" name="category" value="${c}" onChange="filterEvents()"><label for="${c.replace(" ", "_")}">${c}</label>`));
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
    let dateArray = new Date(currentEvent.date).toDateString().split(" ");
    card.querySelector(".event-weekDay").textContent = dateArray[0];
    card.querySelector(".event-month").textContent = dateArray[1].toUpperCase();
    card.querySelector(".event-day").textContent = dateArray[2];
    card.querySelector(".event-year").textContent = dateArray[3];
}
