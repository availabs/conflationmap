import GeoCalculator from '../GeoCalculator';

import { getGeoLevelTTTR, collectGeoLevelTTTRInfo } from './utils';

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true,
    configurable: true
  });
}

export default class GeoTTTRBreakdownCalculator extends GeoCalculator {
  get geoLevelTTTR() {
    const { data } = this;

    if (!data) {
      return null;
    }

    const geoLevelTTTR = getGeoLevelTTTR({
      data
    });

    memoizeLazyGetter.call(this, 'geoLevelTTTR', geoLevelTTTR);

    return this.geoLevelTTTR;
  }

  get geoLevelTTTRInfo() {
    const { data } = this;

    if (!data) {
      return null;
    }

    const geoLevelTTTRInfo = collectGeoLevelTTTRInfo({
      data
    });

    memoizeLazyGetter.call(this, 'geoLevelTTTRInfo', geoLevelTTTRInfo);

    return this.geoLevelTTTRInfo;
  }
}
