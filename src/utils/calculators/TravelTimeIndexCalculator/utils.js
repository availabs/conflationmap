import sortBy from 'lodash.sortby';
import cloneDeep from 'lodash.clonedeep';
import * as ss from 'simple-statistics';

export function analyzeAvgsByBin() {
  const { avgsByBin, freeFlowTravelTime } = this;

  if (!(Array.isArray(avgsByBin) && avgsByBin.length && freeFlowTravelTime)) {
    return null;
  }

  // Clone because we later mutate the element objects
  const peakTravelTimesSorted = cloneDeep(
    sortBy(avgsByBin.filter(({ peak }) => peak), [d => d.avgTT])
  );

  if (!peakTravelTimesSorted.length) {
    return null;
  }

  const ttsByBinByDow = peakTravelTimesSorted.reduce(
    (acc, { avgTT, binNum, dow }) => {
      acc[dow] = acc[dow] || {};
      acc[dow][binNum] = acc[dow][binNum] || [];
      acc[dow][binNum].push(avgTT);
      return acc;
    },
    {}
  );

  const ttAvgsByBinByDow = Object.keys(ttsByBinByDow).reduce((dAcc, dow) => {
    dAcc[dow] = Object.keys(ttsByBinByDow[dow]).reduce((bAcc, binNum) => {
      bAcc[binNum] = ss.mean(ttsByBinByDow[dow][binNum]);
      return bAcc;
    }, {});
    return dAcc;
  }, {});

  const ttsByPeak = peakTravelTimesSorted.reduce((acc, { avgTT, peak }) => {
    acc[peak] = acc[peak] || [];
    acc[peak].push(avgTT);
    return acc;
  }, {});

  const ttAvgsByPeak = Object.keys(ttsByPeak).reduce((acc, peak) => {
    acc[peak] = ss.mean(ttsByPeak[peak]);
    return acc;
  }, {});

  const ttiByPeak = Object.keys(ttAvgsByPeak).reduce((acc, peak) => {
    acc[peak] = ttAvgsByPeak[peak] / freeFlowTravelTime;
    return acc;
  }, {});

  return {
    peakTravelTimesSorted,
    ttAvgsByBinByDow,
    ttAvgsByPeak,
    ttiByPeak
  };
}
