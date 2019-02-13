import MapLayer from "components/AvlMap/MapLayer"

import { falcorGraph } from "store/falcorGraph"

import * as d3scale from "d3-scale"

import COLOR_RANGES from "constants/color-ranges"
const QUANTILE_RANGE = COLOR_RANGES[5].reduce((a, c) => c.name === "Reds" ? c.colors : a)

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
    id: 'interstate-symbology-select-incidents',
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
    id: 'primary-symbology-select-incidents',
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
    id: 'interstate-symbology-incidents',
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
    id: 'primary-symbology-incidents',
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

class IncidentsLayer extends MapLayer {
	constructor(options) {
		super("Incidents", options);
	}
  onAdd(map) {
    super.onAdd(map);

    this.initTimeFilter()
  }
  initTimeFilter() {
    let year = this.filters.year.value,
      startDate = new Date(`January 1, ${ year }`).valueOf(),
      endDate = new Date(`December 31, ${ year }`).valueOf();
    this.filters.time.domain = [startDate, endDate];
    this.filters.time.value = [startDate, startDate + 1000 * 60 * 60 * 24 * 28];
  }
  onFilterFetch(filterName, oldValue, newValue) {
    if ((filterName === "year") && (oldValue !== newValue)) {
      this.initTimeFilter();
    }
    const year = this.filters.year.value,
      tmcs = this.selection;
    if (!tmcs.length) return Promise.resolve(null);

// `tmc[{keys:tmcIds}].incidents[{integers:years}].length`
    if (!this.selection || this.selection.length === 0 ) {
      return Promise.resolve({})
    }
    return falcorGraph.get(
      ["tmc", tmcs, "incidents", year, "length"]
    )
    .then(res => {
      let max = -Infinity;
      tmcs.forEach(tmc => {
        const length = +res.json.tmc[tmc].incidents[year].length;
        max = Math.max(length, max);
      })
      return max;
    })
    .then(max => {
// `tmc[{keys:tmcIds}].incidents[{integers:year}].byIndex[{integers:indices}]`
      return falcorGraph.get(
        ["tmc", tmcs, "incidents", year, "byIndex", { from: 0, to: max - 1 }, ["event_category", "creation", "close_time", "event_type"]]
      )
      .then(res => ({ max, data: res.json.tmc }))
    })
  }
  receiveData(map, _data) {
    if (!_data) return;

    const { max, data } = _data;

    const tmcs = this.selection,
      year = this.filters.year.value,
      category = this.filters.category.value,
      [start, end] = this.filters.time.value,

      eventsByTmc = {},
      allEventsByTmc = {},
      allEvents = [],

      type = this.filters.type.value,
      typeDomain = {};

    tmcs.forEach(tmc => {
      eventsByTmc[tmc] = 0;
      allEventsByTmc[tmc] = 0;

      const graph = data[tmc].incidents[year].byIndex;
      for (let i = 0; i < max; ++i) {
        if (graph[i]) {
          let creation = new Date(graph[i].creation).valueOf(),
            close = new Date(graph[i].close_time).valueOf(),
            type = graph[i].event_type,
            category = graph[i].event_category;

          allEvents.push({ creation, close, category, type });
          ++allEventsByTmc[tmc]

          if (category === "all" || graph[i].event_category === category) {
            typeDomain[graph[i].event_type] = true;

            if (type === "all" || graph[i].event_type === type) {
              if (close < start || creation > end) {
                ++eventsByTmc[tmc];
              }
            }
          }
        }
      }
    })

    const tDomain = [{ value: "all", name: "Show All" }]
    Object.keys(typeDomain).forEach(type => {
      tDomain.push({ value: type, name: type });
    })
    this.filters.type.domain = tDomain;

    const domain = Object.values(allEventsByTmc).filter(d => d)
    this.legend.domain = domain;
    const colors = {},
      scale = d3scale.scaleQuantile()
        .domain(domain)
        .range(this.legend.range);

    tmcs.forEach(tmc => {
      colors[tmc] = scale(eventsByTmc[tmc]);
    })
      
    map.setPaintProperty(
      'interstate-symbology-incidents', 
      'line-color', 
      ["get", ["to-string", ["get", "tmc"]], ["literal", colors]]
    );
      
    map.setPaintProperty(
      'primary-symbology-incidents', 
      'line-color', 
      ["get", ["to-string", ["get", "tmc"]], ["literal", colors]]
    );

    // create time range histogram

    const eventsByDay = {},
      [startDate, endDate] = this.filters.time.domain,
      step = this.filters.time.step;
    let now = startDate;
    while (now <= endDate) {
      eventsByDay[now] = 0;
      now += step;
    }

    allEvents
      .filter(e => (category === "all") || (category === e.category))
      .filter(e => (type === "all") || (type === e.type))
      .sort((a, b) => a.creation - b.creation)
      .forEach(({ creation, close }) => {
        const creationDate = new Date(creation);
        creationDate.setHours(0, 0, 0, 0);
        const creationOffset = creationDate.getTimezoneOffset(),
          creationDiff = 300 - creationOffset,
          creationValue = creationDate.valueOf() + (creationDiff * 60 * 1000);

        const closeDate = new Date(close);
        closeDate.setHours(0, 0, 0, 0);
        const closeOffset = closeDate.getTimezoneOffset(),
          closeDiff = 300 - closeOffset,
          closeValue = closeDate.valueOf() + (closeDiff * 60 * 1000);

        for (let v = creationValue; v <= closeValue; v += step) {
          ++eventsByDay[v];
        }
      })

    const histogram = [];
    Object.keys(eventsByDay)
      .sort((a, b) => +a - +b)
      .forEach(timestamp => {
        histogram.push({
          x0: +timestamp,
          x1: +timestamp + step,
          count: eventsByDay[timestamp]
        })
      })
    this.filters.time.histogram = histogram;
  }
}

