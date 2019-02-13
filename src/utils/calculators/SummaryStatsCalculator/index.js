import Calculator from '../Calculator';

import {
  getFiveNumberSummary,
  getFiveNumberSummaryByPeak,
  getPerBinFiveNumberSummaries,
  getPerBinFiveNumberSummariesByPeak
} from './utils';

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true
  });
}

export default class SummaryStatsCalculator extends Calculator {
  get statsByBinByDOW() {
    memoizeLazyGetter.call(
      this,
      'statsByBinByDOW',
      this.npmrdsDataProcessor.getStatsByBinByDOW(this)
    );
    return this.statsByBinByDOW;
  }

  get perBinAvgs() {
    const perBinAvgs = this.npmrdsDataProcessor.getPerBinAvgs(this);
    memoizeLazyGetter.call(
      this,
      'perBinAvgs',
      perBinAvgs && { TOTAL: perBinAvgs }
    );
    return this.perBinAvgs;
  }

  get perBinAvgsByPeak() {
    memoizeLazyGetter.call(
      this,
      'perBinAvgsByPeak',
      this.npmrdsDataProcessor.getPerBinAvgsByPeak(this)
    );
    return this.perBinAvgsByPeak;
  }

  get dailyAvgs() {
    const dailyAvgs = this.npmrdsDataProcessor.getDailyAvgs(this);
    memoizeLazyGetter.call(
      this,
      'dailyAvgs',
      dailyAvgs && { TOTAL: dailyAvgs }
    );
    return this.dailyAvgs;
  }

  get dailyAvgsByPeak() {
    memoizeLazyGetter.call(
      this,
      'dailyAvgsByPeak',
      this.npmrdsDataProcessor.getDailyAvgsByPeak(this)
    );
    return this.dailyAvgsByPeak;
  }

  get percentageOfReportingEpochsByBin() {
    memoizeLazyGetter.call(
      this,
      'percentageOfReportingEpochsByBin',
      this.npmrdsDataProcessor.getPerBinPercentEpochsReporting(this)
    );
    return this.percentageOfReportingEpochsByBin;
  }

  get fiveNumberSummary() {
    const fiveNumberSummary = getFiveNumberSummary.call(this);
    memoizeLazyGetter.call(
      this,
      'fiveNumberSummary',
      fiveNumberSummary && { TOTAL: fiveNumberSummary }
    );
    return this.fiveNumberSummary;
  }

  get fiveNumberSummaryByPeak() {
    memoizeLazyGetter.call(
      this,
      'fiveNumberSummaryByPeak',
      getFiveNumberSummaryByPeak.call(this)
    );
    return this.fiveNumberSummaryByPeak;
  }

  get perBinFiveNumberSummaries() {
    const perBinFiveNumberSummaries = getPerBinFiveNumberSummaries.call(this);
    memoizeLazyGetter.call(
      this,
      'perBinFiveNumberSummaries',
      perBinFiveNumberSummaries && { TOTAL: perBinFiveNumberSummaries }
    );
    return this.perBinFiveNumberSummaries;
  }

  get perBinFiveNumberSummariesByPeak() {
    memoizeLazyGetter.call(
      this,
      'perBinFiveNumberSummariesByPeak',
      getPerBinFiveNumberSummariesByPeak.call(this)
    );
    return this.perBinFiveNumberSummariesByPeak;
  }
}

SummaryStatsCalculator.requiredTmcAttributes = ['tmcLength'];
