import MapLayer from "components/AvlMap/MapLayer"

import get from "lodash.get"

import { falcorGraph } from "store/falcorGraph"

const sources = [
	{   
	  id: 'npmrds',
	  source: {
	    type: 'vector',
	    url: 'mapbox://am3081.2yitmtuu'
	  }
	}
]

const layers = [
  {
    id: 'interstate-symbology-select-transcom',
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
    id: 'primary-symbology-select-transcom',
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
    id: 'interstate-symbology-transcom',
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
    id: 'primary-symbology-transcom',
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
]

class TranscomLayer extends MapLayer {
	constructor(options) {
		super("Transcom", options);
	}
	onFilterFetch(filterName, oldValue, value) {
		const tmcs = this.selection,
			date = this.filters.date.value;
		if (!date) return Promise.resolve(null);
		return falcorGraph.get(
			["tmc", tmcs, "incidents", "byDate", date, "length"]
		)
		.then(res => {
			let max = 0;
			tmcs.forEach(tmc => {
				const length = get(res, `json.tmc[${ tmc }].incidents.byDate[${ date }].length`, 0)
				max = Math.max(max, length)
			})
			return max;
		})
		.then(max => {
			if (!max) return Promise.resolve(null);
			return falcorGraph.get(
				["tmc", tmcs, "incidents", "byDate", date, "byIndex", { from: 0, to: max - 1 }, ["event_type", "event_category", "latitude", "longitude"]]
			)
			.then(res => ({ data: res.json.tmc, max }))
		})
	}
	receiveData(map, _data) {
		const featureCollection = {
			type: "FeatureCollection",
			features: []
		}
		if (_data === null) {
			map.getSource("transcom-source")
				.setData(featureCollection);
			return;
		}
		const tmcs = this.selection,
			date = this.filters.date.value,
			category = this.filters.category.value,

			type = this.filters.type.value,
			typeDomain = {},

			{ data, max } = _data;

		tmcs.forEach(tmc => {
			const graph = data[tmc].incidents.byDate[date].byIndex;
			for (let i = 0; i < max; ++i) {
				if (graph[i] && (category === "all" || (category === graph[i].event_category))) {

					typeDomain[graph[i].event_type] = true;

					if (type === "all" || (type === graph[i].event_type)) {
						featureCollection.features.push({
							type: "Feature",
							geometry: {
								type: "Point",
								coordinates: [graph[i].longitude, graph[i].latitude]
							},
							properties: {
								tmc,
								category: graph[i].event_category,
								type: graph[i].event_type
							}
						})
					}
				}
			}
		})

		const domain = [{ value: "all", name: "Show All" }]
		Object.keys(typeDomain).forEach(type => {
			domain.push({ value: type, name: type });
		})
		this.filters.type.domain = domain;

		map.getSource("transcom-source")
			.setData(featureCollection);
	}
}

const transcomLayer = new TranscomLayer({
	sources: [
		...sources,
		{ id: "transcom-source",
			source: {
				type: "geojson",
				generateId: true,
				data: {
					type: "FeatureCollection",
					features: []
				}
			}
		}
	],
	layers: [
		{ id: "transcom-layer",
			source: "transcom-source",
			type: "circle",
			paint: {
				"circle-color": "#900",
				"circle-radius": 10
			},
			zIndex: 500
		},
		...layers,
	],
  select: {
    fromLayers:['interstate-symbology-transcom','primary-symbology-transcom'],
    property: 'tmc',
    highlightLayers: [
      { id:'interstate-symbology-select-transcom', filter: ['in', 'f_system', 1, 2] }, 
      { id:'primary-symbology-select-transcom', filter:['!in', 'f_system', 1, 2] }
    ],
    maxSelection: 400
  },
  filters: {
  	date: {
  		name: "Date",
  		type: "date",
  		value: "2018-04-08"
  	},
    category: {
      name: "Category",
      type: "dropdown",
      domain: [
        { value: "all", name: "Show All" },
        { value: "accident", name: "Accident" },
        { value: "construction", name: "Construction" },
        { value: "other", name: "Other" }
      ],
      value: "all",
      onChange: (map, layer, value, oldValue) => {
      	if (value !== oldValue) {
      		layer.filters.type.value = "all";
      	}
      }
    },
    type: {
    	name: "Type",
    	type: "dropdown",
    	domain: [{ value: "all", name: "Show All" }],
    	value: "all"
    }
  },
  popover: {
  	layers: ["transcom-layer"],
  	dataFunc: function({ properties }) {
  		return [properties.tmc,
  			["Category", properties.category],
  			["Type", properties.type]
  		]
  	}
  }
})

export default transcomLayer;