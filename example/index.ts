import * as L from 'leaflet';
import {declarate} from '../src';

const mymap = L.map('map').setView([51.505, -0.09], 13);

 var OpenStreetMap_Mapnik = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap);


const config = {
  markers: {
    create: (map: any, data: any) => new L.Marker(data.latLng),
    attach: (map, marker) => map.addLayer(marker),
    remove: (map: any, marker: any) => map.removeLayer(marker)
  }
};

const {patch, marker} = declarate(config, mymap);

patch({
  markers: [
    marker(1, [51.5, -0.09]),
    marker(2, [51.508, -0.11])
  ]
});

document.getElementById('add-a-thing').addEventListener('click', (ev) => {
  patch({
    markers: [
      marker(2, [51.508, -0.11]),
      marker(3, [51.515, -0.09])
    ]
  });
});
