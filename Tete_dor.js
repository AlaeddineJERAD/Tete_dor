document.addEventListener('DOMContentLoaded', function () {
    fetch('tete_dor.geojson')  // ← CORRECTION : fichier en minuscule
        .then(res => res.json())
        .then(data => {
            initMap(data);
        })
        .catch(err => console.error('Erreur de chargement du GeoJSON:', err));
});

function initMap(geojson) {
    const center = [45.7758, 4.8506];
    const map = L.map('map').setView(center, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const clusters = L.markerClusterGroup();

    geojson.features.forEach(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;

        const lng = coords[0];  // ✅ longitude
        const lat = coords[1];  // ✅ latitude

        const marker = L.marker([lat, lng])
            .on('click', () => showPhotoWithInfo(props));

        clusters.addLayer(marker);
    });

    map.addLayer(clusters);
}

function showPhotoWithInfo(props) {
    const modal = document.getElementById('photoModal');
    const container = document.getElementById('photoContainer');
    container.innerHTML = '';

    const img = document.createElement('img');
    img.src = `photos/${props.Name}`;  // ← dossier "photos", pas "images"
    img.alt = props.Name;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '500px';
    img.style.objectFit = 'contain';
    img.style.cursor = 'pointer';
    img.onclick = () => window.open(img.src, '_blank');

    container.appendChild(img);

    const infoPanel = document.createElement('div');
    infoPanel.className = 'info-panel';

    const infoHtml = `
        <p><strong>File:</strong> ${props.Name || 'Inconnu'}</p>
        <p><strong>Date:</strong> ${props.Date || 'N/A'}</p>
        <p><strong>Time:</strong> ${props.Time || 'N/A'}</p>
        <p><strong>Timestamp:</strong> ${props.Timestamp || 'N/A'}</p>
        <p><strong>Location:</strong> ${props.Lat.toFixed(6)}°, ${props.Lon.toFixed(6)}°</p>
        <p><strong>Altitude:</strong> ${props.Altitude || 'N/A'} m</p>
        <p><strong>Camera:</strong> ${props['Cam. Maker'] || 'Inconnu'} ${props['Cam. Model'] || ''}</p>
    `;

    infoPanel.innerHTML = infoHtml;
    container.appendChild(infoPanel);

    modal.style.display = 'block';

    document.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}
