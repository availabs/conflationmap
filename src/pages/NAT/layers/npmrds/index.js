import React from "react"
import styled from 'styled-components';

//import store from "store"
import { falcorGraph } from "store/falcorGraph"
import get from 'lodash.get'

// import { update } from "utils/redux-falcor/components/duck"

import MapLayer from "components/AvlMap/MapLayer"

import * as d3scale from "d3-scale"

import TMCGraph from "../../components/tmcGraph"

import {layers, sources} from './layer-styles'

import COLOR_RANGES from "constants/color-ranges"

import * as d3format from "d3-format"

const QUANTILE_RANGE = COLOR_RANGES[5].reduce((a, c) => c.name === "RdYlBu" ? c.colors : a).reverse()

// import ParcelLayerModal from "./modals/ParcelLayerModal"


class NPMRDSLayer extends MapLayer {
  onAdd(map) {
    super.onAdd(map);

    this.initTimeFilter()
  }
  initTimeFilter() {
    let date = this.filters.date.value,
      startDate = new Date(`${date}T00:00:00`).valueOf(),
      endDate = new Date(`${date}T23:55:00`).valueOf();
      this.filters.time.domain = [startDate, endDate];
      this.filters.time.value = [startDate, startDate + 1000 * 60 * 5];
  }
  receiveData ( map, data) {

/*
{ value: "delay", name: "FF - Speed" },
{ value: "pct_delay", name: "FF - Speed / FF" },
{ value: "norm_delay", name: "HistAvgSpeed - Speed" },
{ value: "pct_norm_delay", name: "HistAvgSpeed - Speed / HistAvgSpeed" }
*/

    if(!data.json || !data.json.tmc || this.selection.length === 0) return;
    let colorScale = d3scale.scaleThreshold()
        .domain(this.legend.domain)
        .range(this.legend.range)

    let year = +this.filters.date.value.split('-')[0]
    let date =  this.filters.date.value
    // let epoch = this.filters.epoch.value
    let toEpoch = new Date(this.filters.time.value[0])
    let epoch = (toEpoch.getHours() * 12) + Math.round(toEpoch.getMinutes() / 5)
    let threshold = this.filters.threshold.value

    let freeflowSpeedGet = this.filters.measure.value.includes('norm_delay')
      ? `year.2017.avgtt[${epoch}]`
      : `pm3.${year}.freeflowtt`

    let currentTTGet = `day.${date}.tt[${epoch}]`

    let colors = this.selection.reduce((final, tmc) => {
      if(!get(data.json.tmc[tmc], currentTTGet, false)) {
        final[tmc] = '#343a41' //if no data for day & epoch make segment background color
      } else {
        let length = +get(data.json.tmc[tmc], 'attributes.length',0)
        let freeflowSpeed = +(get(data.json.tmc[tmc], freeflowSpeedGet, 0))
        if (this.filters.measure.value.includes('norm_delay')) {
          freeflowSpeed = ( length / freeflowSpeed ) * 3600
        }
        let currentSpeed = ((length / +get(data.json.tmc[tmc], currentTTGet, 0)) * 3600).toFixed(1)

        let calc = this.filters.measure.value.includes('pct') 
          ? (freeflowSpeed - currentSpeed) / freeflowSpeed * 100
          : (freeflowSpeed - currentSpeed)

        final[tmc] = calc && calc > threshold 
          ? colorScale(calc)
          : '#343a41'
      }

      return final
    },{})
      
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

    // startDate = new Date(`${date}T00:00:00`).valueOf()

    const format = d3format.format("02d"),
      step = 1000 * 60 * 5;

    const sumsByEpoch = this.sumsByEpoch || {};

    if (!Object.keys(sumsByEpoch).length) {


      this.selection.forEach(tmc => {
        for (let epoch = 0; epoch < 288; ++epoch) {

          let freeflowSpeedGet = this.filters.measure.value.includes('norm_delay')
            ? `year.2017.avgtt[${ epoch }]`
            : `pm3.${year}.freeflowtt`

          let currentTTGet = `day.${date}.tt[${epoch}]`

          const toMinutes = epoch * 5,
            hours = Math.floor(toMinutes / 60),
            minutes = toMinutes % 60,
            dateString = `${ date }T${ format(hours) }:${ format(minutes) }:00`,
            valueOf = new Date(dateString).valueOf();

          if (!(valueOf in sumsByEpoch)) {
            sumsByEpoch[valueOf] = 0;
          }

          let length = +get(data.json.tmc[tmc], 'attributes.length',0)
          let freeflowSpeed = +(get(data.json.tmc[tmc], freeflowSpeedGet, 0))
          if (this.filters.measure.value.includes('norm_delay')) {
            freeflowSpeed = ( length / freeflowSpeed ) * 3600
          }
          let currentTT = +get(data.json.tmc[tmc], currentTTGet, 0);

          if (!currentTT) continue;

          const currentSpeed = ((length / currentTT) * 3600).toFixed(1)

          let calc = freeflowSpeed - currentSpeed;

          if (calc > 0) {
            sumsByEpoch[valueOf] += calc;
          }
        }
      })

      this.sumsByEpoch = sumsByEpoch;

    }

// console.log("SUMS BY EPOCH:", sumsByEpoch);

    this.filters.time.histogram = Object.keys(sumsByEpoch).map(valueOf => {
      return { x0: +valueOf, x1: +valueOf + step, count: +sumsByEpoch[valueOf] };
    });
  }

