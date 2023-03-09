let data = {};
async function fetchData() {
    return fetch("https://mh-h0bh.onrender.com/api/amazing")
        .then((response) => response.json())
        .then((response) => {
            data = response;
            data.events = data.response;
            data.currentDate = data.date;
            delete data.date;
            delete data.response;
            updateDate();
        })
        .catch((error) => console.log(error));
}

function updateDate() {
    const todayDate = new Date();
    const currentDate = new Date(data.currentDate);

    data.events.forEach((e) => {
        let eventDate = new Date(e.date);
        let daysDiff = currentDate.getTime() - eventDate.getTime(); /// (1000 * 60 * 60 * 24);
        eventDate.setTime(todayDate.getTime() + daysDiff / 5);
        e.date = eventDate.toISOString().slice(0, 10);
    });

    data["currentDate"] = todayDate;
    document.querySelector(".flex.p-4.gap-2")?.insertAdjacentHTML("afterend", `<div class="card event-details mb-4"><p class="bg-pink-700 p-2 text-xl rounded-lg text-slate-50">${new Date().toUTCString().slice(0, 16)}</p></div>`);
}

const notMatchEvent = {
    _id: 0,
    image: "https://i.ibb.co/HzD6k2W/image.png",
    name: "No results found",
    // date: "0001-1-2",
    date: new Date(),
    description: "Sorry, we couldn't find any matching events. Please try again with different search criteria.",
    category: "Event",
    place: "",
    capacity: "",
    assistance: "",
    price: "",
};
