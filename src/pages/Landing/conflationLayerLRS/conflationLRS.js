import React from "react"
import lrs from '../geo/lrs.geojson'
//import osm from '../geo/bidirectional_ways.geojson' // non split
import osm from '../geo/lrs_ways.geojson' // split
//import tmc_to_ways from '../geo/tmc_to_ways_mapping.json' // non split
import lrs_to_ways from '../geo/lrs_to_ways_mapping.json' // split
import TMCDisplay from './tmcDisplay'


import {
    ArrowDown,
    ArrowRight,
    Reset
} from "components/common/icons"

import MapLayer from "components/AvlMap/MapLayer";

console.log('lrs');

let filter_id = 'id';
let filter1 = ['all', ['in', 'oneway', 'yes']];
let filter2 = ['all', ['!in', 'oneway', 'yes']];

let waysArray = Object.keys(lrs_to_ways).reduce(function(out, lrs_milepoint){
    lrs_to_ways[lrs_milepoint].forEach(way => {
        if(out.indexOf(way) === -1) {
            out.push(way)
        }
    });
    return out
}, []);


let unmatched_lrs = Object.keys(lrs_to_ways).reduce(function(out, lrs_milepoint){
    if (lrs_to_ways[lrs_milepoint].length === 0){
        out.push(lrs_milepoint)
    }
    return out
}, []);

const conflationLRS = new MapLayer("LRS Layer", {
    active: false,
    sources: [
        { id: "lrs",
            source: {
                'type': "geojson",
                'data': lrs,
                lineMetrics: true,
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

        { 'id': 'LRS_layer_lrs',
            'source': 'lrs',
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
            'layout': {
                'visibility': 'visible'},
            //filter: []
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
            filter: ['all', ['in', 'oneway', 'yes']
               // ,['in','cid',...waysArray] //split
            ]
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
            filter: ['all', ['!in', 'oneway', 'yes']
               // ,['in','cid',...waysArray] //split
            ]
            //filter: ['all', ['!in', 'oneway', 'yes'],['in','id',...waysArray]] // non split
        },

    ],
    activeTMC: null,
    onClick: {
        layers: ['LRS_layer_lrs'],
        dataFunc: (feature,layer, map) => {
            //console.log('onClick: ',map)

            layer.activeTMC = feature.properties.Milepoint_;
            layer.activeWays = [...lrs_to_ways[feature.properties.Milepoint_]];

            // filter OSMs

            let filter_tmp_1 = map.getFilter('TMC_layer_osm_one_way');
            let filter_tmp_2 = map.getFilter('TMC_layer_osm_two_way_1');

            if(filter_tmp_1 && filter_tmp_1.length === 3){
                filter_tmp_1.pop();
            }
            if(filter_tmp_2 && filter_tmp_2.length === 3){
                filter_tmp_2.pop();
            }

            if (filter_tmp_1 && filter_tmp_1.length === 2){
                //filter_tmp_1.push(['in','id',...tmc_to_ways[feature.properties.Milepoint_]]); // non split
                // there has to be two copies to filter out by TMC
                filter_tmp_1.push(['in',filter_id,...lrs_to_ways[feature.properties.Milepoint_]]); //  split
            }
            if (filter_tmp_2 && filter_tmp_2.length === 2){
                //filter_tmp_2.push(['in','id',...tmc_to_ways[feature.properties.Milepoint_]]); // non split
                filter_tmp_2.push(['in',filter_id,...lrs_to_ways[feature.properties.Milepoint_]]); //  split
            }

            map.setFilter('TMC_layer_osm_one_way', filter_tmp_1);
            map.setFilter('TMC_layer_osm_two_way_1', filter_tmp_2);

            console.log(filter_tmp_1,filter_tmp_2);

        }
    },
    popover: {
        layers: ['LRS_layer_lrs','TMC_layer_osm_two_way_1','TMC_layer_osm_one_way'],

        dataFunc: (feature,map) => {
            let hoveredStateId = null;
            //let longlat = null;
            //console.log('am i a map?', map);
            if (map){
                map.on("mousemove", "LRS_layer_lrs", function(e) {

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
                        //this.longlat = e.lngLat;
                        if (this.hoveredStateId) {
                            map.setPaintProperty("LRS_layer_lrs", "line-color",
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
            }
            if (feature.source === 'lrs'){
                hoveredStateId = feature.id;
                return [feature.properties.Milepoint_,
                    //[JSON.stringify(longlat)],
                    ["Route #", feature.properties.Route_Numb],
                    ["name", feature.properties.Roadway_Na],
                    ["DOT ID", feature.properties.DOT_ID],
                    ["Object ID", feature.properties.OBJECTID],
                    ["Bearing", feature.properties.bearing],

                ]
            }else if (feature.source === 'osm'){
                return [feature.properties.id,
                    ["Road Name", feature.properties.name],
                    ["Road Number", feature.properties.ref],
                    ["Highway", feature.properties.highway],
                    ["cid", feature.properties.cid],
                    ["c1_id", feature.properties.c1_id],
                    ["tmc", feature.properties.tmc],
                    ["overlap", feature.properties.overlap],
                    ["LRS", feature.properties.lrs_milepoint],
                    ["Review", feature.properties.review],
                    ["Matched from", feature.properties.matched_from],
                    ["Bearing", feature.properties.bearing],


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
            comp: () => <TMCDisplay layer={conflationLRS} />,
            show: false,


        }

    },

    filters : {
        lrs_filter: {
            name: 'lrs',
            type: 'dropdown',
            domain: ['default','Unmatched LRS', 'Off'],
            value: 'default',
            onChange: function (map,layer) {
                //console.log('mode',map.getFilter("TMC_layer_inrix_one_way"));

                if (layer.filters.lrs_filter.value === 'Unmatched LRS'){
                    /*console.log('tmp_1: ',map.queryRenderedFeatures({layers:['LRS_layer_lrs']}));
                    let filter_tmp_1 = map.getFilter("LRS_layer_lrs");
                    if (filter_tmp_1.length === 0){
                    filter_tmp_1.push(['in','Milepoint_',...unmatched_lrs]);
                    }
*/
                    //console.log('tmp_2: ',filter_tmp.length);
                    map.setLayoutProperty('LRS_layer_lrs', 'visibility', 'visible');
                    map.setFilter("LRS_layer_lrs",['in','Milepoint_',...unmatched_lrs]);
                    //console.log(unmatched_lrs)
                    //console.log('layer: ',conflationLRS.layers[0].filter);
                }else if(layer.filters.lrs_filter.value === 'default'){
                    map.setLayoutProperty('LRS_layer_lrs', 'visibility', 'visible');

                    map.setFilter("LRS_layer_lrs",['all']);

                }else if(layer.filters.lrs_filter.value === 'Off'){
                    if (layer.filters.lrs_filter.value === 'Off'){
                        map.setLayoutProperty('LRS_layer_lrs', 'visibility', 'none');
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
                        //id = 'LRS_layer_lrs';
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

export default conflationLRS