import React from "react"
import inrix from '../geo/inrix_2018_updated.geojson'
//import inrix from '../geo/albany_inrix.geojson'
//import osm from '../geo/node_attr_update.geojson'
//import osm from '../geo/bidirectional_ways.geojson' // non split
import osm from '../geo/split_ways.geojson' // split
//import tmc_to_ways from '../geo/tmc_to_ways_mapping.json' // non split
import tmc_to_ways from '../geo/tmc_to_split_ways_mapping.json' // split
import TMCDisplay from './tmcDisplay'


import {
    ArrowDown,
    ArrowRight,
    Reset
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


let unmatched_tmc = Object.keys(tmc_to_ways).reduce(function(out, tmc){
    if (tmc_to_ways[tmc].length === 0){
        out.push(tmc)
    }
    return out
}, [])
const conflation = new MapLayer("TMC Layer", {
    active: false,
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
        },
        { id: "conflation",
            source: {
                'type': "vector",
                'url': 'mapbox://am3081.9zvuz56o'
            }
        },
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
                    stops: [[5, 0], [9, 1], [15, 1], [18, 2]]
                },

            },
            'layout': {
                'visibility': 'visible'},
            filter: ['all',['<=','f_system',2]]
        },

        /*{ 'id': 'conflation',
            'source': 'conflation',
            'type': 'line',
            'source-layer': 'split_ways',
            'paint': {
                'line-color': '#ff1100',
                'line-width': {
                    base: 5,
                    stops: [[5, 5], [18, 13]]
                },
                /!*'line-offset': {
                    base: 0,
                    stops: [[0, 0], [18, 15]]
                },
*!/
            },
            'layout': {
                'visibility': 'visible'},
        },*/
        /*{ "id": "state-fills",
            "source": "inrix",
            'type': 'line',
            'paint': {
                'line-color': '#20d809',
                'line-width': {
                    base: 5,
                    stops: [[5, 5], [18, 13]]
                },
                'line-offset': {
                    base: 0,
                    stops: [[0, 0], [18, 15]]
                },
            },
            'state' : {
                'layout': {
                    'visibility': 'visible'},
            },
            filter: ['all',['<=','f_system',2]]
        },*/
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
                    stops: [[5, 0], [9, 1], [15, 1], [18, 2]]
                },

            },
            'layout': {
                'visibility': 'visible'},
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
                /*'line-offset': {
                    base: 1,
                    stops: [[10, 8], [18, 15]]
                }*/
            },
            'layout': {
                'visibility': 'visible'},
            filter: ['all', ['in', 'oneway', 'yes'],['in','cid',...waysArray]] //split
            //filter: ['all', ['in', 'oneway', 'yes'],['in','id',...waysArray]] // non split

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
            'layout': {
                'visibility': 'visible'},
            filter: ['all', ['!in', 'oneway', 'yes'],['in','cid',...waysArray]] //split
            //filter: ['all', ['!in', 'oneway', 'yes'],['in','id',...waysArray]] // non split
        },

    ],
    activeTMC: null,
    onClick: {
        layers: ['TMC_layer_inrix_one_way','TMC_layer_inrix_two_way_1'],
        dataFunc: (feature,layer, map) => {
            //console.log('onClick: ',map)

            layer.activeTMC = feature.properties.tmc;
            layer.activeWays = [...tmc_to_ways[feature.properties.tmc]];

            // filter OSMs

            let filter_tmp_1 = map.getFilter('TMC_layer_osm_one_way');
            let filter_tmp_2 = map.getFilter('TMC_layer_osm_two_way_1');

            if(filter_tmp_1.length === 3){
                filter_tmp_1.pop();
            }
            if(filter_tmp_2.length === 3){
                filter_tmp_2.pop();
            }

            if (filter_tmp_1.length === 2){
                //filter_tmp_1.push(['in','id',...tmc_to_ways[feature.properties.tmc]]); // non split
                // there has to be two copies to filter out by TMC
                filter_tmp_1.push(['in','tmc',feature.properties.tmc]); //  split
            }
            if (filter_tmp_2.length === 2){
                //filter_tmp_2.push(['in','id',...tmc_to_ways[feature.properties.tmc]]); // non split
                filter_tmp_2.push(['in','tmc',feature.properties.tmc]); //  split
            }

            map.setFilter('TMC_layer_osm_one_way', filter_tmp_1);
            map.setFilter('TMC_layer_osm_two_way_1', filter_tmp_2)

        }
    },
    popover: {
        layers: ['TMC_layer_inrix_one_way','TMC_layer_inrix_two_way_1','TMC_layer_inrix_two_way_2',
            'TMC_layer_osm_two_way_1','TMC_layer_osm_one_way','TMC_layer_osm_two_way_2'],

        dataFunc: (feature,map) => {
            let hoveredStateId = null;
            //console.log('am i a map?', map);
            if (map){
                map.on("mousemove", "TMC_layer_inrix_one_way", function(e) {

                    //console.log('1: ',map.getLayer("state-fills"));
                    //let layer = map.getLayer("state-fills");
                    //map.setLayoutProperty('state-fills', 'visibility', 'none');
                    //feature.setLayerProperty({"line-color": "#CCC"})
                    //feature.layer.paint["line-color"] = "#CCC";
                    //console.log(feature.layer.paint["line-color"])
                    // if (feature.length > 0) {
                        if (hoveredStateId) {
                            //map.setLayoutProperty({'visibility': 'none'});
                        }

                        this.hoveredStateId = feature.id;
                        if (this.hoveredStateId) {
                            map.setPaintProperty("TMC_layer_inrix_one_way", "line-color",
                                ["case",
                                    ["==", ["id"], this.hoveredStateId],
                                    "#ff0000",
                                    '#8b7176']);
                            //console.log('feature before: ', feature)
                            //map.setFeatureState({'id': this.hoveredStateId},{"line-color": '#ccc'});
                            //console.log('feature after: ',feature)
                            // }
                        }
                });
                map.on("mousemove", "TMC_layer_inrix_two_way_1", function(e) {

                    //console.log('1: ',map.getLayer("state-fills"));
                    //let layer = map.getLayer("state-fills");
                    //map.setLayoutProperty('state-fills', 'visibility', 'none');
                    //feature.setLayerProperty({"line-color": "#CCC"})
                    //feature.layer.paint["line-color"] = "#CCC";
                    //console.log(feature.layer.paint["line-color"])
                    // if (feature.length > 0) {
                    if (hoveredStateId) {
                        //map.setLayoutProperty({'visibility': 'none'});
                    }

                    this.hoveredStateId = feature.id;
                    if (this.hoveredStateId) {
                        map.setPaintProperty("TMC_layer_inrix_two_way_1", "line-color",
                            ["case",
                                ["==", ["id"], this.hoveredStateId],
                                "#ff0000",
                                '#621b59']);
                        //console.log('feature before: ', feature)
                        //map.setFeatureState({'id': this.hoveredStateId},{"line-color": '#ccc'});
                        //console.log('feature after: ',feature)
                        // }
                    }
                });
            }
            if (feature.source === 'inrix'){
                hoveredStateId = feature.id
                return [feature.properties.tmc,
                    ["Feature ID", feature.id],
                    ["Road Name", feature.properties.roadname],
                    ["Road Number", feature.properties.roadnumber],
                    ["f_system", feature.properties.f_system],
                    ["Is Primary", feature.properties.isprimary],

                ]
            }else if (feature.source === 'osm'){
                return [feature.properties.id,
                    ["Road Name", feature.properties.name],
                    ["Road Number", feature.properties.ref],
                    ["Highway", feature.properties.highway],
                    ["cid", feature.properties.cid],
                    ["tmc", feature.properties.tmc],
                    ["overlap", feature.properties.overlap]
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
            comp: () => <TMCDisplay layer={conflation} />,
            show: false,


        }

    },

    filters : {
        lrs_filter: {
            name: 'Inrix',
            type: 'dropdown',
            domain: ['default','Unmatched inrix','Inrix One way', 'Inrix Two way', 'Off'],
            value: 'default',
            onChange: function (map,layer) {
                //console.log('mode',map.getFilter("TMC_layer_inrix_one_way"));

                if (layer.filters.lrs_filter.value === 'Unmatched inrix'){
                    let filter_tmp_1 = map.getFilter("TMC_layer_inrix_one_way");
                    let filter_tmp_2 = map.getFilter("TMC_layer_inrix_two_way_1");
                    //console.log('tmp_1: ',filter_tmp.length);
                    if (filter_tmp_1.length === 2){
                    filter_tmp_1.push(['in','tmc',...unmatched_tmc]);
                    }
                    if (filter_tmp_2.length === 2){
                        filter_tmp_2.push(['in','tmc',...unmatched_tmc]);
                    }
                    //console.log('tmp_2: ',filter_tmp.length);
                    map.setLayoutProperty('TMC_layer_inrix_one_way', 'visibility', 'visible');
                    map.setLayoutProperty('TMC_layer_inrix_two_way_1', 'visibility', 'visible');

                    map.setFilter("TMC_layer_inrix_one_way",filter_tmp_1);
                    map.setFilter("TMC_layer_inrix_two_way_1",filter_tmp_2);
                    //console.log(unmatched_tmc)
                    //console.log('layer: ',conflationLRS.layers[0].filter);
                }else if(layer.filters.lrs_filter.value === 'default'){
                    let filter_tmp_1 = map.getFilter("TMC_layer_inrix_one_way");
                    let filter_tmp_2 = map.getFilter("TMC_layer_inrix_two_way_1");
                    if (filter_tmp_1.length > 2){
                        filter_tmp_1.pop()
                    }
                    if (filter_tmp_2.length > 2){
                        filter_tmp_2.pop()
                    }
                    map.setLayoutProperty('TMC_layer_inrix_one_way', 'visibility', 'visible');
                    map.setLayoutProperty('TMC_layer_inrix_two_way_1', 'visibility', 'visible');

                    map.setFilter("TMC_layer_inrix_one_way",filter_tmp_1);
                    map.setFilter("TMC_layer_inrix_two_way_1",filter_tmp_2);

                }else if(layer.filters.lrs_filter.value === 'Inrix One way' || 'Inrix Two way' || 'Off'){
                    //let id = '';

                    if (layer.filters.lrs_filter.value === 'Inrix One way'){
                        //id = 'TMC_layer_inrix_one_way';
                        map.setLayoutProperty('TMC_layer_inrix_one_way', 'visibility', 'visible');
                        map.setLayoutProperty('TMC_layer_inrix_two_way_1', 'visibility', 'none');
                    }else if (layer.filters.lrs_filter.value === 'Inrix Two way'){
                        //id = 'TMC_layer_inrix_two_way_1';
                        map.setLayoutProperty('TMC_layer_inrix_two_way_1', 'visibility', 'visible');
                        map.setLayoutProperty('TMC_layer_inrix_one_way', 'visibility', 'none');
                    }else if (layer.filters.lrs_filter.value === 'Off'){
                        map.setLayoutProperty('TMC_layer_inrix_one_way', 'visibility', 'none');
                        map.setLayoutProperty('TMC_layer_inrix_two_way_1', 'visibility', 'none');
                    }


                   /*
                   let visibility = map.getLayoutProperty(id, 'visibility');
                   if (visibility === 'visible' && id !== '') {
                        map.setLayoutProperty(id, 'visibility', 'none');
                        //this.className = '';
                    } else if(id !== ''){
                        //this.className = 'active';
                        map.setLayoutProperty(id, 'visibility', 'visible');
                    }*/
                }

            }
        },
        osm_filter: {
            name: 'Osm',
            type: 'dropdown',
            domain: ['default','OSM One way', 'OSM Two way', 'Off'],
            value: 'default',
            onChange: function (map,layer) {
                //console.log('mode',map.getFilter("TMC_layer_inrix_one_way"));

                if(layer.filters.osm_filter.value === 'default'){


                    map.setLayoutProperty('TMC_layer_osm_one_way', 'visibility', 'visible');
                    map.setLayoutProperty('TMC_layer_osm_two_way_1', 'visibility', 'visible');

                }else if(layer.filters.osm_filter.value === 'OSM One way' || 'OSM Two way' || 'Off'){
                    //let id = '';

                    if (layer.filters.osm_filter.value === 'OSM One way'){
                        //id = 'TMC_layer_inrix_one_way';
                        map.setLayoutProperty('TMC_layer_osm_one_way', 'visibility', 'visible');
                        map.setLayoutProperty('TMC_layer_osm_two_way_1', 'visibility', 'none');
                    }else if (layer.filters.osm_filter.value === 'OSM Two way'){
                        //id = 'TMC_layer_inrix_two_way_1';
                        map.setLayoutProperty('TMC_layer_osm_two_way_1', 'visibility', 'visible');
                        map.setLayoutProperty('TMC_layer_osm_one_way', 'visibility', 'none');
                    }else if (layer.filters.osm_filter.value === 'Off'){
                        map.setLayoutProperty('TMC_layer_osm_one_way', 'visibility', 'none');
                        map.setLayoutProperty('TMC_layer_osm_two_way_1', 'visibility', 'none');
                    }


                    /*
                    let visibility = map.getLayoutProperty(id, 'visibility');
                    if (visibility === 'visible' && id !== '') {
                         map.setLayoutProperty(id, 'visibility', 'none');
                         //this.className = '';
                     } else if(id !== ''){
                         //this.className = 'active';
                         map.setLayoutProperty(id, 'visibility', 'visible');
                     }*/
                }

            }
        }
    }
})

export default conflation