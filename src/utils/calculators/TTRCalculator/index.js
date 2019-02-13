import Calculator from '../Calculator';

import { getTTRByPeak, getMaxPeakTTR } from './utils';

import { outlierFilters } from '../OutlierHandlingUtils';

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true
  });
}

export default class TTRCalculator extends Calculator {
  constructor(config) {
    super(config);

    this.requiredPercentilesByPeak = this.measureRules.requiredPercentilesByPeak;
  }

  get avgsByBin() {
    // Need super to memoize the avgsByBin to prevent infinite recursion.
    super.avgsByBin; // eslint-disable-line no-unused-expressions

    this.addOutlierClassifications();
    this.addIntraPeakOutlierClassifications();

    return this.avgsByBin;
  }

  get percentilesByPeak() {
    memoizeLazyGetter.call(
      this,
      'percentilesByPeak',
      this.npmrdsDataProcessor.getPercentilesByPeak(this)
    );
    return this.percentilesByPeak;
  }

  get percentilesByPeakByOutlierFilter() {
    const { requiredPercentilesByPeak } = this;
    const percentilesByPeakByOutlierFilter = outlierFilters.reduce(
      (acc, outlierFilter) => {
        const filteredAvgsByBin = this.filterAvgsByBinIntraPeak(
          'TRAVEL_TIME',
          outlierFilter
        );

        acc[outlierFilter] = this.npmrdsDataProcessor.getPercentilesByPeak({
          avgsByBin: filteredAvgsByBin,
          requiredPercentilesByPeak
        });
        return acc;
      },
      {}
    );

    memoizeLazyGetter.call(
      this,
      'percentilesByPeakByOutlierFilter',
      percentilesByPeakByOutlierFilter
    );
    return this.percentilesByPeakByOutlierFilter;
  }

  get ttrByPeak() {
    memoizeLazyGetter.call(this, 'ttrByPeak', getTTRByPeak(this));
    return this.ttrByPeak;
  }

  get ttrByPeakByOutlierFilter() {
    const { percentilesByPeakByOutlierFilter } = this;

    return (
      percentilesByPeakByOutlierFilter &&
      Object.keys(percentilesByPeakByOutlierFilter).reduce(
        (acc, outlierFilter) => {
          const percentilesByPeak =
            percentilesByPeakByOutlierFilter[outlierFilter];

          acc[outlierFilter] = getTTRByPeak({ percentilesByPeak });
          return acc;
        },
        {}
      )
    );
  }

  get maxPeakTTR() {
    memoizeLazyGetter.call(this, 'maxPeakTTR', getMaxPeakTTR(this));
    return this.maxPeakTTR;
  }

  get maxPeakTTRByPeakOutlierFilter() {
    const { ttrByPeakByOutlierFilter } = this;

    return (
      ttrByPeakByOutlierFilter &&
      Object.keys(ttrByPeakByOutlierFilter).reduce((acc, outlierFilter) => {
        const ttrByPeak = ttrByPeakByOutlierFilter[outlierFilter];

        acc[outlierFilter] = getMaxPeakTTR({ ttrByPeak });
        return acc;
      }, {})
    );
  }
}

TTRCalculator.requiredTmcAttributes = ['tmcLength'];
