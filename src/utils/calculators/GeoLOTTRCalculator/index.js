import GeoCalculator from '../GeoCalculator';

import { getGeoLevelLOTTR, collectGeoLevelLOTTRInfo } from './utils';

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true,
    configurable: true
  });
}

export default class GeoLOTTRBreakdownCalculator extends GeoCalculator {
  get geoLevelLOTTR() {
    const { data } = this;

    if (!data) {
      return null;
    }

    const geoLevelLOTTR = getGeoLevelLOTTR({
      data
    });

    memoizeLazyGetter.call(this, 'geoLevelLOTTR', geoLevelLOTTR);

    return this.geoLevelLOTTR;
  }

  get geoLevelLOTTRInfo() {
    const { data } = this;

    if (!data) {
      return null;
    }

    const geoLevelLOTTRInfo = collectGeoLevelLOTTRInfo({
      data
    });

    memoizeLazyGetter.call(this, 'geoLevelLOTTRInfo', geoLevelLOTTRInfo);

    return this.geoLevelLOTTRInfo;
  }
}
