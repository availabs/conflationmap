import * as ss from 'simple-statistics';

import BinnedTimeUtils from '../BinnedTimeUtils';

import {
  avgArray,
  hmeanArray,
  precisionRound,
  numbersComparator
} from '../MathUtils';

import { reportingVehiclesByDataDensityIndicator } from 'utils/constants';

const setReadOnlyProperty = (that, k, v) => {
  Object.defineProperty(that, k, {
    value: v,
    writable: false,
    enumerable: true,
    configurable: false
  });
};

const getDataDensityOverInterval = dataDensities => {
  const minPossVehicles = dataDensities
    .filter(dd => dd)
    .reduce(
      (acc, dd) => acc + reportingVehiclesByDataDensityIndicator[dd][0],
      0
    );

  if (!minPossVehicles) {
    return null;
  }

  if (minPossVehicles >= reportingVehiclesByDataDensityIndicator.C[0]) {
    return 'C';
  }

  if (minPossVehicles >= reportingVehiclesByDataDensityIndicator.B[0]) {
    return 'B';
  }

  return 'A';
};

class NPMRDSDataProcessor {
  constructor({ npmrdsData, binMinutes, year, meanType }) {
    this.npmrdsData = npmrdsData;
    this.binnedTimeUtils = new BinnedTimeUtils({ binMinutes, year });

    this.binMinutes = +binMinutes;
    setReadOnlyProperty(this, 'binMinutes', binMinutes);

    this.year = +year;
    setReadOnlyProperty(this, 'year', year);

    this.meanType = meanType;
    setReadOnlyProperty(this, 'meanType', meanType);
  }

  *makeBinnedTravelTimesIterator({ peakPeriodIdentifier, tmcLength }) {
    if (!this.npmrdsData) {
      return null;
    }

    const getArrAvg = this.meanType === 'HARMONIC' ? hmeanArray : avgArray;

    const travelTimesAccumulator = [];
    const speedsAccumulator = [];
    const dataDensityIndicatorsAccumulator = [];

    let peak = null;
    let year;
    let month;
    let date;
    let dow;
    let hour;
    let minute;
    let binNum;
    let prevBinNum;

    // Accumulators assume chronologically sorted data.
    const sortedNpmrdsData = this.npmrdsData.slice().sort((a, b) => {
      const [aY, aM, aD, aE] = a.ts.split('-');
      const [bY, bM, bD, bE] = b.ts.split('-');

      return +aY - +bY || +aM - +bM || +aD - +bD || +aE - +bE;
    });

    // Iterate over the sorted timestamps.
    for (let i = 0; i < sortedNpmrdsData.length; ++i) {
      const curEpochData = sortedNpmrdsData[i];
      const { ts: timestamp } = curEpochData;

      const epoch = +timestamp.split('-')[3];
      binNum = Math.floor((epoch * 5) / this.binMinutes);

      // New bin?
      if (binNum !== prevBinNum) {
        // If the accumulators are not empty, yield the previous bin's info.
        if (travelTimesAccumulator.length) {
          const avgTT = getArrAvg(travelTimesAccumulator);
          const avgSpeed = getArrAvg(speedsAccumulator);
          const dataDensity = getDataDensityOverInterval(
            dataDensityIndicatorsAccumulator
          );

          yield {
            avgTT,
            avgSpeed,
            dataDensity,
            peak,
            year,
            month,
            date,
            dow,
            hour,
            minute,
            binNum: prevBinNum
          };
        }

        // Reset the accumulators
        travelTimesAccumulator.length = 0;
        speedsAccumulator.length = 0;
        dataDensityIndicatorsAccumulator.length = 0;

        // Get the date info.
        // INVARIANT: Bins do not cross days.
        const [y, m, d] = timestamp.split('-');
        const dateObj = new Date(`${y}-${m}-${d}T12:00:00`);

        dow = dateObj.getDay();

        year = +y;

        if (year !== this.year) {
          throw new Error(
            'INVARIANT Broken: NPMRDSDataProcessor year ≠ npmrdsData year'
          );
        }

        month = +m;
        date = +d;

        hour = +this.binnedTimeUtils.getHourOfBinNum(binNum);
        minute = +this.binnedTimeUtils.getMinuteOfBinNum(binNum);

        peak = peakPeriodIdentifier ? peakPeriodIdentifier(dow, hour) : null;

        prevBinNum = binNum;
      }

      const { tt, dd } = curEpochData;
      travelTimesAccumulator.push(tt);
      speedsAccumulator.push((tmcLength / tt) * 3600);
      dataDensityIndicatorsAccumulator.push(dd);
    }

    if (travelTimesAccumulator.length) {
      const avgTT = getArrAvg(travelTimesAccumulator);
      const avgSpeed = getArrAvg(speedsAccumulator);
      const dataDensity = getDataDensityOverInterval(
        dataDensityIndicatorsAccumulator
      );

      yield {
        avgTT,
        avgSpeed,
        dataDensity,
        peak,
        year,
        month,
        date,
        dow,
        hour,
        minute,
        binNum
      };
    }
  }

