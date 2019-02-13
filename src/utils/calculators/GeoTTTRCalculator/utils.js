// import { computeSummaryStats } from 'utils/calculators/MathUtils';

import { INTERSTATE, NONINTERSTATE } from 'utils/constants';

const newTMCsInfoCollectorObj = () => ({
  [INTERSTATE]: {
    tmc: [],
    length: [],
    tttr: [],
    tttrWeight: []
  },
  [NONINTERSTATE]: {
    tmc: [],
    length: [],
    tttr: [],
    tttrWeight: []
  }
});

const collect = (collector, { tmc, length, tttr, w }) => {
  collector.tmc.push(tmc);
  collector.length.push(length);
  collector.tttr.push(tttr);
  collector.tttrWeight.push(w);
};

export const collectGeoLevelTTTRInfo = ({ data }) => {
  if (!Array.isArray(data)) {
    return null;
  }

  const tmcsInfoCollector = newTMCsInfoCollectorObj();

  for (let i = 0; i < data.length; ++i) {
    const { tmc, length, f_system, tttr } = data[i];

    const roadType = +f_system === 1 ? INTERSTATE : NONINTERSTATE;

    const w = +length * +tttr;

    const d = { tmc, length, tttr, w };

    collect(tmcsInfoCollector[roadType], d);
  }

  return { total: tmcsInfoCollector };
};

export const getGeoLevelTTTR = ({ data }) => {
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
    const { length, f_system, tttr } = data[i];

    const roadType = +f_system === 1 ? INTERSTATE : NONINTERSTATE;

    const w = +length * +tttr;

    if (w) {
      numerators[roadType] += w;
      denominators[roadType] += length;
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
