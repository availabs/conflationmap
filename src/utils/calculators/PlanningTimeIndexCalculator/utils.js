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
    (acc, { avgTT, dow, binNum }) => {
      acc[dow] = acc[dow] || {};
      acc[dow][binNum] = acc[dow][binNum] || [];
      acc[dow][binNum].push(avgTT);
      return acc;
    },
    {}
  );

  const tt95PercentilesByBinByDow = Object.keys(ttsByBinByDow).reduce(
    (dAcc, dow) => {
      dAcc[dow] = Object.keys(ttsByBinByDow[dow]).reduce((bAcc, binNum) => {
        bAcc[binNum] = ss.quantileSorted(ttsByBinByDow[dow][binNum], 0.95);
        return bAcc;
      }, {});
      return dAcc;
    },
    {}
  );

  const ttsByPeak = peakTravelTimesSorted.reduce((acc, { avgTT, peak }) => {
    acc[peak] = acc[peak] || [];
    acc[peak].push(avgTT);
    return acc;
  }, {});

  for (let i = 0; i < peakTravelTimesSorted.length; ++i) {
    const d = peakTravelTimesSorted[i];
    d.ttPercentile = ss.quantileRankSorted(ttsByPeak[d.peak], d.avgTT) * 100;
  }

  const tt95PercentilesByPeak = Object.keys(ttsByPeak).reduce((acc, peak) => {
    acc[peak] = ss.quantileSorted(ttsByPeak[peak], 0.95);
    return acc;
  }, {});

  const ptiByPeak = Object.keys(tt95PercentilesByPeak).reduce((acc, peak) => {
    acc[peak] = tt95PercentilesByPeak[peak] / freeFlowTravelTime;
    return acc;
  }, {});

  return {
    peakTravelTimesSorted,
    tt95PercentilesByBinByDow,
    tt95PercentilesByPeak,
    ptiByPeak
  };
}
