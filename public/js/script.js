const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    
    if (!markers[id]) {
        markers[id] = [];
    }

    const newMarker = L.marker([latitude, longitude]).addTo(map);
    markers[id].push(newMarker);

    // Adjust map view to the new marker position
    map.setView([latitude, longitude], map.getZoom());
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        markers[id].forEach(marker => map.removeLayer(marker));
        delete markers[id];
    }
});
