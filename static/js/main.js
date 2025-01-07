
const map = L.map('map', {
  center: [28.394857, 84.124008],
  zoom: 7,
  zoomControl: false
});

var osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
var googleSat = L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});




const schicon = L.icon({
  iconUrl: '/static/data/sch.png',
  iconSize: [32, 37],
  iconAnchor: [16, 37],
  popupAnchor: [0, -37],
});
const stuicon = L.icon({
  iconUrl: '/static/data/stu.png',
  iconSize: [30, 30],
  iconAnchor: [15, 40],
  popupAnchor: [0, -40],
});
const landicon = L.icon({
  iconUrl: '/static/data/land.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});
const provinceStyle = {
  color: 'blue',
  weight: 2,
  opacity: 1,
  fillColor: 'lightblue',
  fillOpacity: 0.3
};


const districtStyle = {
  color: 'green',
  weight: 2,
  opacity: 1,
  fillColor: 'lightgreen',
  fillOpacity: 0.3
};


const municipalityStyle = {
  color: 'red',
  weight: 2,
  opacity: 1,
  fillColor: 'lightpink',
  fillOpacity: 0.3
};
const School = L.geoJSON(school, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, { icon: schicon });
  },
  onEachFeature: function (feature, layer) {
    const properties = feature.properties;
    const popupContent = `
          <b>Name:</b> ${properties.name || properties['name:en'] || "N/A"}<br>
          <b>City:</b> ${properties['addr:city'] || "N/A"}<br>
          <b>Street:</b> ${properties['addr:street'] || "N/A"}<br>
          <b>Postcode:</b> ${properties['addr:postcode'] || "N/A"}<br>
          <b>Operator:</b> ${properties.operator || "N/A"}<br>
          <b>Phone:</b> ${properties.phone || "N/A"}<br>
          <b>Website:</b> ${properties.website || "N/A"}`;
    layer.bindPopup(popupContent);
  }
});

const markerLayer = L.geoJSON(Location, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, { icon: stuicon });
  },
  onEachFeature: function (feature, layer) {
    const properties = feature.properties;
    const popupContent = `
          <b>Name:</b> ${properties.Name}<br>
          <b>Municipality:</b> ${properties.Municipality}<br>
          <b>District:</b> ${properties.District}<br>
          <b>Province:</b> ${properties.Province}`;
    layer.bindPopup(popupContent);
  }
});
const provinceLayer = L.geoJSON(pro, {
  style: provinceStyle,
  onEachFeature: function (feature, layer) {
    const properties = feature.properties;
    const popupContent = `
          <b>State Code:</b> ${properties.STATE_CODE}<br>
          <b>Province Name:</b> ${properties.Province}`
    layer.bindPopup(popupContent);
  }
});
const districtLayer = L.geoJSON(dist, {
  style: districtStyle,
  onEachFeature: function (feature, layer) {
    const properties = feature.properties;
    const popupContent = `
          <b>District Name:</b> ${properties.DISTRICT}`
    layer.bindPopup(popupContent);
  }
});
const municipalityLayer = L.geoJSON(munii, {
  style: municipalityStyle,
  onEachFeature: function (feature, layer) {
    const properties = feature.properties;
    const popupContent = `
          <b>Municipality:</b> ${properties.GaPa_NaPa}<br>
          <b>Level:</b> ${properties.Type_GN}<br>
          <b>District:</b> ${properties.DISTRICT}<br>
          <b>Province:</b> ${properties.Province}`
    layer.bindPopup(popupContent);
  }
});
// NASA Earth API 
const EARTH_API_URL = 'https://api.nasa.gov/planetary/earth/assets';
const API_KEY = 'AQuwKmjRCE0L33T7YV5fbDdAc4aJoyaTrBLk6bji';
const landsat = L.layerGroup().addTo(map);
// fetching
async function fetchEarthData() {
  const lat = parseFloat(document.getElementById('latitude').value);
  const lon = parseFloat(document.getElementById('longitude').value);

  if (isNaN(lat) || isNaN(lon)) {
    alert("Please enter valid latitude and longitude.");
    return;
  }

  try {
    //request URL
    const requestUrl = `${EARTH_API_URL}?lon=${lon}&lat=${lat}&dim=0.1&api_key=${API_KEY}`;

    // Fetch data
    const response = await axios.get(requestUrl);
    const data = response.data;

    if (data.url) {
      //clearing layer
      map.eachLayer((layer) => {
        if (layer !== map._layers[Object.keys(map._layers)[0]]) {
          map.removeLayer(layer);
        }
      });

      //tile layer
      const earthLayer = L.imageOverlay(data.url, [
        [lat - 0.05, lon - 0.05],
        [lat + 0.05, lon + 0.05]
      ]).addTo(map);

      // Center map 
      map.setView([lat, lon], 7);

      // marker and popup
      const marker = L.marker([lat, lon], { icon: landicon }).addTo(map);
      marker.bindPopup(`
                          <b>Landsat Image for Location:</b><br>
                          Latitude: ${lat}<br>
                          Longitude: ${lon}<br>
                          <a href="${data.url}" target="_blank">Click here for Full Image</a>
                      `).openPopup();

      //last capture date
      const lastCapturedDate = new Date(data.date).toLocaleDateString();
      document.getElementById('lastCapturedDate').innerHTML = `<b>Last Image Capture Date:</b> ${lastCapturedDate}`;
    } else {
      alert("No image available for the given location");
    }
  } catch (error) {
    console.error('Error fetching Earth API data:', error);
    alert("Failed to fetch data.");
  }
}


const geoserverLayer = L.tileLayer.wms("http://localhost:8080/geoserver/postgres/wms", {
  layers: 'local_unit',
  format: 'image/png',
  transparent: false,
  attribution: "GeoServer"
});



const baseLayers = {
  "OpenStreetMap": osmLayer,
  "Google Satellite": googleSat
};


const groupedOverlays = {
  "Geospatial Data and Analysis": {

    "Landsat Image": landsat,
    "School Proximity": School,
    "Students Location": markerLayer
  },
  "Nepal Administrative Divisions": {
    "Province": provinceLayer,
    "District": districtLayer,
    "Municipality": municipalityLayer,
    "GeoserverLayer":geoserverLayer
  }
};
map.on('layeradd', (event) => {
  if (event.layer === landsat) {
    document.getElementById('input').style.display = 'block';
  }
});

map.on('layerremove', (event) => {
  if (event.layer === landsat) {
    document.getElementById('input').style.display = 'none';
  }
});
L.control.groupedLayers(baseLayers, groupedOverlays, { collapsed: false }).addTo(map);


L.control.zoom({
  position: 'topleft'
}).addTo(map);

osmLayer.addTo(map);

L.control.scale({
  position: 'bottomleft'
}).addTo(map);