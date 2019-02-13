import { precisionRound } from '../MathUtils';

export const getThresholdSpeed = ({ tmcAvgSpeedlimit }) => Math.max(tmcAvgSpeedlimit * 0.6, 20);

export const getThresholdTravelTime = ({ tmcLength, thresholdSpeed }) => {
  return precisionRound((tmcLength / thresholdSpeed) * 3600) || null;
}

export const getExcessiveDelayHoursByBin = ({
  avgsByBin,
  thresholdTravelTime,
  binMinutes
}) =>
  Array.isArray(avgsByBin)
    ? avgsByBin.filter(({ avgTT }) => +avgTT > +thresholdTravelTime).map(d =>
        Object.assign({}, d, {
          excessiveDelayHrs:
            Math.min(d.avgTT - thresholdTravelTime, 60 * binMinutes) / 3600
        })
      )
    : null;

export const getExcessiveDelayVehicleHoursByBin = ({
  excessiveDelayHoursByBin,
  tmcTrafficVolumesByDowByHour,
  binMinutes
}) =>
  Array.isArray(excessiveDelayHoursByBin) &&
  Array.isArray(tmcTrafficVolumesByDowByHour)
    ? excessiveDelayHoursByBin.map(d =>
        Object.assign({}, d, {
          excessiveDelayVehicleHrs:
            (d.excessiveDelayHrs *
              tmcTrafficVolumesByDowByHour[d.dow][d.hour]) /
            (60 / binMinutes)
        })
      )
    : null;

export const getExcessiveDelayPersonHoursByBin = ({
  excessiveDelayVehicleHoursByBin,
  tmcAvgVehicleOccupancy
}) =>
  Array.isArray(excessiveDelayVehicleHoursByBin) && tmcAvgVehicleOccupancy
    ? excessiveDelayVehicleHoursByBin.map(d =>
        Object.assign({}, d, {
          excessiveDelayPersonHours:
            d.excessiveDelayVehicleHrs * tmcAvgVehicleOccupancy
        })
      )
    : null;

export const getTotalExcessiveDelay = ({ excessiveDelayPersonHoursByBin }) =>
  Array.isArray(excessiveDelayPersonHoursByBin)
    ? precisionRound(
        excessiveDelayPersonHoursByBin.reduce(
          (acc, { peak, excessiveDelayPersonHours }) =>
            peak ? +acc + +excessiveDelayPersonHours : acc,
          0
        )
      )
    : null;
