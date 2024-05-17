// Initialize the map with a global view
const map = L.map('map').setView([0, 0], 2);

// Adding a tile layer (OpenStreetMap) to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 40000;
}

// Function to determine color based on depth
function getColor(depth) {
    return depth > 300 ? '#800026' :
           depth > 200 ? '#BD0026' :
           depth > 100 ? '#E31A1C' :
           depth > 50  ? '#FC4E2A' :
           depth > 20  ? '#FD8D3C' :
           depth > 10  ? '#FEB24C' :
           depth > 0   ? '#90EE90' :
                         '#8FBC8F';
}

// Fetch and plot earthquakes
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const earthquakes = data.features;
        earthquakes.forEach(eq => {
            const coords = eq.geometry.coordinates;
            const lat = coords[1];
            const lng = coords[0];
            const depth = coords[2];
            const mag = eq.properties.mag;
            const place = eq.properties.place;
            const time = new Date(eq.properties.time).toLocaleString();

            // Create a circle marker based on the earthquake's latitude and longitude
            L.circle([lat, lng], {
                color: getColor(depth),
                fillColor: getColor(depth),
                fillOpacity: 0.75,
                radius: markerSize(mag)
            }).addTo(map).bindPopup(
                `<strong>Location:</strong> ${place}<br>
                 <strong>Magnitude:</strong> ${mag}<br>
                 <strong>Depth:</strong> ${depth} km<br>
                 <strong>Time:</strong> ${time}`);
        });
    })
    .catch(error => console.error('Error loading the data:', error));

    // Create a legend for the map to explain the depth color coding
    const legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        depths = [-10, 10, 30, 50, 70, 90],
        labels = [],
        from, to, color;

    // Loop through the depth intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depths.length; i++) {
        from = depths[i];
        to = depths[i + 1];

        // Get color for current depth. If it's the last one, add a '+' to denote 'and above'.
        color = getColor(from + 1);
        labels.push(
            '<i style="background:' + color + '"></i> ' +
            from + (to ? '–' + to : '+')
        );
    }

    div.innerHTML = '<strong>Depth (km)</strong><br>' + labels.join('<br>');
    return div;
};
legend.addTo(map);