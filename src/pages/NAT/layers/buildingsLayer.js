import React from "react"

import {
    ArrowDown,
    ArrowRight
} from "components/common/icons"

import MapLayer from "components/AvlMap/MapLayer"

const buildingsLayer = new MapLayer("Buildings Layer", {
  active: false,
  sources: [
    { id: "buildings",
      source: {
        'type': "vector",
        'url': 'mapbox://am3081.5ki8tlog'
      }
    }
  ],
  layers: [
    { 'id': 'buildings_layer',
      'source': 'buildings',
      'source-layer': 'NewYork',
      'type': 'fill',
      'paint': {
          'fill-color': 'rgba(196, 0, 0, 0.1)',
      }
    }
  ],
  popover: {
    layers: ['buildings_layer'],
    dataFunc: feature =>
      ["Buildings", ["Test", "Popover"]]
  },
  modal: {
    comp: () => <h1>TEST MODAL</h1>,
    show: false
  },
  actions: [
    {
      Icon: ArrowDown,
      action: ["toggleModal"],
      tooltip: "Toggle Modal"
    },
    {
      Icon: ArrowRight,
      action: ["toggleInfoBox", "test"],
      tooltip: "Toggle Info Box"
    }
  ],
  infoBoxes: {
      test: {
          comp: () => <h4>INFO BOX</h4>,
          show: false
      }
  }
})

export default buildingsLayer