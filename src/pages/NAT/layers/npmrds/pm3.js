// import React from "react"

//import store from "store"
import { falcorGraph } from "store/falcorGraph"
// import get from 'lodash.get'

// import { update } from "utils/redux-falcor/components/duck"

import MapLayer from "components/AvlMap/MapLayer"
import { fnum } from "components/common/utils"

import * as d3scale from "d3-scale"


import COLOR_RANGES from "constants/color-ranges"


import {layers, sources} from './layer-styles'
import clone from 'clone';

let pm3Layers = clone(layers).forEach(layer => layer.id += '_pm3')


const QUANTILE_RANGE = COLOR_RANGES[5].reduce((a, c) => c.name === "RdYlBu" ? c.colors : a).reverse()

const DEFAULT_COLORS = {
  lottr: COLOR_RANGES[5].reduce((a,c) => c.name === "RdYlBu" ? c.colors : a).reverse(),
  tttr: COLOR_RANGES[5].reduce((a,c) => c.name === "Purples" ? c.colors : a),
  default: COLOR_RANGES[5].reduce((a,c) => c.name === "Reds" ? c.colors : a)

}
// import ParcelLayerModal from "./modals/ParcelLayerModal"


class PM3Layer extends MapLayer {
   
  onAdd(map) {
    super.onAdd(map)

    this.loading = true;
    falcorGraph.get(
      ['geo', '36', 'geoLevels'],
      ['pm3', 'measureIds']
    ).then(res => {
        console.log('res', res)
        return ({geographies: res.json.geo['36'].geoLevels, measures: res.json.pm3.measureIds})
      })
      .then(data => {
        let {geographies, measures} = data
        
        falcorGraph.get(
          ['pm3', 'measureInfo', measures, ['fullname', 'definition', 'equation', 'source']]
        ).then(data => {
          this.filters.measure.domain = Object.keys(data.json.pm3.measureInfo)
            .filter(measureKey => {
              return measureKey !== '$__path'
              // return measureKey.split('_').length === 1 && !measureKey.includes('am') && !measureKey.includes('pm') 
            })
            .map(key => {
              return {name: data.json.pm3.measureInfo[key].fullname, value: key}
            })
          
          this.filters.measure.meta = data.json.pm3.measureInfo

          this.filters.geography.domain = geographies
            .map(geo => ({
              name: `${geo.geoname.toUpperCase()} ${geo.geolevel}`,
              geolevel: geo.geolevel,
              value: geo.geoid, 
              bounding_box: geo.bounding_box 
            }))
            
        }).then(() => this.component.forceUpdate())

      })
  }

  receiveData ( map, data) {
    if(!data.json || !data.json.tmc || this.selection.length === 0) return;
    let selection = this.selection
    let year = +this.filters.year.value
    let measure = this.filters.measure.value
    let measureName = this.filters.measure.domain.filter(d => d.value === measure)[0].name

    let getMeasure = `${year}.${measure}`

    let allValues = selection.map(tmc => data.json.pm3.measuresByTmc[tmc][year][measure] || 0).sort((a,b) => a > b)

    this.legend.active = true
    this.legend.title = measureName + ' ' + year

    let type = this.legend.type,
        range = this.legend.range,
        scale = null,
        min = Math.min(...allValues),
        max = Math.max(...allValues);
    switch (type) {
      case "quantile":
        scale = d3scale.scaleQuantile()
          .domain(allValues)
          .range(range);
        this.legend.domain = allValues;
        break;
      case "quantize":
        scale = d3scale.scaleQuantize()
          .domain([min, max])
          .range(range);
        this.legend.domain = [min,max];
        break;
      case "threshold":
        scale = d3scale.scaleThreshold()
          .domain(this.legend.domain)
          .range(range);
        break;
      case "linear":
        scale = d3scale.scaleLinear()
          .domain(this.legend.domain)
          .range(range);
        break;
    }

    let colors = selection.reduce((out,tmc) => {
      out[tmc] = scale(data.json.pm3.measuresByTmc[tmc][year][measure] || 0)
      return out;
    }, {})
      
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
    return this.component.forceUpdate(); 
  }

  onFilterFetch () {
    return this.fetchData()
  }

  fetchData ( ) {
    let selection = this.selection
    // console.log('selection', this.selection)
    if (!selection || selection.length === 0 ) {
      return Promise.resolve({})
    }
    let year = +this.filters.year.value
    return falcorGraph.get(
        ['tmc', selection, 'attributes', ["roadname","avg_speedlimit","length", "aadt"]],
        ['pm3', 'measuresByTmc', selection, this.filters.year.value, this.filters.measure.value],
        ['pm3', 'measureIds']
      ).then(res => {
        // console.log('getting data', res)
        return res
      })
  }
  
}


