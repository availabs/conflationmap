import NPMRDSDataProcessor from '../NPMRDSDataProcessor';
import MeasureRules from '../MeasureRules';

import {
  getOutlierStats,
  getOutlierClassification,
  applyOutlierFilter,
  applyPartitionedOutlierFilter,
  filterOutlierClassifiedData
} from '../OutlierHandlingUtils';

const setPropertiesToReadOnly = (that, properties) => {
  Array.isArray(properties) &&
    properties.forEach(p =>
      Object.defineProperty(that, p, {
        value: that[p],
        writable: false,
        enumerable: true,
        configurable: false
      })
    );
};

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true
  });
}

const NOOP = () => {};

export default class Calculator {
  constructor({
    tmc,
    year,
    dataSource,
    binMinutes,
    measure,
    metric,
    meanType,
    npmrdsData,
    tmcAttributes,
    measureSpec
  }) {
    // Extract the required tmcAttributes
    //   NOTE: We do this first so that they don't overwrite any class properties.
    //   NOTE: We take all tmcAttributes as the child Calculator classes
    //         specify which they need.
    this.tmcAttributes = tmcAttributes;
    Object.assign(this, tmcAttributes);

    // Preserve the initialization parameters.
    this.year = year;
    this.dataSource = dataSource;

    this.binMinutes = binMinutes;
    this.metric = metric;
    this.meanType = meanType;

    this.measure = measure;
    this.measureRules = new MeasureRules(measureSpec);

    this.peaks = this.measureRules.peaks;

    // Move the peakPeriodIdentifier to the class properties
    //   for easy passing into npmrdsProcessor methods.
    this.peakPeriodIdentifier = this.measureRules.peakPeriodIdentifier;

    this.npmrdsDataProcessor = new NPMRDSDataProcessor({
      npmrdsData,
      binMinutes,
      year,
      meanType
    });

    // Because we memoize avgsByBin...
    setPropertiesToReadOnly(this, [
      ...Object.keys(tmcAttributes),
      'tmcAttributes',
      'year',
      'binMinutes',
      'metric',
      'meanType',
      'measureRules',
      'npmrdsDataProcessor'
    ]);
  }

  get avgsByBin() {
    const avgsByBin = this.npmrdsDataProcessor.getAvgsByBin(this);

    // get fences needs access to avgsByBin
    memoizeLazyGetter.call(this, 'avgsByBin', avgsByBin);

    return avgsByBin;
  }

  get fences() {
    const { avgsByBin: data } = this;
    if (!(Array.isArray(data) && data.length)) {
      return null;
    }

    const fences = {
      avgTT: getOutlierStats({ data, key: 'avgTT' }),
      avgSpeed: getOutlierStats({ data, key: 'avgSpeed' })
    };

    memoizeLazyGetter.call(this, 'fences', fences);

    return this.fences;
  }

  get fencesByPeak() {
    const { avgsByBin, peaks } = this;

    if (
      !(
        Array.isArray(avgsByBin) &&
        Array.isArray(peaks) &&
        avgsByBin.length &&
        peaks.length
      )
    ) {
      return null;
    }

    const avgsByBinByPeak = avgsByBin.reduce((acc, d) => {
      const { peak } = d;
      if (peak) {
        acc[peak] = acc[peak] || [];
        acc[peak].push(d);
      }

      return acc;
    }, {});

    const fencesByPeak = peaks.reduce((acc, peak) => {
      const data = avgsByBinByPeak[peak];
      acc[peak] = {
        avgTT: getOutlierStats({ data, key: 'avgTT' }),
        avgSpeed: getOutlierStats({ data, key: 'avgSpeed' })
      };
      return acc;
    }, {});

    memoizeLazyGetter.call(this, 'fencesByPeak', fencesByPeak);

    return this.fencesByPeak;
  }

  addOutlierClassifications() {
    const { avgsByBin, fences } = this;

    // Modify the avgsByBin element objects,
    //   adding the travel time and speed outlier classifications
    if (Array.isArray(avgsByBin) && fences) {
      for (let i = 0; i < avgsByBin.length; ++i) {
        const d = avgsByBin[i];
        const { avgTT, avgSpeed } = d;
        d.ttOutlierClass = getOutlierClassification({
          outlierStats: fences.avgTT,
          value: avgTT
        });
        d.speedOutlierClass = getOutlierClassification({
          outlierStats: fences.avgSpeed,
          value: avgSpeed
        });
      }
    }

    // Replace this method with a noop.
    this.addOutlierClassifications = NOOP;
  }

  addIntraPeakOutlierClassifications() {
    const { avgsByBin, fencesByPeak } = this;

    // Modify the avgsByBin element objects,
    //   adding the travel time and speed outlier classifications
    if (Array.isArray(avgsByBin) && fencesByPeak) {
      for (let i = 0; i < avgsByBin.length; ++i) {
        const d = avgsByBin[i];
        const { peak, avgTT, avgSpeed } = d;

        if (peak) {
          d.peakTTOutlierClass = getOutlierClassification({
            outlierStats: fencesByPeak[peak].avgTT,
            value: avgTT
          });
          d.peakSpeedOutlierClass = getOutlierClassification({
            outlierStats: fencesByPeak[peak].avgSpeed,
            value: avgSpeed
          });
        }
      }
    }

    // Replace this method with a noop.
    this.addIntraPeakOutlierClassifications = () => {};
  }

  filterAvgsByBin(metric, outlierFilter) {
    if (this.addOutlierClassifications === NOOP) {
      const outlierClassificationKey =
        metric === 'SPEED' ? 'speedOutlierClass' : 'ttOutlierClass';

      return filterOutlierClassifiedData({
        data: this.avgsByBin,
        outlierFilter,
        outlierClassificationKey
      });
    } else {
      const key = metric === 'SPEED' ? 'avgSpeed' : 'avgTT';

      return applyOutlierFilter({ data: this.avgsByBin, key, outlierFilter });
    }
  }

  filterAvgsByBinIntraPeak(metric, outlierFilter) {
    if (this.addIntraPeakOutlierClassifications === NOOP) {
      const outlierClassificationKey =
        metric === 'SPEED' ? 'peakSpeedOutlierClass' : 'peakTTOutlierClass';

      return filterOutlierClassifiedData({
        data: this.avgsByBin,
        outlierFilter,
        outlierClassificationKey
      });
    } else {
      const key = metric === 'SPEED' ? 'avgSpeed' : 'avgTT';

      return applyPartitionedOutlierFilter({
        data: this.avgsByBin,
        key,
        outlierFilter
      });
    }
  }
}
