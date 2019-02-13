// This belongs as a sub class of the NPMRDSProcessor.

import { numbersComparator } from './MathUtils';

const EPOCHS_PER_DAY = 288;

class BinnedTimeUtils {
  constructor({ binMinutes, year = null }) {
    if (!binMinutes) {
      throw new Error('binMinutes is required.');
    }
    this.binMinutes = +binMinutes;
    this.year = year;
  }

  get numDaysInYear() {
    if (!this.year) {
      throw new Error('year was not set for this BinnedTimeUtils instance');
    }

    const y = this.year;
    return y % 400 === 0 || (y % 100 !== 0 && y % 4 === 0) ? 364 : 365;
  }

  get numBinsInDay() {
    return BinnedTimeUtils.numBinsInDay(this.binMinutes);
  }

  get numBinsInHour() {
    return Math.floor(60 / this.binMinutes);
  }

  getNumBinsInDate(month = 1, date = 1) {
    return this.isStartOfDaylightSavings(month, date)
      ? this.numBinsInDay - this.numBinsInHour
      : this.numBinsInDay;
  }

  getDateString(month, date) {
    if (!this.year) {
      throw new Error('year was not set for this BinnedTimeUtils instance');
    }

    return BinnedTimeUtils.getDateString(this.year, month, date);
  }

  getHourOfBinNum(binNum) {
    return Math.floor((binNum * this.binMinutes) / 60);
  }

  getMinuteOfBinNum(binNum) {
    return (binNum * this.binMinutes) % 60;
  }

  getTimeOfBinNum(binNum) {
    return BinnedTimeUtils.getTimeOfBinNum(this.binMinutes, binNum);
  }

  getJSDateObj(month, date, binNum) {
    const dateStr = this.getDateString(month, date);
    const timeStr = this.getTimeOfBinNum(binNum);

    return new Date(`${dateStr} ${timeStr}:00`);
  }

  getBinsInPeaks(peakPeriodIdentifier) {
    if (!peakPeriodIdentifier) {
      throw new Error('A peakPeriodIdentifier is required.');
    }

    const binsInPeaks = {};

    for (let dow = 0; dow <= 6; ++dow) {
      for (let binNum = 0; binNum < this.numBinsInDay; ++binNum) {
        const hour = this.getHourOfBinNum(binNum);
        const peak = peakPeriodIdentifier(dow, hour);

        if (!binsInPeaks[peak]) {
          binsInPeaks[peak] = new Set();
        }

        binsInPeaks[peak].add(binNum);
      }
    }

    return Object.keys(binsInPeaks).reduce(
      (acc, peak) =>
        Object.assign(acc, {
          [peak]: [...binsInPeaks[peak]].sort(numbersComparator)
        }),
      {}
    );
  }

  static hourOfBinNum = (binMinutes, binNum) =>
    Math.floor((binMinutes * binNum) / 60);

  static minuteOfBinNum = (binMinutes, binNum) => (binMinutes * binNum) % 60;

  static binNumToTime = (binMinutes, binNum) => {
    const hour = BinnedTimeUtils.hourOfBinNum(binMinutes, binNum);
    const minutes = BinnedTimeUtils.minuteOfBinNum(binMinutes, binNum);

    const HH = `0${hour}`.slice(-2);
    const MM = `0${minutes}`.slice(-2);

    return `${HH}:${MM}`;
  };

  static numBinsInDay = binMinutes =>
    Math.floor((5 / binMinutes) * EPOCHS_PER_DAY);

  static timesOfDayForBins = binMinutes => {
    const numBinsInDay = BinnedTimeUtils.numBinsInDay(binMinutes);
    const timesOfDay = [];
    for (let i = 0; i < numBinsInDay; ++i) {
      timesOfDay.push(BinnedTimeUtils.binNumToTime(binMinutes, i));
    }
    return timesOfDay;
  };

  static daysInRange = (startDate, endDate) => {
    const cur = new Date(`${startDate} 12:00:00`);
    const end = new Date(`${endDate} 12:00:00`);

    const days = [];
    while (cur <= end) {
      const yyyy = cur.getFullYear();
      const mm = `0${cur.getMonth() + 1}`.slice(-2);
      const dd = `0${cur.getDate()}`.slice(-2);
      days.push(`${yyyy}-${mm}-${dd}`);
      cur.setDate(cur.getDate() + 1);
    }

    return days;
  };

  static getDateString(year, month, date) {
    const mm = `0${month}`.slice(-2);
    const dd = `0${date}`.slice(-2);
    return `${year}-${mm}-${dd}`;
  }

  static getTimestampsForDateRange = (startDate, endDate, binMinutes) => {
    const days = BinnedTimeUtils.daysInRange(startDate, endDate);
    const times = BinnedTimeUtils.timesOfDayForBins(binMinutes);

    const timestamps = new Array(days.length * times.length);

    for (let i = 0; i < days.length; ++i) {
      for (let j = 0; j < times.length; ++j) {
        timestamps[i * times.length + j] = `${days[i]} ${times[j]}`;
      }
    }

    return timestamps;
  };

  static DaylightSavingsStartDate(year) {
    return {
      year,
      month: 3,
      date: 14 - new Date(`${year}/03/07`).getDay()
    };
  }

  static getNumDaysPerMonthInYear(year) {
    const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

    //https://stackoverflow.com/a/725111
    return [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }
}

// Kinda code smell. Seems better than having to pass around the class instance,
// or having to pass in the binMinutes for every conversion.
export default BinnedTimeUtils;
