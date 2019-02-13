import sortBy from 'lodash.sortby';
import cloneDeep from 'lodash.clonedeep';
import * as ss from 'simple-statistics';

export function analyzeAvgsByBin() {
  console.log(this);
  const { avgsByBin } = this;

  if (!Array.isArray(avgsByBin)) {
    return null;
  }

  // Clone because we later mutate the element objects
  const offPeakSortedBySpeed = cloneDeep(
    sortBy(avgsByBin.filter(({ peak }) => peak), [d => d.avgSpeed])
  );

  if (!offPeakSortedBySpeed.length) {
    return null;
  }

  const speeds = offPeakSortedBySpeed.map(({ avgSpeed }) => avgSpeed);

  for (let i = 0; i < offPeakSortedBySpeed.length; ++i) {
    const d = offPeakSortedBySpeed[i];
    d.speedPercentile = ss.quantileRankSorted(speeds, d.avgSpeed) * 100;
  }

  const freeFlowSpeed = ss.quantileSorted(speeds, 0.85);

  const speedsByOffPeakPeriod = offPeakSortedBySpeed.reduce(
    (acc, { avgSpeed, peak }) => {
      acc[peak] = acc[peak] || [];
      acc[peak].push(avgSpeed);
      return acc;
    },
    {}
  );

  const freeFlowSpeedByOffPeakPeriod = Object.keys(
    speedsByOffPeakPeriod
  ).reduce((acc, peak) => {
    acc[peak] = ss.quantileSorted(speedsByOffPeakPeriod[peak], 0.85);
    return acc;
  }, {});

  return { offPeakSortedBySpeed, freeFlowSpeed, freeFlowSpeedByOffPeakPeriod };
}
