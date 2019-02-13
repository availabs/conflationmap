// import { computeSummaryStats } from 'utils/calculators/MathUtils';

import TmcAttributeDerivers from 'utils/calculators/TmcAttributeDerivers';

import { INTERSTATE, NONINTERSTATE } from 'utils/constants';

const getTmcAvgVehicleOccupancy = ({ aadt, aadt_singl, aadt_combi }) =>
  TmcAttributeDerivers.getAvgVehicleOccupancy({
    tmcAadt: aadt,
    tmcAadtSingl: aadt_singl,
    tmcAadtCombi: aadt_combi
  });

const newTMCsInfoCollectorObj = () => ({
  [INTERSTATE]: {
    tmc: [],
    length: [],
    lottr: [],
    lottrWeight: [],
    avgVehOcc: [],
    directionalAadt: []
  },
  [NONINTERSTATE]: {
    tmc: [],
    length: [],
    lottr: [],
    lottrWeight: [],
    avgVehOcc: [],
    directionalAadt: []
  }
});

const collect = (collector, { tmc, length, lottr, w, avo, directionalAadt }) => {
  collector.tmc.push(tmc);
  collector.length.push(length);
  collector.lottr.push(lottr);
  collector.lottrWeight.push(w);
  collector.avgVehOcc.push(avo);
  collector.directionalAadt.push(directionalAadt);
};

export const collectGeoLevelLOTTRInfo = ({ data }) => {
  if (!Array.isArray(data)) {
    return null;
  }

  const passingTMCsInfoCollector = newTMCsInfoCollectorObj();
  const failingTMCsInfoCollector = newTMCsInfoCollectorObj();
  const totalTMCsInfoCollector = newTMCsInfoCollectorObj();

  for (let i = 0; i < data.length; ++i) {
    const {
      tmc,
      length,
      aadt,
      aadt_singl,
      aadt_combi,
      f_system,
      faciltype,
      lottr
    } = data[i];

    const roadType = +f_system === 1 ? INTERSTATE : NONINTERSTATE;

    const avo = getTmcAvgVehicleOccupancy({ aadt, aadt_singl, aadt_combi });

    const dirFactor = Math.min(+faciltype, 2);

    const directionalAadt = aadt / dirFactor;

    const w = +length * +avo * +directionalAadt;

    const d = { tmc, length, lottr, w, avo, directionalAadt };

    if (w) {
      const focusedCollector =
        lottr < 1.5
          ? passingTMCsInfoCollector[roadType]
          : failingTMCsInfoCollector[roadType];
      collect(focusedCollector, d);
    }

    collect(totalTMCsInfoCollector[roadType], d);
  }

  return {
    passing: passingTMCsInfoCollector,
    failing: failingTMCsInfoCollector,
    total: totalTMCsInfoCollector
  };
};

export const getGeoLevelLOTTR = ({ data }) => {
  if (!Array.isArray(data)) {
    return null;
  }

  const numerators = {
    [INTERSTATE]: 0,
    [NONINTERSTATE]: 0
  };
  const denominators = {
    [INTERSTATE]: 0,
    [NONINTERSTATE]: 0
  };

  for (let i = 0; i < data.length; ++i) {
    const {
      length,
      f_system,
      faciltype,
      aadt,
      aadt_singl,
      aadt_combi,
      lottr
    } = data[i];

    const roadType = +f_system === 1 ? INTERSTATE : NONINTERSTATE;

    const dirFactor = Math.min(+faciltype, 2);

    const directionalAadt = aadt / dirFactor;

    const avo = getTmcAvgVehicleOccupancy({ aadt, aadt_singl, aadt_combi });

    const w = +length * +avo * +directionalAadt;

    if (w) {
      if (lottr < 1.5) {
        numerators[roadType] += w;
      }
      denominators[roadType] += w;
    }
  }

  return {
    [INTERSTATE]: denominators[INTERSTATE]
      ? numerators[INTERSTATE] / denominators[INTERSTATE]
      : null,
    [NONINTERSTATE]: denominators[NONINTERSTATE]
      ? numerators[NONINTERSTATE] / denominators[NONINTERSTATE]
      : null
  };
};
