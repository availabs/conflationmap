import Calculator from '../Calculator';

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
    offPeakSortedBySpeed = null,
    freeFlowSpeed = null,
    freeFlowSpeedByOffPeakPeriod
  } = analyzeAvgsByBin.call(this) || {};

  memoizeLazyGetter.call(this, 'offPeakSortedBySpeed', offPeakSortedBySpeed);

  memoizeLazyGetter.call(this, 'freeFlowSpeed', freeFlowSpeed);
  memoizeLazyGetter.call(
    this,
    'freeFlowSpeedByOffPeakPeriod',
    freeFlowSpeedByOffPeakPeriod
  );
}

export default class FreeFlowCalculator extends Calculator {
  constructor(config) {
    super(config);

    this.peakPeriodIdentifier = this.measureRules.peakPeriodIdentifier;
  }

  // We use lazy getters for properties that require iterating NPMRDS data.
  get offPeakSortedBySpeed() {
    setAnalysisOutputProperties.call(this);
    return this.offPeakSortedBySpeed;
  }

  get freeFlowSpeed() {
    setAnalysisOutputProperties.call(this);
    return this.freeFlowSpeed;
  }

  get freeFlowSpeedByOffPeakPeriod() {
    setAnalysisOutputProperties.call(this);
    return this.freeFlowSpeedByOffPeakPeriod;
  }
}

FreeFlowCalculator.requiredTmcAttributes = ['tmcLength'];