  // FIXME: This should be perBinAvgs
  getAvgsByBin({ tmcLength, peakPeriodIdentifier }) {
    return [
      ...this.makeBinnedTravelTimesIterator({ tmcLength, peakPeriodIdentifier })
    ];
  }

  // FIXME: This should be avgsByBin
  getPerBinAvgs({ tmcLength }) {
    if (!this.npmrdsData) {
      return null;
    }

    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
      tmcLength
    });

    const binsInDay = this.binnedTimeUtils.numBinsInDay;
    const binAvgPre = [...Array(binsInDay)].map(() => ({
      ct: 0,
      ttSum: 0,
      speedSum: 0
    }));

    for (let { avgTT, avgSpeed, binNum } of binnedTravelTimesIterator) {
      binAvgPre[binNum].ct += 1;
      binAvgPre[binNum].ttSum += avgTT;
      binAvgPre[binNum].speedSum += avgSpeed;
    }

    return binAvgPre.map(
      ({ ct, ttSum, speedSum }) =>
        ct
          ? {
              tt: ttSum / ct,
              speed: speedSum / ct
            }
          : { tt: null, speed: null }
    );
  }

  // FIXME: this should be avgsByBinByPeak
  getPerBinAvgsByPeak({ peakPeriodIdentifier, tmcLength } = {}) {
    if (!(this.npmrdsData && peakPeriodIdentifier)) {
      return null;
    }

    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
      peakPeriodIdentifier,
      tmcLength
    });

    const binsInPeaks = this.binnedTimeUtils.getBinsInPeaks(
      peakPeriodIdentifier
    );

    const pre = {};
    for (let { avgTT, avgSpeed, binNum, peak } of binnedTravelTimesIterator) {
      if (!pre[peak]) {
        pre[peak] = binsInPeaks[peak].reduce((acc, binNum) => {
          acc[binNum] = {
            ct: 0,
            ttSum: 0,
            speedSum: 0
          };
          return acc;
        }, {});
      }
      pre[peak][binNum].ct += 1;
      pre[peak][binNum].ttSum += avgTT;
      pre[peak][binNum].speedSum += avgSpeed;
    }

    return Object.keys(pre).reduce((pAcc, peak) => {
      pAcc[peak] = Object.keys(pre[peak]).reduce((bAcc, binNum) => {
        const { ct, ttSum, speedSum } = pre[peak];
        bAcc[binNum] = ct
          ? {
              tt: ttSum / ct,
              speed: speedSum / ct
            }
          : { tt: null, speed: null };
        return bAcc;
      }, {});

      return pAcc;
    }, {});
  }

  getDailyAvgs({ tmcLength }) {
    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
      tmcLength
    });

    const binsInDay = this.binnedTimeUtils.numBinsInDay;
    const binsInHour = this.binnedTimeUtils.numBinsInHour;

    const pre = {};
    for (let { avgTT, avgSpeed, month, date } of binnedTravelTimesIterator) {
      const dateStr = this.binnedTimeUtils.getDateString(month, date);

      if (!pre[dateStr]) {
        pre[dateStr] = {
          ct: 0,
          ttSum: 0,
          speedSum: 0,
          expectedCount: binsInDay
        };

        // https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst
        // Spring ahead and lose hour on second Sunday of March.
        if (
          month === 3 &&
          date > 7 &&
          date < 15 &&
          !new Date(`${dateStr}T12:00:00`).getDay()
        ) {
          pre[dateStr].expectedCount -= binsInHour;
        }
      }

      pre[dateStr].ct += 1;
      pre[dateStr].ttSum += avgTT;
      pre[dateStr].speedSum += avgSpeed;
    }

    return Object.keys(pre).reduce((acc, dateStr) => {
      const { ct, ttSum, speedSum, expectedCount } = pre[dateStr];

      acc[dateStr] = {
        tt: ttSum / ct,
        speed: speedSum / ct,
        dataCompleteness: (ct / expectedCount) * 100
      };

      return acc;
    }, {});
  }

  getDailyAvgsByPeak({ peakPeriodIdentifier, tmcLength, metric } = {}) {
    if (!(this.npmrdsData && peakPeriodIdentifier)) {
      return null;
    }

    const binsInHour = this.binnedTimeUtils.numBinsInHour;

    const binsInPeaks = this.binnedTimeUtils.getBinsInPeaks(
      peakPeriodIdentifier
    );

    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
      peakPeriodIdentifier,
      tmcLength
    });

    const pre = {};

    for (let {
      avgTT,
      avgSpeed,
      peak,
      month,
      date
    } of binnedTravelTimesIterator) {
      if (!peak) {
        continue;
      }

      const dateStr = this.binnedTimeUtils.getDateString(month, date);

      if (!pre[peak]) {
        pre[peak] = {};
      }

      if (!pre[peak][dateStr]) {
        pre[peak][dateStr] = {
          ct: 0,
          ttSum: 0,
          speedSum: 0,
          expectedCount: binsInPeaks[peak].length
        };

        // https://www.nist.gov/pml/time-and-frequency-division/popular-links/daylight-saving-time-dst
        // Spring ahead and lose hour on second Sunday of March.
        if (
          month === 3 &&
          date > 7 &&
          date < 15 &&
          !new Date(`${dateStr}T12:00:00`).getDay()
        ) {
          pre[peak][dateStr].expectedCount -= binsInHour;
        }
      }

      pre[peak][dateStr].ct += 1;
      pre[peak][dateStr].ttSum += avgTT;
      pre[peak][dateStr].speedSum += avgSpeed;
    }

    return Object.keys(pre).reduce((peakAcc, peak) => {
      peakAcc[peak] = Object.keys(pre[peak]).reduce((dateAcc, dateStr) => {
        const { ct, ttSum, speedSum, expectedCount } = pre[peak][dateStr];

        dateAcc[dateStr] = {
          tt: ttSum / ct,
          speed: speedSum / ct,
          dataCompleteness: (ct / expectedCount) * 100
        };

        return dateAcc;
      }, {});

      return peakAcc;
    }, {});
  }

  getStatsByBinByDOW({ tmcLength, metric } = {}) {
    if (!this.npmrdsData) {
      return null;
    }

    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
      tmcLength
    });

    const binsInDay = this.binnedTimeUtils.numBinsInDay;

    // Initialize the collector array
    const pre = [...Array(7)].map(() =>
      [...Array(binsInDay)].map(() => ({
        tts: [],
        speeds: []
      }))
    );

    for (let { avgTT, avgSpeed, binNum, dow } of binnedTravelTimesIterator) {
      pre[dow][binNum].tts.push(precisionRound(avgTT));
      pre[dow][binNum].speeds.push(precisionRound(avgSpeed));
    }

    return pre.map(binsArr =>
      binsArr.map(({ tts, speeds }) => {
        tts = tts.sort(numbersComparator);
        speeds = speeds.sort(numbersComparator);

        return {
          mean: {
            tt: tts.length ? ss.mean(tts) : NaN,
            speed: speeds.length ? ss.mean(speeds) : NaN
          },
          mode: {
            tt: tts.length ? ss.modeSorted(tts) : NaN,
            speed: speeds.length ? ss.modeSorted(speeds) : NaN
          },
          median: {
            tt: tts.length ? ss.medianSorted(tts) : NaN,
            speed: speeds.length ? ss.medianSorted(speeds) : NaN
          },
          harmonicMean: {
            tt: tts.length && !tts.some(tt => !tt) ? ss.harmonicMean(tts) : NaN,
            speed: speeds.length ? ss.harmonicMean(speeds) : NaN
          },
          skewness: {
            tt: tts.length >= 3 ? ss.sampleSkewness(tts) : NaN,
            speed: speeds.length >= 3 ? ss.sampleSkewness(speeds) : NaN
          },
          variance: {
            tt: tts.length ? ss.variance(tts) : NaN,
            speed: speeds.length ? ss.variance(speeds) : NaN
          },
          standardDeviation: {
            tt: tts.length ? ss.standardDeviation(tts) : NaN,
            speed: speeds.length ? ss.standardDeviation(speeds) : NaN
          },
          medianAbsoluteDeviation: {
            tt: tts.length ? ss.medianAbsoluteDeviation(tts) : NaN,
            speed: speeds.length ? ss.medianAbsoluteDeviation(speeds) : NaN
          },
          interquartileRange: {
            tt: tts.length ? ss.interquartileRange(tts) : NaN,
            speed: speeds.length ? ss.interquartileRange(speeds) : NaN
          }
        };
      })
    );
  }

  getPercentiles({ tmcLength, requiredPercentiles } = {}) {
    if (!(this.npmrdsData && requiredPercentiles)) {
      return null;
    }

    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
      tmcLength
    });

    const tts = [];
    const speeds = [];
    for (let { avgTT, avgSpeed } of binnedTravelTimesIterator) {
      tts.push(avgTT);
      speeds.push(avgSpeed);
    }

    tts.sort((a, b) => +a - +b);
    speeds.sort((a, b) => +a - +b);

    const len = tts.length;

    return requiredPercentiles.reduce(
      (pctAcc, pct) => {
        const idx = Math.round((pct / 100) * (len - 1));
        pctAcc.tt[pct] = tts[idx];
        pctAcc.speed[pct] = speeds[idx];

        return pctAcc;
      },
      { tt: {}, speed: {} }
    );
  }

  // NOTE: If peakPeriodIdentifier not defined, returns null.
  //       If no peaks are desired, use getPercentiles instead.
  //
  // INVARIANT: data structure returned by getPercentiles equals
  //            data structure for each peak returned by this function.
  getPercentilesByPeak({
    avgsByBin,
    peakPeriodIdentifier,
    tmcLength,
    requiredPercentilesByPeak
  } = {}) {
    if (
      !(
        (avgsByBin && requiredPercentilesByPeak) ||
        (this.npmrdsData && peakPeriodIdentifier && requiredPercentilesByPeak)
      )
    ) {
      return null;
    }

    let data = avgsByBin;

    if (!data) {
      const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
        peakPeriodIdentifier,
        tmcLength
      });

      data = [...binnedTravelTimesIterator];
    }

    const peakPercentilesPre = data.reduce((acc, { avgTT, avgSpeed, peak }) => {
      if (!peak) {
        return acc;
      }

      if (!acc[peak]) {
        acc[peak] = { tt: [], speed: [] };
      }

      acc[peak].tt.push(avgTT);
      acc[peak].speed.push(avgSpeed);

      return acc;
    }, {});

    const peakPercentiles = Object.keys(peakPercentilesPre).reduce(
      (peakAcc, peak) => {
        const tts = peakPercentilesPre[peak].tt.sort(numbersComparator);
        const speeds = peakPercentilesPre[peak].speed.sort(numbersComparator);

        const percentiles = requiredPercentilesByPeak[peak].sort(
          numbersComparator
        );

        if (percentiles) {
          peakAcc[peak] = requiredPercentilesByPeak[peak].reduce(
            (pctAcc, pct) => {
              pctAcc.tt[pct] = ss.quantileSorted(tts, pct / 100);
              pctAcc.speed[pct] = ss.quantileSorted(speeds, pct / 100);
              return pctAcc;
            },
            { tt: {}, speed: {} }
          );
        }

        return peakAcc;
      },
      {}
    );

    return peakPercentiles;
  }

  getPerBinPercentiles({ tmcLength, requiredPercentiles } = {}) {
    if (!(this.npmrdsData && requiredPercentiles)) {
      return null;
    }

    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
      tmcLength
    });

    const binsInDay = this.binnedTimeUtils.numBinsInDay;

    const binPercentilesPre = [...binnedTravelTimesIterator].reduce(
      (acc, { avgTT, avgSpeed, binNum }) => {
        acc[binNum].tts.push(avgTT);
        acc[binNum].speeds.push(avgSpeed);

        return acc;
      },
      [...Array(binsInDay)].map(() => ({ tts: [], speeds: [] }))
    );

    const binPercentiles = binPercentilesPre.reduce(
      (binAcc, { tts, speeds }) => {
        const len = tts.length;

        if (!len) {
          binAcc.push({ tt: null, speed: null });
          return binAcc;
        }

        tts.sort((a, b) => +a - +b);
        speeds.sort((a, b) => +a - +b);

        binAcc.push(
          requiredPercentiles.reduce((pctAcc, pct) => {
            const idx = Math.round((pct / 100) * (len - 1));

            pctAcc[pct] = {
              tt: tts[idx],
              speed: speeds[idx]
            };

            return pctAcc;
          }, {})
        );

        return binAcc;
      },
      []
    );

    return binPercentiles;
  }

  getPerBinPercentilesByPeak({
    peakPeriodIdentifier,
    tmcLength,
    requiredPercentiles
  } = {}) {
    if (!(this.npmrdsData && peakPeriodIdentifier && requiredPercentiles)) {
      return null;
    }

    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator({
      peakPeriodIdentifier,
      tmcLength
    });

    const binsInPeaks = this.binnedTimeUtils.getBinsInPeaks(
      peakPeriodIdentifier
    );

    const pre = {};
    for (let { avgTT, avgSpeed, binNum, peak } of binnedTravelTimesIterator) {
      if (!pre[peak]) {
        pre[peak] = binsInPeaks[peak].reduce((acc, binNum) => {
          acc[binNum] = {
            tts: [],
            speeds: []
          };
          return acc;
        }, {});
      }

      pre[peak][binNum].tts.push(avgTT);
      pre[peak][binNum].speeds.push(avgSpeed);
    }

    return Object.keys(pre).reduce((pAcc, peak) => {
      pAcc[peak] = Object.keys(pre[peak]).reduce((bAcc, binNum) => {
        const { tts, speeds } = pre[peak][binNum];
        tts.sort((a, b) => +a - +b);
        speeds.sort((a, b) => +a - +b);

        const len = tts.length;

        bAcc[binNum] = len
          ? requiredPercentiles.reduce(
              (pctAcc, pct) => {
                const idx = Math.round((pct / 100) * (len - 1));

                pctAcc.tt[pct] = tts[idx];
                pctAcc.speed[pct] = speeds[idx];

                return pctAcc;
              },
              { tt: {}, speed: {} }
            )
          : { tt: null, speed: null };
        return bAcc;
      }, {});

      return pAcc;
    }, {});
  }

  getPerBinPercentEpochsReporting() {
    if (!this.npmrdsData) {
      return null;
    }

    const binnedTravelTimesIterator = this.makeBinnedTravelTimesIterator();

    const binsInHour = this.binnedTimeUtils.numBinsInHour;
    const twoAmBinNum = 2 * binsInHour;
    const threeAmBinNum = 3 * binsInHour;

    // Initialize the array
    const binsInDay = this.binnedTimeUtils.numBinsInDay;

    const pctsByBin = Array(binsInDay).fill(0);

    const daysInYear = this.binnedTimeUtils.numDaysInYear;
    for (let { binNum } of binnedTravelTimesIterator) {
      const days =
        binNum >= twoAmBinNum && binNum < threeAmBinNum
          ? daysInYear - 1 // Daylight savings, spring ahead, bin sprung over
          : daysInYear;

      pctsByBin[binNum] += (1 / days) * 100;
    }

    // INVARIANT: % <= 100
    for (let i = 0; i < binsInDay; ++i) {
      const pct = pctsByBin[i];
      pctsByBin[i] = Math.min(pct, 100);
    }

    return pctsByBin;
  }
}

export default NPMRDSDataProcessor;
