let topojson = require('topojson')
const HOST = '/';


class riskIndexAPI {
  constructor () { 
    this.data = {}
  }

  getData (geoid, mesh=false) {
    return new Promise((resolve, reject) => {
      if(this.data[geoid]) {
        resolve(this.data[geoid]);
      }
      else { 
        fetch(`${HOST}geo/${geoid}.json`, {
          headers: { 'Content-Type': 'text/csv' }
        })
        .then(response => response.json())
        .then(geoResponse => {
          this.data[geoid] = geoResponse;
          resolve(geoResponse);
        })
      }
    })
  }

  getChildGeo (geoid, type) {
    return new Promise((resolve, reject) => {
      this.getData(geoid).then(topology  => {
        // console.log('testing messups', Object.keys(topology.objects), type)
        resolve(
          topojson.feature(topology, topology.objects[type])
        )
      })
    })
  }

  getGeoMesh (geoid, type) {
    return new Promise((resolve, reject) => {
      this.getData(geoid).then(topology  => {
        resolve({
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            properties: { geoid },
            geometry: topojson.mesh(topology, topology.objects[type])
          }]
        })
      })
    })
  }

  getGeoMerge (geoid, type) {
    return new Promise((resolve, reject) => {
      this.getData(geoid).then(topology  => {
        resolve(
          topojson.merge(topology, topology.objects[type].geometries)
        )
      })
    })
  }

  
}

export default riskIndexAPI