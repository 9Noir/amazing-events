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

let [path, data, events, eventsContainer] = [];
const eventNotFound = [
    {
        id: 0,
        image: "https://i.ibb.co/HzD6k2W/image.png",
        name: "No results found",
        date: new Date(),
        description: "Sorry, we couldn't find any matching events. Please try again with different search criteria.",
        category: "Event",
        place: "",
        capacity: "",
        assistance: "",
        price: "",
    },
];

function fetchData(params) {
    let url = `https://api-amazingevents.onrender.com/api/amazing-events${params || ""}`;
    return fetch(url).then((response) => response.json());
}

async function firstFilterEvents(p) {
    eventsContainer = document.querySelector("#container");
    path = p || "";

    if (p === "details") {
        events = [(await fetchData("/" + window.location.search.split("=")[1])).response];
    } else {
        data = await fetchData(p && "?time=" + p);
        events = data.events;
        renderCategories();
    }

    events.sort((event1, event2) => new Date(event2.date) - new Date(event1.date)); //Orden por fecha
    renderCurrentDate();
    renderCards(events);
}

function filterEvents() {
    let checkedCategories = [...document.querySelectorAll('input[name="category"]:checked')].map((c) => c.value);
    let searchText = document.querySelector('input[type="search"]').value;
    let filteredEvents = events.filter((event) => {
        let categoryMatch = checkedCategories.includes(event.category) || checkedCategories.length === 0; //Filtrado de eventos para cada event, si su categoria esta incluida en checkedCategories o si no se capturo ningun checked
        let searchMatch = JSON.stringify(event).toLowerCase().includes(searchText.toLowerCase());
        return categoryMatch && searchMatch;
    });

    if (filteredEvents.length === 0) filteredEvents = eventNotFound;
    renderCards(filteredEvents);
}

function getUniqueCategories(events) {
    return [...new Set(events.map((event) => event.category))].sort((a, b) => a.localeCompare(b));
}

function renderCategories() {
    let [categoryContainer, categories, html] = [document.querySelector(".category-container"), getUniqueCategories(events), ""];

    categories.forEach((c) => (html += `<input type="checkbox" id="${c.replace(" ", "_")}" name="category" value="${c}" onChange="filterEvents()"><label for="${c.replace(" ", "_")}">${c}</label>`));
    categoryContainer.innerHTML += html;
}

function renderCards(events) {
    if (!path.includes("details")) eventsContainer.innerHTML = "";

    events.forEach((e) => {
        let card;

        if (path.includes("details")) {
            card = document.querySelector(".card");
            card.classList.remove("hidden");
            card.querySelector(".event-capacity").innerHTML += e.capacity;
            card.querySelector(".event-assistance").innerHTML += e.assistance || e.estimate;
            card.querySelector("a").href += `?id=${e._id}`;
        } else {
            card = document.querySelector(".event-container").cloneNode(true);
            if (e.id !== 0) card.href = "details.html?id=" + e.id;
            path === "" && new Date(data.currentDate) > new Date(e.date) && e.id != 0 && card.classList.add("grayscale");
        }

        card.querySelector(".event-category").textContent = e.category;
        card.querySelector("img").src = e.image;
        card.querySelector(".event-title").textContent = e.name;
        card.querySelector(".event-description").textContent = e.description;
        card.querySelector(".event-price").innerHTML += "$" + e.price;
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

function renderCurrentDate() {
    document.querySelector(".flex.p-4.gap-2")?.insertAdjacentHTML("afterend", `<div class="card my-4 event-details"><p class="bg-pink-700 p-2 text-xl rounded-lg text-slate-50">${new Date(data.currentDate).toUTCString().slice(0, 16)}</p></div>`);
}

async function eventList() {
    let [eventSelector, html] = [document.querySelector("#events"), ""];
    events = (await fetchData()).events.sort((a, b) => a.name.localeCompare(b.name));
    events.forEach((e) => (html += `<option value="${e.name}" ${e.id == window.location.search.split("=")[1] && "selected"}>${e.name}</option>`));
    eventSelector.innerHTML += html;
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

async function getEventStats() {
    const upcomingEvents = (await fetchData("?time=upcoming")).events;
    const pastEvents = (await fetchData("?time=past")).events.sort((a, b) => a.assistance - b.assistance);
    const [maxAssisEvent, minAssisEvent] = [pastEvents[pastEvents.length - 1], pastEvents[0]];
    const maxCapEvent = pastEvents.sort((a, b) => b.capacity - a.capacity)[0];
    let [upcomingCat, pastCat] = [getUniqueCategories(upcomingEvents), getUniqueCategories(pastEvents)];

    pastCat = reduceToCategoryData(pastCat, pastEvents);
    upcomingCat = reduceToCategoryData(upcomingCat, upcomingEvents);

    renderStats(maxAssisEvent, minAssisEvent, maxCapEvent, upcomingCat, pastCat);
}

function reduceToCategoryData(categories, events) {
    return categories
        .map((currentCategory) =>
            events
                .filter((e) => e.category === currentCategory)
                .reduce(
                    (accumulator, event) => {
                        accumulator.revenues += event.price * (event.assistance || event.estimate);
                        accumulator.attendance += event.assistance || event.estimate;
                        accumulator.capacity += event.capacity;
                        return accumulator;
                    },
                    { category: currentCategory, revenues: 0, attendance: 0, capacity: 0 }
                )
        )
        .sort((a, b) => a.revenues - b.revenues);
}

function renderStats(maxAssisEvent, minAssisEvent, maxCapEvent, upcomingCat, pastCat) {
    const [statsTable, upcomingStatsTable, pastStatsTable] = document.querySelectorAll("#statsTable, #upcomingStatsTable, #pastStatsTable");
    statsTable.insertAdjacentHTML("afterend", `<tr class="font-semibold"><td>${maxAssisEvent.name}</td><td>${minAssisEvent.name}</td><td>${maxCapEvent.name}</td></tr><tr><td>${maxAssisEvent.assistance}</td><td>${minAssisEvent.assistance}</td><td>${maxCapEvent.capacity}</td></tr>`);
    upcomingCat.forEach((e) => upcomingStatsTable.insertAdjacentHTML("afterend", `<tr><td>${e.category}</td><td>${e.revenues}</td><td>${((e.attendance / e.capacity) * 100).toFixed(2)}%</td></tr>`));
    pastCat.forEach((e) => pastStatsTable.insertAdjacentHTML("afterend", `<tr><td>${e.category}</td><td>${e.revenues}</td><td>${((e.attendance / e.capacity) * 100).toFixed(2)}%</td></tr>`));
}
