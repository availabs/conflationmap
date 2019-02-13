import React from "react"

import {
    ArrowDown,
    ArrowRight
} from "components/common/icons"

import MapLayer from "components/AvlMap/MapLayer"

const buildingsLayer = new MapLayer("Terrain Layers", {
  active: false,
  sources: [
    { id: "terrain",
      source: {
        'type': "vector",
         url: 'mapbox://mapbox.mapbox-terrain-v2'
      }
    }
  ],
  layers: [
   {
        "id": "terrain-data",
        "type": "fill-extrusion",
        "source": "terrain",
        "source-layer": "contour",
        'minzoom': 8,
        'paint': {
            'fill-extrusion-color': {
                "stops": [[0,'#fff'],[8840*0.02,'#7F7F7F'], [8840*0.1,'#232323']],
                "property": "ele",
                "base": 1
            },
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'ele'
            },
            'fill-extrusion-opacity':.6
        }
    }
  ],
  // popover: {
  //   layers: ['buildings_layer'],
  //   dataFunc: feature =>
  //     ["Buildings", ["Test", "Popover"]]
  // },
  modal: {
    comp: () => <h1>TEST MODAL</h1>,
    show: false
  },
  // actions: [
  //   {
  //     Icon: ArrowDown,
  //     action: ["toggleModal"],
  //     tooltip: "Toggle Modal"
  //   },
  //   {
  //     Icon: ArrowRight,
  //     action: ["toggleInfoBox", "test"],
  //     tooltip: "Toggle Info Box"
  //   }
  // ],
  infoBoxes: {
      test: {
          comp: () => <h4>INFO BOX</h4>,
          show: false
      }
  }
})

export default buildingsLayer