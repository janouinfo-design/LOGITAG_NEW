import { findContainedLayer, isPointInLayer } from "./turf.js";

(() => {
  let layer = {
    "type": "Feature",
    "properties": {
      "label": "zone 1",
      "description": "zone 34",
      "tags": "geo",
    },
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [-7.056141, 32.987613],
          [-7.056141, 33.020738],
          [-6.980267, 33.020738],
          [-6.980267, 32.987613],
          [-7.056141, 32.987613],
        ],
      ],
    },
  };

  let isIn = isPointInLayer(
    {
      "lat": 32.987613,
      "lng": -7.056141,
    },
    layer
  );


  let layers = [
    {
      id: 123,
      label: "layer1",
      "geometry": {
        "type": "Feature",
        "properties": {
          "label": "zone 1",
          "description": "zone 34",
          "tags": "geo",
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-7.056141, 32.987613],
              [-7.056141, 33.020738],
              [-6.980267, 33.020738],
              [-6.980267, 32.987613],
              [-7.056141, 32.987613],
            ],
          ],
        },
      },
    },
    {
      id: 123,
      label: "layer1",
      "geometry": {
        "type": "Feature",
        "properties": {
          "label": "zone 34",
          "description": "zone",
          "tags": "car",
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-7.040348, 32.990349],
              [-7.040348, 33.033265],
              [-6.963272, 33.033265],
              [-6.963272, 32.990349],
              [-7.040348, 32.990349],
            ],
          ],
        },
      },
    },
  ];

  let containedLayer = findContainedLayer(
    {
      "lat": 32.987613,
      "lng": -7.056141,
    },
    layers,
    "geometry"
  );

})();
