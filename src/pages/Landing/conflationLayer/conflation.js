import React from "react"
import inrix from '../geo/inrix_2018.geojson'
//import osm from '../geo/node_attr_update.geojson'
import osm from '../geo/bidirectional_ways.geojson'
import tmc_to_ways from '../geo/tmc_to_ways_mapping.json'


import {
    ArrowDown,
    ArrowRight
} from "components/common/icons"

import MapLayer from "components/AvlMap/MapLayer";

console.log('inrix')

let waysArray = Object.keys(tmc_to_ways).reduce(function(out, tmc){
    tmc_to_ways[tmc].forEach(way => {
        if(out.indexOf(way) === -1) {
            out.push(way)
        }
    })
    return out
}, [])

/*let waysArray_negative = Object.keys(tmc_to_ways).reduce(function(out, tmc){
    tmc_to_ways[tmc].forEach(way => {

        if(out.indexOf(way) === -1 && way.indexOf('-') === way.length - 1) {
            out.push(way)
            console.log(way)
        }
    })
    return out
}, [])*/
const conflation = new MapLayer("TMC Layer", {
    active: true,
    sources: [
        { id: "inrix",
            source: {
                'type': "geojson",
                'data': inrix
            }
        },
        { id: "osm",
            source: {
                'type': "geojson",
                'data': osm
            }
        }
    ],
    layers: [

        { 'id': 'TMC_layer_inrix_one_way',
            'source': 'inrix',
            'type': 'line',
            'paint': {
                'line-color': '#8b7176',
                'line-width': {
                    base: 5,
                    stops: [[5, 5], [18, 13]]
                },
                'line-offset': {
                    base: 0,
                    stops: [[0, 0], [18, 15]]
                }
            },
            filter: ['all',['<=','f_system',2]]
        },
        { 'id': 'TMC_layer_inrix_two_way_1',
            'source': 'inrix',
            'type': 'line',
            paint: {
                'line-color': '#621b59',
                'line-width': {
                    base: 5,
                    stops: [[5, 5], [18, 13]]
                },
                'line-offset': {
                    base: 2,
                    stops: [[0, 0], [18, 15]]
                }
            },
            filter: ['all',['>=','f_system',3]]
        },
        { 'id': 'TMC_layer_osm_one_way',
            'source': 'osm',
            'type': 'line',
            paint: {
                'line-color': '#ccc',
                'line-width': {
                    base: 1.5,
                    stops: [[5, 5], [18, 13]]
                },
                'line-offset': {
                    base: 1,
                    stops: [[0, 10], [18, 30]]
                }
            },
            filter: ['all', ['in', 'oneway', 'yes'],['in','id',...waysArray]]
        },
        { 'id': 'TMC_layer_osm_two_way_1',
            'source': 'osm',
            'type': 'line',
            paint: {
                'line-color': '#7495cc',
                'line-width': {
                    base: 1.5,
                    stops: [[5, 5], [18, 13]]
                },
                'line-offset': {
                    base: 2,
                    stops: [[0, 10], [18, 20]]
                }
            },
            filter: ['all', ['!in', 'oneway', 'yes'],['in','id',...waysArray]]
        }
    ],
    popover: {
        layers: ['TMC_layer_inrix_one_way','TMC_layer_inrix_two_way_1','TMC_layer_inrix_two_way_2',
            'TMC_layer_osm_two_way_1','TMC_layer_osm_one_way','TMC_layer_osm_two_way_2'],

        dataFunc: feature => {
            console.log(feature);
            if (feature.source === 'inrix'){
                return [feature.properties.tmc,
                    ["Road Name", feature.properties.roadname],
                    ["f_system", feature.properties.f_system],
                    ["Is Primary", feature.properties.isprimary],

                ]
            }else if (feature.source === 'osm'){
                return [feature.properties.id,
                    ["Road Name", feature.properties.name]
                ]
            }
            return ["Header", ["Test", "Popover"]]
        }

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

export default conflation