const pm3Layer = new PM3Layer("Performance Measures ", {
  sources: sources,
  name: 'Performance Measures',
  layers: layers,
  active: false,
  // select: {
  //   fromLayers:['interstate-symbology','primary-symbology'],
  //   property: 'tmc',
  //   highlightLayers: [
  //     {id:'interstate-symbology-select', filter: ['in', 'f_system', 1, 2]}, 
  //     {id:'primary-symbology-select', filter:['!in', 'f_system', 1, 2]}
  //   ],
  // },
  selection: [],
  filters: {
    geography: {
      name: 'Geography',
      type: 'multi',
      domain: [],
      onChange: (map, layer, value) => {
        console.log(layer.filters.geography, value)
        let currentValues = layer.filters.geography.domain.filter(d => value.includes(d.value))
        console.log(currentValues)
        if(currentValues) {
          let bb = currentValues.reduce(
          (
            acc,
            { bounding_box: [[a, b], [c, d]] }
            ) => {
              if (+a < acc[0][0]) {
                acc[0][0] = +a;
              }
              if (+b < acc[0][1]) {
                acc[0][1] = +b;
              }
              if (+c > acc[1][0]) {
                acc[1][0] = +c;
              }
              if (+d > acc[1][1]) {
                acc[1][1] = +d;
              }
              return acc;
            },
            [
              [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
              [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
            ]
          )
          if(bb[0][0] < Number.POSITIVE_INFINITY) {
            map.fitBounds(bb)
          }

          let geoFilter = currentValues.reduce((acc, current) => {
              acc[`${current.geolevel.toLowerCase()}_code`].push(current.value)
              return acc;
            },
            {"state_code":[],"ua_code":[],"mpo_code":[],"county_code":[]}
          )

          let mapboxClauses = Object.keys(geoFilter).reduce((acc, geoLevel) => {
            if (!(Array.isArray(geoFilter[geoLevel]) && geoFilter[geoLevel].length)) {
              return acc;
            }

            acc.push(...geoFilter[geoLevel].map(geoid => ['in', geoLevel, geoid]));
            return acc;
          }, []);

          const mapboxFilter = ['any', ...mapboxClauses];

          let getTmcs = () => {
            return new Promise(resolve => {
              const listener = () => {
                if (
                  !(map.isMoving() || map.isZooming() || map.isRotating()) &&
                  map.areTilesLoaded()
                ) {
                  map.off('render', listener);
                    const d = map.querySourceFeatures('npmrds', {
                    filter: mapboxFilter,
                    sourceLayer: 'tmcsAttrs'
                  });
                  let tmcs = d.map(({ properties: { tmc } }) => tmc)
                  return resolve(tmcs)
                }
              };
              map.on('render', listener);
            })
          }

          getTmcs().then(tmcs => {
            layer.component.onSelect(layer.name, tmcs)
          })
    
        }
      },
      value: [] //year-mo-da
    },
    year: {
      name: 'year',
      type: 'dropdown',
      domain: [2017,2018],
      value: 2018
    },
    measure: {
      name: 'Performance Measure',
      type: 'dropdown',
      domain: [{name: 'Level of Travel Time Reliability', value: 'lottr'}],
      value: 'lottr',
      onChange: (map, layer, value) => {
        //console.log('on measure change', layer, value)

        let baseKey = value.split('_')[0]
        switch(baseKey){
          case 'lottr':
            layer.legend.type = 'threshold'
            layer.legend.domain =  [1.1,1.25,1.5,1.75,2]
            layer.legend.range =  DEFAULT_COLORS[baseKey]
            layer.legend.format =  d => d.toLocaleString(undefined, {maximumFractionDigits: 2})
            break;
          case 'tttr':
            layer.legend.type = 'threshold'
            layer.legend.domain =  [1.1,1.25,1.5,1.75,2]
            layer.legend.range =  DEFAULT_COLORS[baseKey]
            layer.legend.format =  d => d.toLocaleString(undefined, {maximumFractionDigits: 2})
            break;
          default:
            layer.legend.type = 'quantile'
            layer.legend.range =  DEFAULT_COLORS['default']
            layer.legend.format =  d => d.toLocaleString(undefined, {maximumFractionDigits: 0})
            break;
        }
      }
    }
  },
  legend: {
        active: false,

        type: "threshold",

        types: ["threshold","linear", "quantile", "quantize"],
        
        domain: [1.1,1.25,1.5,1.75,2],
        range:  DEFAULT_COLORS['lottr'],

        title: "",
        format: d => d.toLocaleString(undefined, {maximumFractionDigits: 0}),
        vertical: false
    },
    popover: {
      layers: ['interstate-symbology', 'primary-symbology'],
      dataFunc: function (feature) {
        const tmc = feature.properties.tmc;
        try {
          const graph = falcorGraph.getCache().tmc[tmc]
          const pm3 = falcorGraph.getCache().pm3.measuresByTmc[tmc]
          let   length = graph.attributes.length
          
          let measureData = this.legend.format(pm3[this.filters.year.value][this.filters.measure.value])
            
          const measureName = this.filters.measure.domain.filter(d => d.value === this.filters.measure.value)[0].name
          return [graph.attributes.roadname,
            ["TMC", tmc],
            // ["Length", `${ graph.attributes.length.toFixed(2) } miles`],
            // ["AADT", graph.attributes.aadt.toLocaleString()],
            // ["Speed Limit", `${graph.attributes.avg_speedlimit.toLocaleString()} mph`],
            [measureName, measureData]
          ]
        }
        catch (e) {
          // console.log('e', e)
          return ["NPMRDS",
            ["TMC", tmc]
          ]
        }
      }
    },
})

export default pm3Layer


