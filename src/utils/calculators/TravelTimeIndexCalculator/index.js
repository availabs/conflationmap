import Calculator from '../Calculator';
import FreeFlowCalculator from '../FreeFlowCalculator';

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
    peakTravelTimesSorted = null,
    ttAvgsByBinByDow = null,
    ttAvgsByPeak = null,
    ttiByPeak = null
  } = analyzeAvgsByBin.call(this) || {};

  memoizeLazyGetter.call(this, 'peakTravelTimesSorted', peakTravelTimesSorted);

  memoizeLazyGetter.call(
    this,
    'ttAvgsByBinByDow',
    ttAvgsByBinByDow
  );

  memoizeLazyGetter.call(this, 'ttAvgsByPeak', ttAvgsByPeak);
  memoizeLazyGetter.call(this, 'ttiByPeak', ttiByPeak);
}

export default class TravelTimeIndexCalculator extends Calculator {
  constructor(config) {
    super(config);

    this.freeFlowCalculator = new FreeFlowCalculator(config);
    this.peakPeriodIdentifier = this.measureRules.peakPeriodIdentifier;
  }

  get freeFlowSpeed() {
    return this.freeFlowCalculator.freeFlowSpeed;
  }

  // We use lazy getters for properties that require iterating NPMRDS data.
  get freeFlowTravelTime() {
    if (!this.tmcLength && this.freeFlowSpeed) {
      return null;
    }

    // mi ÷ mi/hr × sec/hr = sec
    const freeFlowTravelTime = (this.tmcLength / this.freeFlowSpeed) * 3600;
    memoizeLazyGetter.call(this, 'freeFlowTravelTime', freeFlowTravelTime);

    return this.freeFlowTravelTime;
  }

  get peakTravelTimesSorted() {
    setAnalysisOutputProperties.call(this);
    return this.peakTravelTimesSorted;
  }

  get ttAvgsByBinByDow() {
    setAnalysisOutputProperties.call(this);
    return this.ttAvgsByBinByDow;
  }

  get ttAvgsByPeak() {
    setAnalysisOutputProperties.call(this);
    return this.ttAvgsByPeak;
  }

  get ttiByPeak() {
    setAnalysisOutputProperties.call(this);
    return this.ttiByPeak;
  }
}

TravelTimeIndexCalculator.requiredTmcAttributes =
  FreeFlowCalculator.requiredTmcAttributes;
