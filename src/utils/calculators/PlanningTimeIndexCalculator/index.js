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
    tt95PercentilesByBinByDow = null,
    tt95PercentilesByPeak = null,
    ptiByPeak = null
  } = analyzeAvgsByBin.call(this) || {};

  memoizeLazyGetter.call(this, 'peakTravelTimesSorted', peakTravelTimesSorted);

  memoizeLazyGetter.call(
    this,
    'tt95PercentilesByBinByDow',
    tt95PercentilesByBinByDow
  );

  memoizeLazyGetter.call(this, 'tt95PercentilesByPeak', tt95PercentilesByPeak);
  memoizeLazyGetter.call(this, 'ptiByPeak', ptiByPeak);
}

export default class PlanningTimeIndexCalculator extends Calculator {
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

  get tt95PercentilesByBinByDow() {
    setAnalysisOutputProperties.call(this);
    return this.tt95PercentilesByBinByDow;
  }

  get tt95PercentilesByPeak() {
    setAnalysisOutputProperties.call(this);
    return this.tt95PercentilesByPeak;
  }

  get ptiByPeak() {
    setAnalysisOutputProperties.call(this);
    return this.ptiByPeak;
  }
}

PlanningTimeIndexCalculator.requiredTmcAttributes =
  FreeFlowCalculator.requiredTmcAttributes;
