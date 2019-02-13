import get from 'lodash.get';
import deepEqual from 'deep-equal';

import { precisionRound, numbersComparator } from 'utils/calculators/MathUtils';
import { tmcAttributesMap } from 'utils/constants';

const toNumeric = n =>
  n !== '' && n !== null && n !== undefined && Number.isFinite(+n) ? +n : NaN;

// ===== TMC-LEVEL =====

const tmcAttrGetterBuilder = (attr, isNumeric) =>
  isNumeric
    ? (state, tmc) =>
        toNumeric(get(state, ['graph', 'tmc', tmc, 'attributes', attr]))
    : (state, tmc) =>
        get(state, ['graph', 'tmc', tmc, 'attributes', attr], null);

export const getTmc = (state, tmc) => tmc;

export const getTmcRoadname = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcRoadname,
  false
);

export const getTmcAvgSpeedlimit = (state, tmc) => {
  const avgSpeedlimit = get(state, [
    'graph',
    'tmc',
    tmc,
    'attributes',
    'avg_speedlimit'
  ]);

  return +avgSpeedlimit || null;
};

export const getTmcLength = (state, tmc) => {
  const length = +get(state, ['graph', 'tmc', tmc, 'attributes', 'length']);

  return length ? precisionRound(+length, 4) : null;
};

export const getTmcDirection = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcDirection,
  false
);

export const getTmcAadt = tmcAttrGetterBuilder(tmcAttributesMap.tmcAadt, true);

export const getTmcAadtSingl = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcAadtSingl,
  true
);

export const getTmcAadtCombi = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcAadtCombi,
  true
);

export const getTmcFSystem = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcFSystem,
  true
);

export const getTmcFacilType = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcFacilType,
  true
);

export const getTmcStrucType = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcStrucType,
  true
);

export const getTmcThruLanes = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcThruLanes,
  true
);

export const getTmcRouteNumb = (state, tmc) => {
  const routenumb = get(state, [
    'graph',
    'tmc',
    tmc,
    'attributes',
    'route_numb'
  ]);

  return routenumb ? +routenumb : null;
};

export const getTmcRouteSign = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcRouteSign,
  true
);

export const getTmcRouteQual = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcRouteQual,
  true
);

export const getTmcAltRteName = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcAltRteName,
  false
);

export const getTmcNHS = tmcAttrGetterBuilder(tmcAttributesMap.tmcNHS, true);

export const getTmcNHSPct = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcNHSPct,
  true
);

export const getTmcStrhntTyp = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcStrhntTyp,
  true
);

export const getTmcStrhntPct = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcStrhntPct,
  true
);

export const getTmcTruck = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcTruck,
  true
);

export const getTmcLinear = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcLinear,
  true
);

export const isTmcControlledAccess = tmcAttrGetterBuilder(
  tmcAttributesMap.McControlledAccess,
  false
);

export const getTmcCountyName = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcCountyName,
  false
);

export const getTmcCountyCode = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcCountyCode,
  false
);

export const getTmcMpoName = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcMpoName,
  false
);

export const getTmcMpoCode = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcMpoCode,
  false
);

export const getTmcUAName = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcUAName,
  false
);

export const getTmcUACode = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcUACode,
  false
);

export const getTmcStateCode = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcStateCode,
  false
);

export const getTmcStateName = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcStateName,
  false
);

export const getTmcState = tmcAttrGetterBuilder(
  tmcAttributesMap.tmcState,
  false
);

export const getTmcBoundingBox = (state, tmc) => {
  const boundingBox = get(state, [
    'graph',
    'tmc',
    tmc,
    'attributes',
    'bounding_box'
  ]);

  if (!boundingBox) {
    return null;
  }

  return typeof boundingBox === 'string'
    ? boundingBox
        .replace(/.*\(|\).*/g, '')
        .split(',')
        .map(c => c.split(/\s/).map(x => +x))
    : null;
};

const attr2getter = {
  tmc: getTmc,
  tmcAadt: getTmcAadt,
  tmcAadtCombi: getTmcAadtCombi,
  tmcAadtSingl: getTmcAadtSingl,
  tmcAltRteName: getTmcAltRteName,
  tmcAvgSpeedlimit: getTmcAvgSpeedlimit,
  tmcBoundingBox: getTmcBoundingBox,
  tmcCountyCode: getTmcCountyCode,
  tmcCountyName: getTmcCountyName,
  tmcDirection: getTmcDirection,
  tmcFSystem: getTmcFSystem,
  tmcFacilType: getTmcFacilType,
  tmcIsControlledAccess: isTmcControlledAccess,
  tmcLength: getTmcLength,
  tmcLinear: getTmcLinear,
  tmcMpoCode: getTmcMpoCode,
  tmcMpoName: getTmcMpoName,
  tmcNHS: getTmcNHS,
  tmcNHSPct: getTmcNHSPct,
  tmcRoadname: getTmcRoadname,
  tmcRouteNumb: getTmcRouteNumb,
  tmcRouteQual: getTmcRouteQual,
  tmcRouteSign: getTmcRouteSign,
  tmcState: getTmcState,
  tmcStateCode: getTmcStateCode,
  tmcStateName: getTmcStateName,
  tmcStrhntPct: getTmcStrhntPct,
  tmcStrhntTyp: getTmcStrhntTyp,
  tmcStrucType: getTmcStrucType,
  tmcThruLanes: getTmcThruLanes,
  tmcTruck: getTmcTruck,
  tmcUACode: getTmcUACode,
  tmcUAName: getTmcUAName
};

