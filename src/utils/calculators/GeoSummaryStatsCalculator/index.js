// https://www.bitovi.com/blog/lazy-values-to-speed-up-your-js-app
import { precisionRound } from '../MathUtils';

function memoizeLazyGetter(name, value) {
  Object.defineProperty(this, name, {
    value,
    enumerable: true
  });
}

export default class GeoSummaryStatsCalculator {
  constructor({ tmcAttributes, year, measure, pm3Measures }) {
    this.tmcAttributes = tmcAttributes;
    this.year = year;
    this.measure = measure;
    this.pm3Measures = pm3Measures;
  }

  get rows() {
    const rows = this.tmcAttributes || null;
    if (rows) {
      for (let i = 0; i < rows.length; ++i) {
        const row = rows[i];
        row.year = this.year;
        const m = this.pm3Measures[row.tmc]

        row[this.measure] = m === null ? null : precisionRound(m, 3);
      }
    }
    memoizeLazyGetter.call(this, 'rows', rows);
    return this.rows;
  }
}

GeoSummaryStatsCalculator.requiredTmcAttributes = [];
