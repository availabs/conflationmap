const setReadOnlyProperty = (that, k, v) => {
  Object.defineProperty(that, k, {
    value: v,
    writable: false,
    enumerable: true,
    configurable: false
  });
};

const getPeakDefinitions = measureSpec =>
  measureSpec
    ? Object.freeze(
        measureSpec.reduce((acc, { peak, hours, dow } = {}) => {
          if (peak) {
            acc[peak] = { hours, dow };
          }
          return acc;
        }, {})
      )
    : null;

const getRequiredPercentilesByPeak = measureSpec => {
  const requiredPercentilesByPeak =
    measureSpec &&
    measureSpec.reduce((acc, { peak, percentiles } = {}) => {
      if (peak && percentiles) {
        acc[peak] = percentiles;
      }
      return acc;
    }, {});

  return requiredPercentilesByPeak &&
    Object.keys(requiredPercentilesByPeak).length
    ? Object.freeze(requiredPercentilesByPeak)
    : null;
};

class MeasureRules {
  constructor(measureSpec) {
    setReadOnlyProperty(this, 'measureSpec', measureSpec);

    setReadOnlyProperty(
      this,
      'peakDefinitions',
      getPeakDefinitions(measureSpec)
    );

    setReadOnlyProperty(
      this,
      'peaks',
      this.peakDefinitions ? Object.freeze(Object.keys(this.peakDefinitions)) : null
    );

    setReadOnlyProperty(
      this,
      'requiredPercentilesByPeak',
      getRequiredPercentilesByPeak(measureSpec)
    );
  }

  get numEpochsPerPeakPerDow() {
    const nPerPeak =
      this.peaks &&
      this.peaks.reduce((pAcc, peak) => {
        const { hours: [startHr = 0, endHr = 0] = [], dow } =
          this.peakDefinitions[peak] || {};

        pAcc[peak] = dow.reduce((dowAcc, day) => {
          dowAcc[day] =
            12 * (startHr <= endHr ? endHr - startHr : 24 - startHr + endHr);
          return dowAcc;
        }, {});

        return pAcc;
      }, {});

    setReadOnlyProperty(this, 'numEpochsPerPeakPerDow', nPerPeak);

    return nPerPeak;
  }

  get numEpochsAcrossPeaksByDow() {
    const nPerDow =
      this.numEpochsPerPeakPerDow &&
      Object.values(this.numEpochsPerPeakPerDow).reduce(
        (acc, numOfEpochByDOW) => {
          Object.keys(numOfEpochByDOW).forEach(dow => {
            if (!acc[dow]) {
              acc[dow] = 0;
            }
            acc[dow] += numOfEpochByDOW[dow];
          });
          return acc;
        },
        {}
      );

    setReadOnlyProperty(this, 'numEpochsAcrossPeaksByDow', nPerDow);

    return nPerDow;
  }

  get peakPeriodIdentifier() {
    const that = this;
    return this.peaks
      ? (dow, hour) => {
          // return the first peak whose spec contains the dow and hour
          for (let i = 0; i < that.peaks.length; ++i) {
            const peak = that.peaks[i];
            const {
              hours: [startHr, endHr] = [],
              dow: daysOfWeek
            } = that.peakDefinitions[peak];

            if (daysOfWeek.includes(dow)) {
              if (+startHr <= +endHr) {
                if (+hour >= +startHr && +hour < +endHr) {
                  return peak;
                }
              } else {
                if (+hour >= +startHr || +hour < +endHr) {
                  return peak;
                }
              }
            }
          }
          return null;
        }
      : null;
  }
}

export default MeasureRules;
