
import { addLayers, removeLayers, toggleVisibility } from 'pages/auth/MapView/layers/utils'

import store from "store"
import { falcorGraph } from "store/falcorGraph"
import { update } from "utils/redux-falcor/components/duck"
import { forceUpdate } from "pages/auth/MapView/store/MapStore"
import { updateFilter } from "pages/auth/MapView/store/MapStore"
import get from 'lodash.get'



import * as d3scale from "d3-scale"


// import { fnum } from "utils/sheldusUtils"

import COLOR_RANGES from "constants/color-ranges"
const QUANTILE_RANGE = COLOR_RANGES[5].reduce((a, c) => c.name === "RdYlBu" ? c.colors : a).reverse()



const npmrdsLayer = {
	popup: {
		layers: ['interstate-symbology', 'primary-symbology'],
		dataFunc: feature => {
			const tmc = feature.properties.tmc;
// length, aadt, roadname from attributes
// year avgTT
// day epoch TT

// ['tmc', layer.selection, 'attributes', ["roadname","avg_speedlimit","length"]],
// ['tmc', layer.selection, 'pm3', year,  ['freeflowtt', 'vd_total', 'aadt']],
// ['tmc', layer.selection, 'year', year , 'avgtt' ],
// ['tmc', layer.selection, 'day', layer.filters.date.value, 'tt' ]
			try {
				const graph = falcorGraph.getCache().tmc[tmc],
					year = npmrdsLayer.filters.date.value.split("-")[0],
					epoch = npmrdsLayer.filters.epoch.value,
					avgtt = graph.year[year].avgtt.value,
					day = npmrdsLayer.filters.date.value,
					length = graph.attributes.length,
					tt = graph.day[day].tt.value,
					avgSpeed = ((length / avgtt[epoch]) * 3600),
					currentSpeed = ((length / tt[epoch]) * 3600);
				return [graph.attributes.roadname,
					["TMC", tmc],
					["Epoch", epoch],
					["Length", `${ graph.attributes.length.toFixed(2) } miles`],
					["AADT", graph.attributes.aadt.toLocaleString()],
					["Speed Limit", `${graph.attributes.avg_speedlimit.toLocaleString()} mph`],
					["Freeflow Speed", `${graph.pm3[year].freeflowtt} mph`],
					["Avg Speed", `${avgSpeed.toFixed(1)} mph`  ],
					["Current Speed", `${currentSpeed.toFixed(1)} mph` ],
					["Delay", `${(graph.pm3[year].freeflowtt - currentSpeed).toFixed(2)}`],
					["Delay %", `${((graph.pm3[year].freeflowtt - currentSpeed) / graph.pm3[year].freeflowtt * 100).toFixed(2)} %`],
					["Normalized Delay", `${(avgSpeed - currentSpeed).toFixed(2)}`],
					["Normalized Delay % ", `${((avgSpeed - currentSpeed) / avgSpeed * 100).toFixed(2)} %`]
				]
			}
			catch (e) {
				return ["NPMRDS",
					["TMC", tmc]
				]
			}
		}
	},
	name: 'npmrdsLayer',
	id: 'npmrdsLayer',
	mapBoxSources: {
		npmrds: {
    		type: 'vector',
    		url: 'mapbox://am3081.2yitmtuu'
  		}
  	},
  	type: 'Road Lines',
  	visible: true, 
	mapBoxLayers: [
		{
		    id: 'interstate-symbology-select',
		    type: 'line',
		    source: 'npmrds',
		    'source-layer': 'tmcsAttrs',
		    layout: {
		      'line-join': 'round',
		      'line-cap': 'round'
		    },
		    paint: {
		      'line-color': '#ccc',
		      'line-width': {
		        base: 1.5,
		        stops: [[3, 5], [13, 10], [18, 23]]
		      },
		      'line-offset': {
		        base: 1.5,
		        stops: [[5, 0], [9, 1], [15, 3], [18, 7]]
		      }
		    },
		    filter: ['all', ['in', 'f_system', 1, 2], ['in','tmc','']]
	  	},
	  	{
		    id: 'primary-symbology-select',
		    type: 'line',
		    source: 'npmrds',
		    'source-layer': 'tmcsAttrs',
		    layout: {
		      'line-join': 'round',
		      'line-cap': 'round'
		    },
		    paint: {
		      'line-color': '#ccc',
		      'line-width': {
		        base: 1.5,
		        stops: [[5, 5], [18, 13]]
		      },
		      'line-offset': {
		        base: 1.5,
		        stops: [[10, 0.5], [18, 10]]
		      }
		    },
		    filter: ['all', ['!in', 'f_system', 1, 2],['in','tmc','']]
		},
		{
		    id: 'interstate-symbology',
		    type: 'line',
		    source: 'npmrds',
		    'source-layer': 'tmcsAttrs',
		    layout: {
		      'line-join': 'round',
		      'line-cap': 'round'
		    },
		    paint: {
		      'line-color': '#566881',
		      'line-width': {
		        base: 1.5,
		        stops: [[3, 1], [13, 8], [18, 19]]
		      },
		      'line-offset': {
		        base: 1.5,
		        stops: [[5, 0], [9, 1], [15, 2], [18, 4]]
		      }
		    },
		    filter: ['all', ['in', 'f_system', 1, 2]]
	  	},
	  	{
		    id: 'primary-symbology',
		    type: 'line',
		    source: 'npmrds',
		    'source-layer': 'tmcsAttrs',
		    layout: {
		      'line-join': 'round',
		      'line-cap': 'round'
		    },
		    paint: {
		      'line-color': '#303339',
		      'line-width': {
		        base: 1.5,
		        stops: [[5, 1], [18, 10]]
		      },
		      'line-offset': {
		        base: 1.5,
		        stops: [[10, 0.5], [18, 10]]
		      }
		    },
		    filter: ['all', ['!in', 'f_system', 1, 2]]
		}
	],
	selection: [],
	selectFilter: ['in', 'tmc'],
	selectProperty: 'tmc',
	selectRenderLayers: ['interstate-symbology','primary-symbology'],
	selectLayers: [
		{
		  	name: 'interstate-symbology-select',
		  	defaultFilters: [['in', 'f_system', 1, 2]]
		 }, 
		 {
		 	name: 'primary-symbology-select',
		  	defaultFilters: [['!in', 'f_system', 1, 2]]
		  }
	],
	filters: {
		date: {
			name: 'Year',
			type: 'date',
			value: '2017-02-04' //year-mo-da
		},
		epoch: {
			name: 'Time of Day',
			type: 'slider',
			min: 1,
			max: 287,
			value: 1
		},
		measure: {
			name: 'Measure',
			type: 'dropdown',
			domain: [
				{ value: "delay", name: "FF - Speed" },
	    		{ value: "pct_delay", name: "FF - Speed / FF" },
	    		{ value: "norm_delay", name: "HistAvgSpeed - Speed" },
	    		{ value: "pct_norm_delay", name: "HistAvgSpeed - Speed / HistAvgSpeed" }
			],
			value: 'delay'
		},
		threshold: {
			name: 'threshold',
			type: 'slider',
			min: 0,
			max: 100,
			value: 0
		},
		submit: {
			name: 'Load',
			type: 'fetch'
		}
		
	},
	legend: {
        active: true,

        type: "threshold",

        types: ["threshold"],
        onChange: onFilterFetch,

        domain: [0,2,5,15,20],
        range: QUANTILE_RANGE,

        title: "NPMRDS Legend",
        // format: d => `$${ fnum(d) }`,
        vertical: false
    },
	onFilterFetch: onFilterFetch,
	toggleVisibility: toggleVisibility,
	onAdd: addLayers,
	onRemove: removeLayers,
	active: false,
	fetchData: fetchData,
	receiveData: receiveData
}