export const getTmcAttributes = (state, tmcs) => {
  const isArr = Array.isArray(tmcs);
  const tmcsArr = isArr ? tmcs : [tmcs];

  const tmcAttributes = tmcsArr.map(tmc =>
    Object.keys(attr2getter).reduce(
      (acc2, attr) => {
        const v = attr2getter[attr](state, tmc);
        if (v !== null && Number.isNaN(v)) {
          return acc2;
        }
        acc2[attr] = v;
        return acc2;
      },
      { tmc }
    )
  );

  return isArr ? tmcAttributes : tmcAttributes[0];
};

export const npmrdsDataSelector = (state, tmc, year, dataSource) => {
  if (!(state && tmc && year && dataSource)) {
    console.error(
      'ERROR: state, tmc, year, and dataSource are required parameters. Given:',
      { state, tmc, year, dataSource }
    );
  }

  return get(
    state,
    ['graph', 'tmc', tmc, 'year', year, 'npmrds', dataSource, 'value'],
    null
  );
};

export const measureInfoSelector = (state, measure) =>
  get(state, ['graph', 'pm3', 'measureInfo', measure]);

export const getMeasureSpec = (state, measure) =>
  get(state, ['graph', 'pm3', 'measureSpec', measure, 'value']);

export const getTrafficDistributionProfiles = state =>
  get(state, ['graph', 'trafficDistributions', 'profiles', 'value']);

export const getTrafficDistributionDOWAdjFactors = state =>
  get(state, ['graph', 'trafficDistributions', 'dowAdjFactors', 'value']);

// ===== GEO-LEVEL =====

// Row cols: geolevel, geoid, geoname, bounding_box, states
export const getGeoLevelsForState = (state, stateCode) =>
  get(state, ['graph', 'geo', stateCode, 'geoLevels', 'value']);

export const getPM3MeasureForTmcs = (state, tmcs, year, measure) => {
  return (Array.isArray(tmcs) ? tmcs : [tmcs]).reduce((acc, tmc) => {
    const m = get(
      state,
      ['graph', 'pm3', 'measuresByTmc', tmc, year, measure],
      null
    );
    acc[tmc] = m === null ? m : +m;
    return acc;
  }, {});
};

export const getGeographyBoundingBox = (state, stateCode, geolevel, geoid) => {
  const geoLevels = get(
    state,
    ['graph', 'geo', stateCode, 'geoLevels', 'value'],
    null
  );

  if (!geoLevels) {
    return null;
  }

  const geoLevelInfo = geoLevels.find(
    ({ geolevel: gl, geoid: gid }) => gl === geolevel && gid === geoid
  );

  return geoLevelInfo ? geoLevelInfo.bounding_box : null;
};

export const getGeographyName = (state, stateCode, geolevel, geoid) => {
  const geoLevels = get(
    state,
    ['graph', 'geo', stateCode, 'geoLevels', 'value'],
    null
  );

  if (!geoLevels) {
    return null;
  }

  const geoLevelInfo = geoLevels.find(
    ({ geolevel: gl, geoid: gid }) => gl === geolevel && gid === geoid
  );

  return geoLevelInfo ? geoLevelInfo.geoname : null;
};

export const getSelectedTmcsBoundingBox = (state, tmcs) => {
  if (!tmcs) {
    return null;
  }

  const tmcsArr = Array.isArray(tmcs) ? tmcs : [tmcs];

  const boundingBoxes = tmcsArr
    .map(tmc => getTmcBoundingBox(state, tmc))
    .filter(bb => bb);

  return boundingBoxes.length
    ? boundingBoxes.reduce(
        (acc, bb) => {
          if (!bb) {
            return acc;
          }

          const [[a, b], [c, d]] = bb;
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
    : null;
};

export const getGeoAttributes = (state, geoLevel, geoId, geoStates) => {
  const attrsArr = get(
    state,
    ['graph', 'geoAttributes', `${geoLevel}|${geoId}`, 'value'],
    null
  );

  if (!Array.isArray(attrsArr)) {
    return null;
  }

  const toMatch = geoStates.slice().sort(numbersComparator);

  return attrsArr.find(({ states }) =>
    deepEqual(states.slice().sort(numbersComparator), toMatch)
  );
};
