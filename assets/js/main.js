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

async function firstFilterEvents(p) {
    await fetchData();
    eventsContainer = document.querySelector("#container");
    path = p;
    events = {
        index: data.events,
        upcoming: data.events.filter((e) => new Date(data.currentDate) < new Date(e.date)),
        past: data.events.filter((e) => new Date(data.currentDate) > new Date(e.date)),
        details: [data.events.find((e) => e.id == window.location.search.split("=")[1])],
    }[p];

    if (path !== "details") renderCategories();
    events.sort((event1, event2) => new Date(event2.date) - new Date(event1.date)); //Orden por fecha
    renderCards(events);
}

function filterEvents() {
    let filteredEvents = [];
    let checkedCategories = [...document.querySelectorAll('input[name="category"]:checked')].map((c) => c.value);
    let searchText = document.querySelector('input[type="search"]').value;

    filteredEvents = events.filter((event) => {
        let categoryMatch = checkedCategories.includes(event.category) || checkedCategories.length === 0; //Filtrado de eventos para cada event, si su categoria esta incluida en checkedCategories o si no se capturo ningun checked
        let searchMatch = JSON.stringify(event).toLowerCase().includes(searchText.toLowerCase());
        return categoryMatch && searchMatch;
    });

    if (filteredEvents.length === 0) filteredEvents = [notMatchEvent];
    renderCards(filteredEvents);
}

function renderCategories() {
    let categoryContainer = document.querySelector(".category-container");
    let categories = [];

    events.forEach((e) => !categories.includes(e.category) && categories.push(e.category));
    categories.forEach((c) => (categoryContainer.innerHTML += `<input type="checkbox" id="${c.replace(" ", "_")}" name="category" value="${c}" onChange="filterEvents()"><label for="${c.replace(" ", "_")}">${c}</label>`));
}

function renderCards(events) {
    if (!path.includes("details")) eventsContainer.innerHTML = "";

    events.forEach((e) => {
        let card;
        if (path.includes("details")) {
            card = document.querySelector(".card");
            card.querySelector(".event-capacity").innerHTML += e.capacity;
            card.querySelector(".event-assistance").innerHTML += e.assistance;
            card.querySelector("a").href += `?id=${e.id}`;
        } else {
            card = document.querySelector(".event-container").cloneNode(true);
            if (e.id !== 0) card.href = "details.html?id=" + e.id;
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

async function eventList() {
    await fetchData();
    let eventSelector = document.querySelector("#events");
    events = data.events.sort((a, b) => a.name.localeCompare(b.name));
    events.forEach((e) => (eventSelector.innerHTML += `<option value="${e.name}" ${e.id == window.location.search.split("=")[1] && "selected"}>${e.name}</option>`));
}

function handleSubmit(event) {
    event.preventDefault();
    const contactContent = document.querySelector("#contactContent");
    const formData = new FormData(event.target);
    toggleContactModal();

    for (const [key, value] of formData.entries()) {
        contactContent.innerHTML += value && `<div class="${key === "message" ? "md:col-span-2" : ""}"><p class="capitalize font-semibold">${key}</p><p class="opacity-70">${value}</p></div>`;
    }
    event.target.reset();
}

function toggleContactModal(clearContactContent) {
    document.querySelector("#contact-modal").classList.toggle("hidden");
    if (clearContactContent) contactContent.innerHTML = "";
}
