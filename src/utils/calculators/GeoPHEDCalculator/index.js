import { numbersComparator } from '../MathUtils';

import {
  getOutlierStats,
  outlierFilters,
  applyOutlierFilter
} from 'utils/calculators/OutlierHandlingUtils';

import GeoCalculator from '../GeoCalculator';

import { getTotalExcessiveDelayPersonHours } from './utils';

const getPopulationFromPopulationInfo = population_info => {
  const maxPopYear =
    population_info &&
    Object.keys(population_info)
      .sort(numbersComparator)
      .reverse()[0];

  const population = population_info && population_info[maxPopYear];

  return (
    (Array.isArray(population) && population[0] && population[0].total) || null
  );
};

// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true,
    configurable: true
  });
}

export default class GeoPHEDBreakdownCalculator extends GeoCalculator {
  get totalExcessiveDelayPersonHours() {
    memoizeLazyGetter.call(
      this,
      'getTotalExcessiveDelayPersonHours',
      getTotalExcessiveDelayPersonHours(this)
    );
    return this.getTotalExcessiveDelayPersonHours;
  }

  get fences() {
    const { data } = this;

    const fences = data && getOutlierStats({ data, key: 'phed' });

    memoizeLazyGetter.call(this, 'fences', fences);

    return this.fences;
  }

  get totalExcessiveDelayPersonHoursByOutlierFilter() {
    const { data } = this;

    if (!data) {
      return null;
    }

    const totalExcessiveDelayPersonHoursByOutlierFilter = outlierFilters.reduce(
      (acc, outlierFilter) => {
        const filteredData = applyOutlierFilter({
          data,
          outlierFilter,
          key: 'phed'
        });

        acc[outlierFilter] = getTotalExcessiveDelayPersonHours({
          data: filteredData
        });

        return acc;
      },
      {}
    );

    memoizeLazyGetter.call(
      this,
      'totalExcessiveDelayPersonHoursByOutlierFilter',
      totalExcessiveDelayPersonHoursByOutlierFilter
    );

    return this.totalExcessiveDelayPersonHoursByOutlierFilter;
  }

  get totalExcessiveDelayPersonHoursPerCapita() {
    const xDelay = this.totalExcessiveDelayPersonHours;

    const population_info =
      this.geoAttributes && this.geoAttributes.population_info;

    const population = getPopulationFromPopulationInfo(population_info);

    if (!(xDelay && population)) {
      return xDelay;
    }

    const totalExcessiveDelayPersonHoursPerCapita = xDelay / population;

    memoizeLazyGetter.call(
      this,
      'totalExcessiveDelayPersonHoursPerCapita',
      totalExcessiveDelayPersonHoursPerCapita
    );

    return this.totalExcessiveDelayPersonHoursPerCapita;
  }

  get totalExcessiveDelayPersonHoursPerCapitaByOutlierFilter() {
    const xDelayPerOutlierFilter = this
      .totalExcessiveDelayPersonHoursByOutlierFilter;

    const population_info =
      this.geoAttributes && this.geoAttributes.population_info;

    const population = getPopulationFromPopulationInfo(population_info);

    if (!(xDelayPerOutlierFilter && population)) {
      return null;
    }

    const totalExcessiveDelayPersonHoursPerCapitaByOutlierFilter = Object.keys(
      xDelayPerOutlierFilter
    ).reduce((acc, outlierFilter) => {
      const xDelay = xDelayPerOutlierFilter[outlierFilter];
      acc[outlierFilter] = xDelay / population;
      return acc;
    }, {});

    memoizeLazyGetter.call(
      this,
      'totalExcessiveDelayPersonHoursPerCapitaByOutlierFilter',
      totalExcessiveDelayPersonHoursPerCapitaByOutlierFilter
    );

    return this.totalExcessiveDelayPersonHoursPerCapitaByOutlierFilter;
  }
}