export default new IncidentsLayer({
	sources,
	layers,
  select: {
    fromLayers:['interstate-symbology-incidents','primary-symbology-incidents'],
    property: 'tmc',
    highlightLayers: [
      { id:'interstate-symbology-select-incidents', filter: ['in', 'f_system', 1, 2] }, 
      { id:'primary-symbology-select-incidents', filter:['!in', 'f_system', 1, 2] }
    ],
    maxSelection: 400
  },
  filters: {
    year: {
      name: "Year",
      type: "dropdown",
      domain: [
        { value: 2015, name: "2015" },
        { value: 2016, name: "2016" },
        { value: 2017, name: "2017" },
        { value: 2018, name: "2018" }
      ],
      value: 2018
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
      value: "all"
    },
    type: {
      name: "Type",
      type: "dropdown",
      domain: [{ value: "all", name: "Show All" }],
      value: "all"
    },
    time: {
      name: "Time",
      type: "time-range",
      step: 1000 * 60 * 60 * 24
    }
  },
  legend: {
    type: "quantile",
    range: QUANTILE_RANGE,
    domain: [],
    active: true,
    title: "Incidents",
    format: d => Math.round(d)
  },
  popover: {
    layers: [
      'interstate-symbology-incidents',
      'primary-symbology-incidents',
      'interstate-symbology-select-incidents',
      'primary-symbology-select-incidents'
    ],
    dataFunc: function(feature) {
      const tmc = feature.properties.tmc,
        year = this.filters.year.value,
        category = this.filters.category.value;
      try {
// ["tmc", tmcs, "incidents", year, "byIndex", { from: 0, to: max - 1 }, "event_category"]
        const cache = falcorGraph.getCache(),
          graph = cache.tmc[tmc].incidents[year],
          length = +graph.length,
          incidentsByCategory = {
            "all": length,
            "accident": 0,
            "construction": 0,
            "other": 0
          };
        for (let i = 0; i < length; ++i) {
          const eventId = graph.byIndex[i].value[1],
            category = cache.incidents[eventId].event_category;
          ++incidentsByCategory[category];
        }
        return [
          tmc,
          ...Object.keys(incidentsByCategory).map(key => ([
            key, incidentsByCategory[key]
          ]))
        ]
      }
      catch (e) {
        return [tmc]
      }
    }
  }
})