import Calculator from '../Calculator';
import TmcAttributeDerivers from '../TmcAttributeDerivers';

import {
  outlierFilters,
  filterOutlierClassifiedData
} from '../OutlierHandlingUtils';

import {
  getThresholdSpeed,
  getThresholdTravelTime,
  getExcessiveDelayHoursByBin,
  getExcessiveDelayVehicleHoursByBin,
  getExcessiveDelayPersonHoursByBin,
  getTotalExcessiveDelay
} from './utils';

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true,
    configurable: true
  });
}

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

export default class PHEDCalculator extends Calculator {
  constructor(config) {
    super(config);

    const {
      trafficDistributionProfiles,
      trafficDistributionDOWAdjFactors
    } = config;

    this.tmcAttributeDerivers = new TmcAttributeDerivers(config);

    this.trafficDistributionProfiles = trafficDistributionProfiles;
    this.trafficDistributionDOWAdjFactors = trafficDistributionDOWAdjFactors;

    setPropertiesToReadOnly(this, [
      'trafficDistributionProfiles',
      'trafficDistributionDOWAdjFactors'
    ]);
  }

  get avgsByBin() {
    // Need super to memoize the avgsByBin to prevent infinite recursion.
    super.avgsByBin; // eslint-disable-line no-unused-expressions

    this.addOutlierClassifications();
    this.addIntraPeakOutlierClassifications();

    return this.avgsByBin;
  }

  get thresholdSpeed() {
    memoizeLazyGetter.call(this, 'thresholdSpeed', getThresholdSpeed(this));
    return this.thresholdSpeed;
  }

  get thresholdTravelTime() {
    memoizeLazyGetter.call(
      this,
      'thresholdTravelTime',
      getThresholdTravelTime(this)
    );
    return this.thresholdTravelTime;
  }

  get tmcAvgVehicleOccupancy() {
    memoizeLazyGetter.call(
      this,
      'tmcAvgVehicleOccupancy',
      this.tmcAttributeDerivers.tmcAvgVehicleOccupancy
    );
    return this.tmcAvgVehicleOccupancy;
  }

  get tmcDirectionalAadt() {
    memoizeLazyGetter.call(
      this,
      'tmcDirectionalAadt',
      this.tmcAttributeDerivers.tmcDirectionalAadt
    );
    return this.tmcDirectionalAadt;
  }

  get tmcTrafficDistributionProfile() {
    memoizeLazyGetter.call(
      this,
      'tmcTrafficDistributionProfile',
      this.tmcAttributeDerivers.tmcTrafficDistributionProfile
    );
    return this.tmcTrafficDistributionProfile;
  }

  get tmcCongestionLevel() {
    return this.tmcAttributeDerivers.tmcCongestionLevel;
  }

  get tmcDirectionality() {
    return this.tmcAttributeDerivers.tmcDirectionality;
  }

  get tmcTrafficVolumesByDowByHour() {
    memoizeLazyGetter.call(
      this,
      'tmcTrafficVolumesByDowByHour',
      this.tmcAttributeDerivers.tmcTrafficVolumesByDowByHour
    );
    return this.tmcTrafficVolumesByDowByHour;
  }

  get excessiveDelayHoursByBin() {
    memoizeLazyGetter.call(
      this,
      'excessiveDelayHoursByBin',
      getExcessiveDelayHoursByBin(this)
    );

    return this.excessiveDelayHoursByBin;
  }

  get excessiveDelayVehicleHoursByBin() {
    memoizeLazyGetter.call(
      this,
      'excessiveDelayVehicleHoursByBin',
      getExcessiveDelayVehicleHoursByBin(this)
    );

    return this.excessiveDelayVehicleHoursByBin;
  }

  get excessiveDelayPersonHoursByBin() {
    memoizeLazyGetter.call(
      this,
      'excessiveDelayPersonHoursByBin',
      getExcessiveDelayPersonHoursByBin(this)
    );
    return this.excessiveDelayPersonHoursByBin;
  }

  get totalExcessiveDelay() {
    memoizeLazyGetter.call(
      this,
      'totalExcessiveDelay',
      getTotalExcessiveDelay(this)
    );
    return this.totalExcessiveDelay;
  }

  get totalExcessiveDelayByOutlierFilter() {
    const { excessiveDelayPersonHoursByBin } = this;

    if (!excessiveDelayPersonHoursByBin) {
      return null;
    }

    const totalExcessiveDelayByOutlierFilter = outlierFilters.reduce(
      (acc, outlierFilter) => {
        const filteredData = filterOutlierClassifiedData({
          data: excessiveDelayPersonHoursByBin,
          outlierFilter,
          outlierClassificationKey: 'ttOutlierClass'
        });

        acc[outlierFilter] = getTotalExcessiveDelay({
          excessiveDelayPersonHoursByBin: filteredData
        });

        return acc;
      },
      {}
    );

    memoizeLazyGetter.call(
      this,
      'totalExcessiveDelayByOutlierFilter',
      totalExcessiveDelayByOutlierFilter
    );

    return this.totalExcessiveDelayByOutlierFilter;
  }
}

// Because this class does not have access to falcor.get
PHEDCalculator.requiredTmcAttributes = [
  'tmcAvgSpeedlimit',
  'tmcLength',
  'tmcIsControlledAccess',
  'tmcFacilType',
  'tmcAadt',
  'tmcAadtSingl',
  'tmcAadtCombi'
];