  onFilterFetch () {
    return this.fetchData()
  }


  fetchData () {
    let selection = this.selection
    if (!selection || selection.length === 0 ) {
      return Promise.resolve({})
    }
    let year = +this.filters.date.value.split('-')[0]
    return falcorGraph.get(
      ['tmc', selection, 'attributes', ["roadname","avg_speedlimit","length", "aadt"]],
      ['tmc', selection, 'pm3', year,  ['freeflowtt', 'vd_total', 'aadt']],
      ['tmc', selection, 'year', year , 'avgtt' ],
      ['tmc', selection, 'day', this.filters.date.value, 'tt' ]
    )
  }

  onSelect(selection) {
    this.sumsByEpoch = null
    return this.fetchData();
  }
  
}

const TimeValueWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${ props => props.tmc ? '60px' : '0px' };
  transition: height 0.5s ease-out;
`;


const SliderTitle = ({ layer }) => {
  return (
    <TimeValueWrapper tmc={ layer.activeTMC }>
      <TMCGraph tmc={ layer.activeTMC }
        date={ layer.filters.date.value }/>
    </TimeValueWrapper>
  )
}

// //

const npmrdsLayer = new NPMRDSLayer("NPMRDS", {
  sources,
  name: 'npmrds',
  layers,
  active: true,
  select: {
    fromLayers:['interstate-symbology','primary-symbology'],
    property: 'tmc',
    highlightLayers: [
      {id:'interstate-symbology-select', filter: ['in', 'f_system', 1, 2]}, 
      {id:'primary-symbology-select', filter:['!in', 'f_system', 1, 2]}
    ],
  },
  selection: [],
  filters: {
    date: {
      name: 'Year',
      type: 'date',
      value: '2017-02-04', //year-mo-da,
      onChange: (map, layer) => {
        layer.sumsByEpoch = null;
      }
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
    time: {
      name: "Time",
      type: "time-range",
      step: 1000 * 60 * 5,
      onChange: (map, layer, [v1, v2], [ov1, ov2]) => {
        if (v1 !== ov1) {
          layer.filters.time.value = [v1, v1 + 1000 * 60 * 5];
        }
        else if (v2 !== ov2) {
          layer.filters.time.value = [v2 - 1000 * 60 * 5, v2];
        }
      },
      Title: () => <SliderTitle layer={ npmrdsLayer }/>
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
    
    domain: [2, 5, 15, 20],
    range: QUANTILE_RANGE,

    title: "NPMRDS Legend",
    // format: d => `$${ fnum(d) }`,
    vertical: false
  },
  popover: {
    noSticky: true,
    layers: ['interstate-symbology', 'primary-symbology'],
    dataFunc: function(feature) {
      const tmc = feature.properties.tmc;
      try {
        const graph = falcorGraph.getCache().tmc[tmc],
          year = this.filters.date.value.split("-")[0],
          // epoch = this.filters.epoch.value,
          toEpoch = new Date(this.filters.time.value[0]),
          epoch = (toEpoch.getHours() * 12) + Math.round(toEpoch.getMinutes() / 5),
          
          avgtt = graph.year[year].avgtt.value,
          day = this.filters.date.value,
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
  onClick: {
    layers: ['interstate-symbology', 'primary-symbology'],
    dataFunc: function(feature) {
      this.activeTMC = feature.properties.tmc;
      this.component.forceUpdate();
    }
  }
})

export default npmrdsLayer


