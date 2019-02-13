import Calculator from '../Calculator';
import TmcAttributeDerivers from '../TmcAttributeDerivers';
// import FreeFlowCalculator from '../FreeFlowCalculator';

import { analyzeAvgsByBin } from './utils';

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true
  });
}

function setAnalysisOutputProperties() {
  const {
    sortedSpeeds,
    atriFreeFlowSpeed,
    speedsByHour = null,
    hourlyAvgSpeed = null,
    mphsBelowFreeFlowByHour = null,
    hourlyCongestionValues = null,
    atri = null
  } = analyzeAvgsByBin(this) || {};

  memoizeLazyGetter.call(this, 'sortedSpeeds', sortedSpeeds);
  memoizeLazyGetter.call(this, 'atriFreeFlowSpeed', atriFreeFlowSpeed);
  memoizeLazyGetter.call(this, 'speedsByHour', speedsByHour);
  memoizeLazyGetter.call(this, 'hourlyAvgSpeed', hourlyAvgSpeed);
  memoizeLazyGetter.call(
    this,
    'mphsBelowFreeFlowByHour',
    mphsBelowFreeFlowByHour
  );
  memoizeLazyGetter.call(
    this,
    'hourlyCongestionValues',
    hourlyCongestionValues
  );
  memoizeLazyGetter.call(this, 'atri', atri);
}

export default class ATRICalculator extends Calculator {
  constructor(config) {
    super(config);

    this.tmcAttributeDerivers = new TmcAttributeDerivers(config);
    // this.freeFlowCalculator = new FreeFlowCalculator(
    // Object.assign({}, config, { measureSpec: config.freeFlowMeasureSpec })
    // );
    this.peakPeriodIdentifier = this.measureRules.peakPeriodIdentifier;
  }

  get tmcTrafficVolumesByDowByHour() {
    memoizeLazyGetter.call(
      this,
      'tmcTrafficVolumesByDowByHour',
      this.tmcAttributeDerivers.tmcTrafficVolumesByDowByHour
    );
    return this.trafficVolumesByDowByHour;
  }

  get atriFreeFlowSpeed() {
    // return this.freeFlowCalculator.freeFlowSpeed;
    setAnalysisOutputProperties.call(this);
    return this.atriFreeFlowSpeed;
  }

  get tmcDirectionalAadt() {
    return this.tmcAttributeDerivers.tmcDirectionalAadt;
  }

  get tmcHourlyAvgTrafficVolume() {
    return this.tmcDirectionalAadt / 24;
  }

  get speedsByHour() {
    setAnalysisOutputProperties.call(this);
    return this.speedsByHour;
  }

  get sortedSpeeds() {
    setAnalysisOutputProperties.call(this);
    return this.sortedSpeeds;
  }

  get hourlyAvgSpeed() {
    setAnalysisOutputProperties.call(this);
    return this.hourlyAvgSpeed;
  }

  get mphsBelowFreeFlowByHour() {
    setAnalysisOutputProperties.call(this);
    return this.mphsBelowFreeFlowByHour;
  }

  get hourlyCongestionValues() {
    setAnalysisOutputProperties.call(this);
    return this.hourlyCongestionValues;
  }

  get atri() {
    setAnalysisOutputProperties.call(this);
    return this.atri;
  }
}

ATRICalculator.requiredTmcAttributes = Array.prototype.concat(
  // FreeFlowCalculator.requiredTmcAttributes,
  TmcAttributeDerivers.requiredTmcAttributes
);
