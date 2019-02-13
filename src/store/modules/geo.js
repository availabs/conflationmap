import geoApi from 'store/data-adapters/geoApi' 

let geoData = new geoApi();
// ------------------------------------
// Constants
// ------------------------------------
const SET_CHILD_GEO = 'SET_CHILD_GEO';

// ------------------------------------
// Actions
// ------------------------------------
function setChildGeo(geoid, data, geoType, mesh=false, merge=false) {
  return {
    type: SET_CHILD_GEO,
    geoid,
    data,
    geoType,
    mesh,
    merge
  };
}

export const getChildGeo = (geoid=36, geoType='counties') => {
  return dispatch => {
    return geoData.getChildGeo(geoid, geoType).then(data => {
      dispatch(setChildGeo(geoid,data, geoType))
    })
  } 
};
export const getGeoMesh = (geoid=36, geoType='counties') => {
  return dispatch => {
    return geoData.getGeoMesh(geoid, geoType)
      .then(data => {
        dispatch(setChildGeo(geoid, data, geoType, true));
      })
  } 
};
export const getGeoMerge = (geoid=36, geoType='counties') => {
  return dispatch => {
    return geoData.getGeoMerge(geoid, geoType)
      .then(data => {
        dispatch(setChildGeo(geoid, data, geoType, false, true));
      })
  } 
};



// export const actions = {
//   getHazardTotal
// };


// -------------------------------------
// Initial State
// -------------------------------------
let initialState = require('./geoInitialState.json')

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SET_CHILD_GEO]: (state = initialState, action) => {
    let newState = Object.assign({}, state);
    if (action.merge) {
      let value  = Object.assign({}, state["merge"][action.geoid], {[action.geoType]: action.data})
      newState["merge"][action.geoid] = value
    }
    else if (action.mesh) {
      let value  = Object.assign({}, state["mesh"][action.geoid], {[action.geoType]: action.data})
      newState["mesh"][action.geoid] = value
    }
    else {
      // add childGeo to previous state geoid
      let value  = Object.assign({}, state[action.geoid], {[action.geoType]: action.data})
      // then set the geoid equal to the expanded value
      newState[action.geoid] = value
    }
    return newState;
  }
};

export default function riskIndexReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}