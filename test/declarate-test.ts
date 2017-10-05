import * as assert from 'assert';
import {declarate} from '../src';

const L: any = {};
L.Marker = function (latLng: number[]) {
  return {
    lat: latLng[0],
    lng: latLng[1]
  }
}

L.Map = function () {
  const layers: any[] = [];
  const calls = [];

  return {
    addLayer: (layer: any) => {
      calls.push(['addLayer', layer]);
      layers.push(layer);
    },

    removeLayer: (layer: any) => {
      calls.push(['removeLayer', layer]);
      const layerIndex = layers.findIndex((l: any) => l === layer);

      layers.splice(layerIndex, 1);
    },

    layers,

    calls
  }
}

describe('declarate', () => {
  it('creates declarative diff patch APIs from imperative APIs', () => {
    const m = L.Marker([40, 35]);
    const m2 = L.Marker([50, 35]);

    const map = L.Map();

    map.addLayer(m);
    map.addLayer(m2);

    assert.deepEqual(map.layers, [
      {lat: 40, lng: 35},
      {lat: 50, lng: 35},
    ]);

    map.removeLayer(m);

    assert.deepEqual(map.layers, [
      {lat: 50, lng: 35},
    ]);

    const otherMap = L.Map();

    const config = {
      markers: {
        create: (map: any, data: any) => L.Marker(data.latLng),
        attach: (map, marker) => map.addLayer(marker),
        remove: (map: any, marker: any) => map.removeLayer(marker)
      }
    };

    const {patch, marker} = declarate(config, otherMap);

    patch({
      markers: [
        marker(1, [40, 35]),
        marker(2, [50, 35])
      ]
    });

    assert.deepEqual(otherMap.calls, [
      ['addLayer', {lat: 40, lng: 35}],
      ['addLayer', {lat: 50, lng:35}]
    ])

    assert.deepEqual(otherMap.layers, [
      {lat: 40, lng: 35},
      {lat: 50, lng: 35},
    ])

    patch({
      markers: [
        marker(2, [50, 35]),
        marker(3, [20, 25])
      ]
    });

    assert.deepEqual(otherMap.calls.slice(2), [
      ['removeLayer', {lat: 40, lng: 35}],
      ['addLayer', {lat: 20, lng: 25}]
    ])

    assert.deepEqual(otherMap.layers, [
      {lat: 50, lng: 35},
      {lat: 20, lng: 25},
    ])
  });
});

