document.addEventListener('DOMContentLoaded', function () {
    fetch('tete_dor.geojson')  // ← CORRECTION : fichier en minuscule
        .then(res => res.json())
        .then(data => {
            initMap(data);
        })
        .catch(err => console.error('Erreur de chargement du GeoJSON:', err));
});

function initMap(geojson) {

    const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
    );

    const googleStreets = L.tileLayer(
        'http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}',
        { maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3'] }
    );

    const googleHybrid = L.tileLayer(
        'http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}',
        { maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3'] }
    );

    const googleSat = L.tileLayer(
        'http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}',
        { maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3'] }
    );

    const googleTerrain = L.tileLayer(
        'http://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}',
        { maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3'] }
    );

    const esriSat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 22 }
    );

    const map = L.map('map', {
        center: [45.7758, 4.8506],
        zoom: 14,
        maxZoom: 22,
        zoomSnap: 0.1,
        zoomDelta: 0.5,
        layers: [esriSat] // 🔥 fond par défaut (change ici si tu veux)
    });

    const baseMaps = {
        "🌍 OSM": osm,
        "🗺️ Google Streets": googleStreets,
        "🛰️ Google Satellite": googleSat,
        "🛰️ Google Hybrid": googleHybrid,
        "⛰️ Google Terrain": googleTerrain,
        "🛰️ Esri Satellite": esriSat
    };
    L.control.layers(baseMaps, null, { collapsed: false }).addTo(map);
}
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