function onFilterFetch (layer) {
	return layer.fetchData(layer)
}

function onSelect ( selection ) {
	return selection
}

function fetchData ( layer ) {
	if (layer.selection.length === 0 ) {
		return Promise.resolve({})
	}
	let year = +layer.filters.date.value.split('-')[0]
	return falcorGraph.get(
      ['tmc', layer.selection, 'attributes', ["roadname","avg_speedlimit","length", "aadt"]],
      ['tmc', layer.selection, 'pm3', year,  ['freeflowtt', 'vd_total', 'aadt']],
      ['tmc', layer.selection, 'year', year , 'avgtt' ],
      ['tmc', layer.selection, 'day', layer.filters.date.value, 'tt' ]
    ).then(res => {
    	return res
    })
}

function receiveData ( data, map, layer) {
	if(!data.json || !data.json.tmc || layer.selection.length === 0) return;
	let colorScale = d3scale.scaleThreshold()
	    .domain(layer.legend.domain)
	    .range(layer.legend.range)

	let year = +layer.filters.date.value.split('-')[0]
	let date =  layer.filters.date.value
	let epoch = layer.filters.epoch.value
	let threshold = layer.filters.threshold.value

	let freeflowSpeedGet = layer.filters.measure.value.includes('norm_delay')
		? `year.2017.avgtt[${epoch}]`
		: `pm3.${year}.freeflowtt`

  	let currentTTGet = `day.${date}.tt[${epoch}]`

  	let colors = layer.selection.reduce((final, tmc) => {
	    if(!get(data.json.tmc[tmc], currentTTGet, false)){
	      final[tmc] = '#343a41' //if no data for day & epoch make segment background color
	    } else {
	      let length = +get(data.json.tmc[tmc], 'attributes.length',0)
	      let freeflowSpeed = +(get(data.json.tmc[tmc], freeflowSpeedGet, 0))
	      if (layer.filters.measure.value.includes('norm_delay')) {
	      	freeflowSpeed = ( length / freeflowSpeed ) * 3600
	      }
	      let currentSpeed = ((length / +get(data.json.tmc[tmc], currentTTGet, 0)) * 3600).toFixed(1)

	      let calc = layer.filters.measure.value.includes('pct') 
	      	? (freeflowSpeed - currentSpeed) / freeflowSpeed * 100
	      	: (freeflowSpeed - currentSpeed)

	      final[tmc] = calc > threshold 
	      	? colorScale(calc)
	      	: '#343a41'
	    }

	    return final
	},{})

  	//console.log(colors )
  	
	map.setPaintProperty(
		'interstate-symbology', 
		'line-color', 
		["get", ["to-string", ["get", "tmc"]], ["literal", colors]]
	);
    
    map.setPaintProperty(
    	'primary-symbology', 
    	'line-color', 
    	["get", ["to-string", ["get", "tmc"]], ["literal", colors]]
    );
    
} 



export default npmrdsLayer;