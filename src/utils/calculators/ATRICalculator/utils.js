import * as ss from 'simple-statistics';

import { precisionRound } from '../MathUtils';

import { numbersComparator } from '../MathUtils';

export const analyzeAvgsByBin = ({
  avgsByBin,
  // freeFlowSpeed,
  tmcHourlyAvgTrafficVolume
}) => {
  // if (!(Array.isArray(avgsByBin) && avgsByBin.length && freeFlowSpeed)) {
  if (!(Array.isArray(avgsByBin) && avgsByBin.length)) {
    return null;
  }

  const sortedSpeeds = avgsByBin
    .map(({ avgSpeed }) => precisionRound(avgSpeed))
    .sort(numbersComparator);

  // https://github.com/availabs/pm3_calculator/blob/master/src/calculators/atri.js#L75
  const atriFreeFlowSpeed = ss.quantileSorted(sortedSpeeds, 0.7);
  const yearlyMeanSpeed = ss.mean(sortedSpeeds);

  const speedsByHour = avgsByBin.reduce((acc, { avgSpeed, hour }) => {
    acc[hour].push(avgSpeed);
    return acc;
  }, [...Array(24)].map(() => []));

  const hourlyAvgSpeed = speedsByHour.map(
    speeds => (speeds.length ? ss.mean(speeds) : null)
  );

  const mphsBelowFreeFlowByHour = hourlyAvgSpeed.map(
    avgSpeed =>
      avgSpeed !== null ? Math.max(atriFreeFlowSpeed - avgSpeed, 0) : 0
  );

  const hourlyCongestionValues = mphsBelowFreeFlowByHour.map(
    mphBelowFF => mphBelowFF * tmcHourlyAvgTrafficVolume
  );

  //// Replicates miscalculation in the pm3Calculator
  // const pm3CalculatorValue =
  // Math.max(atriFreeFlowSpeed - yearlyMeanSpeed, 0) *
  // tmcHourlyAvgTrafficVolume *
  // 24;

  const atri = ss.sum(hourlyCongestionValues);

  return {
    sortedSpeeds,
    atriFreeFlowSpeed,
    speedsByHour,
    hourlyAvgSpeed,
    mphsBelowFreeFlowByHour,
    hourlyCongestionValues,
    atri
  };
};
