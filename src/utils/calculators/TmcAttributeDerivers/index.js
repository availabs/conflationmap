import Calculator from '../Calculator';

import { getTrafficDistributionFactors } from './utils';

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true
  });
}

function setTrafficDistributionFactors() {
  const {
    tmcCongestionLevel = null,
    tmcDirectionality = null,
    combinedPeakAvgTT = null,
    amPeakAvgTT = null,
    pmPeakAvgTT = null,
    freeFlowAvgTT = null,
    speedReductionFactor = null,
    peakTimeDifferential = null,
    peakSpeedDifferential = null
  } = getTrafficDistributionFactors(this) || {};

  memoizeLazyGetter.call(this, 'tmcCongestionLevel', tmcCongestionLevel);
  memoizeLazyGetter.call(this, 'tmcDirectionality', tmcDirectionality);
  memoizeLazyGetter.call(this, 'combinedPeakAvgTT', combinedPeakAvgTT);
  memoizeLazyGetter.call(this, 'amPeakAvgTT', amPeakAvgTT);
  memoizeLazyGetter.call(this, 'pmPeakAvgTT', pmPeakAvgTT);
  memoizeLazyGetter.call(this, 'freeFlowAvgTT', freeFlowAvgTT);
  memoizeLazyGetter.call(this, 'speedReductionFactor', speedReductionFactor);
  memoizeLazyGetter.call(this, 'peakTimeDifferential', peakTimeDifferential);
  memoizeLazyGetter.call(this, 'peakSpeedDifferential', peakSpeedDifferential);
}

export default class TmcAttributeDerivers extends Calculator {
  constructor(config) {
    super(config);

    this.trafficDistributionProfiles = config.trafficDistributionProfiles;
    this.trafficDistributionDOWAdjFactors =
      config.trafficDistributionDOWAdjFactors;
  }

  get tmcDirectionalAadt() {
    return TmcAttributeDerivers.getDirectionalAadt(this);
  }

  get tmcAvgVehicleOccupancy() {
    return TmcAttributeDerivers.getAvgVehicleOccupancy(this);
  }

  get tmcCongestionLevel() {
    setTrafficDistributionFactors.call(this);
    return this.tmcCongestionLevel;
  }

  get tmcDirectionality() {
    setTrafficDistributionFactors.call(this);
    return this.tmcDirectionality;
  }

  get combinedPeakAvgTT() {
    setTrafficDistributionFactors.call(this);
    return this.combinedPeakAvgTT;
  }

  get amPeakAvgTT() {
    setTrafficDistributionFactors.call(this);
    return this.amPeakAvgTT;
  }

  get pmPeakAvgTT() {
    setTrafficDistributionFactors.call(this);
    return this.pmPeakAvgTT;
  }

  get freeFlowAvgTT() {
    setTrafficDistributionFactors.call(this);
    return this.freeFlowAvgTT;
  }

  get speedReductionFactor() {
    setTrafficDistributionFactors.call(this);
    return this.speedReductionFactor;
  }

  get peakTimeDifferential() {
    setTrafficDistributionFactors.call(this);
    return this.peakTimeDifferential;
  }

  get peakSpeedDifferential() {
    setTrafficDistributionFactors.call(this);
    return this.peakSpeedDifferential;
  }

  get tmcTrafficDistributionProfile() {
    return TmcAttributeDerivers.getTmcTrafficDistributionProfile(this);
  }

  get tmcTrafficVolumesByDowByHour() {
    return TmcAttributeDerivers.getTmcTrafficVolumesByDowByHour(this);
  }

  static getDirectionalAadt = ({ tmcAadt, tmcFacilType }) =>
    +tmcFacilType > 1 ? tmcAadt / 2 : tmcAadt;

  static getAvgVehicleOccupancy = ({
    tmcAadt = null,
    tmcAadtSingl = null,
    tmcAadtCombi = null
  }) =>
    (1.55 * (tmcAadt - (tmcAadtSingl + tmcAadtCombi)) +
      10.25 * tmcAadtSingl +
      1.11 * tmcAadtCombi) /
      tmcAadt || null;

  static getTmcTrafficDistributionProfile = ({
    trafficDistributionProfiles,
    tmcIsControlledAccess = false,
    tmcCongestionLevel,
    tmcDirectionality
  }) => {
    if (
      !(trafficDistributionProfiles && tmcCongestionLevel && tmcDirectionality)
    ) {
      return null;
    }

    return {
      weekdayProfile:
        trafficDistributionProfiles[
          `WEEKDAY_${tmcCongestionLevel}_${tmcDirectionality}_${
            tmcIsControlledAccess ? 'FREEWAY' : 'NONFREEWAY'
          }`
        ],
      weekendProfile:
        trafficDistributionProfiles[
          `WEEKEND_${tmcIsControlledAccess ? 'FREEWAY' : 'NONFREEWAY'}`
        ]
    };
  };

  static getTmcTrafficVolumesByDowByHour = ({
    tmcTrafficDistributionProfile,
    trafficDistributionDOWAdjFactors,
    tmcDirectionalAadt
  } = {}) => {
    const { weekdayProfile, weekendProfile } =
      tmcTrafficDistributionProfile || {};

    if (
      !(weekdayProfile && weekendProfile && trafficDistributionDOWAdjFactors)
    ) {
      return null;
    }

    return trafficDistributionDOWAdjFactors.reduce((acc, dowAdj, i) => {
      const profile = i % 6 ? weekdayProfile : weekendProfile;
      acc[i] = profile.map(pct => pct * dowAdj * tmcDirectionalAadt);
      return acc;
    }, []);
  };
}

TmcAttributeDerivers.requiredTmcAttributes = [
  'tmcLength',
  'tmcIsControlledAccess',
  'tmcFacilType',
  'tmcAadt',
  'tmcAadtSingl',
  'tmcAadtCombi'
];
