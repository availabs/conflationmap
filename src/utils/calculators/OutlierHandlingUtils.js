import * as ss from 'simple-statistics';
import { numbersComparator } from './MathUtils';

export const HIDE_OUTLIERS = 'HIDE_OUTLIERS';
export const HIDE_EXTREME_OUTLIERS = 'HIDE_EXTREME_OUTLIERS';
export const SHOW_OUTLIERS = 'SHOW_OUTLIERS';
export const SHOW_ONLY_LEFT_OUTLIERS = 'SHOW_ONLY_LEFT_OUTLIERS';
export const SHOW_ONLY_LEFT_EXTREME_OUTLIERS =
  'SHOW_ONLY_LEFT_EXTREME_OUTLIERS';
export const SHOW_ONLY_RIGHT_OUTLIERS = 'SHOW_ONLY_RIGHT_OUTLIERS';
export const SHOW_ONLY_RIGHT_EXTREME_OUTLIERS =
  'SHOW_ONLY_RIGHT_EXTREME_OUTLIERS';

export const outlierSelectionLabels = {
  HIDE_OUTLIERS: 'hide outliers',
  HIDE_EXTREME_OUTLIERS: 'hide extreme outliers',
  SHOW_OUTLIERS: 'show outliers',
  SHOW_ONLY_LEFT_OUTLIERS: 'show only left outliers',
  SHOW_ONLY_LEFT_EXTREME_OUTLIERS: 'show only left extreme outliers',
  SHOW_ONLY_RIGHT_OUTLIERS: 'show only right outliers',
  SHOW_ONLY_RIGHT_EXTREME_OUTLIERS: 'show only right extreme outliers'
};

export const outlierInclusionLabels = {
  HIDE_OUTLIERS: 'exclude outliers',
  HIDE_EXTREME_OUTLIERS: 'exclude extreme outliers',
  SHOW_OUTLIERS: 'include outliers',
  SHOW_ONLY_LEFT_OUTLIERS: 'include only left outliers',
  SHOW_ONLY_LEFT_EXTREME_OUTLIERS: 'include only left extreme outliers',
  SHOW_ONLY_RIGHT_OUTLIERS: 'include only right outliers',
  SHOW_ONLY_RIGHT_EXTREME_OUTLIERS: 'include only right extreme outliers'
};

export const LEFT_EXTREME_OUTLIER = 'LEFT_EXTREME_OUTLIER';
export const LEFT_OUTLIER = 'LEFT_OUTLIER';
export const NOT_OUTLIER = 'NOT_OUTLIER';
export const RIGHT_OUTLIER = 'RIGHT_OUTLIER';
export const RIGHT_EXTREME_OUTLIER = 'RIGHT_EXTREME_OUTLIER';

// Using Map since we want guaranteed order of keys.
export const outlierFilterRanges = new Map([
  [HIDE_OUTLIERS, ['lowerInnerFence', 'upperInnerFence']],
  [HIDE_EXTREME_OUTLIERS, ['lowerOuterFence', 'upperOuterFence']],
  [SHOW_OUTLIERS, ['min', 'max']],
  [SHOW_ONLY_LEFT_OUTLIERS, ['min', 'lowerInnerFence']],
  [SHOW_ONLY_LEFT_EXTREME_OUTLIERS, ['min', 'lowerOuterFence']],
  [SHOW_ONLY_RIGHT_OUTLIERS, ['upperInnerFence', 'max']],
  [SHOW_ONLY_RIGHT_EXTREME_OUTLIERS, ['upperOuterFence', 'max']]
]);

export const outlierFilters = [...outlierFilterRanges.keys()];

export function getOutlierStats({ data, key }) {
  if (!(Array.isArray(data) && key)) {
    throw new Error('ERROR: data and key are required parameters');
  }

  if (!data.length) {
    return null;
  }

  const sortedValues = data.map(({ [key]: v }) => v).sort(numbersComparator);

  const q1 = ss.quantileSorted(sortedValues, 0.25);
  const q2 = ss.quantileSorted(sortedValues, 0.5);
  const q3 = ss.quantileSorted(sortedValues, 0.75);
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];

  const innerQuartileRange = q3 - q1;
  const lowerInnerFence = q1 - 1.5 * innerQuartileRange;
  const lowerOuterFence = q1 - 3 * innerQuartileRange;
  const upperInnerFence = q3 + 1.5 * innerQuartileRange;
  const upperOuterFence = q3 + 3 * innerQuartileRange;

  return {
    min,
    q1,
    q2,
    q3,
    max,
    innerQuartileRange,
    lowerInnerFence,
    lowerOuterFence,
    upperInnerFence,
    upperOuterFence
  };
}

export const getOutlierClassification = ({ outlierStats, value }) => {
  if (!outlierStats) {
    return null;
  }

  const {
    lowerInnerFence,
    lowerOuterFence,
    upperInnerFence,
    upperOuterFence
  } = outlierStats;

  if (value >= lowerInnerFence && value <= upperInnerFence) {
    return NOT_OUTLIER;
  }

  if (value < lowerOuterFence) {
    return LEFT_EXTREME_OUTLIER;
  }

  if (value < lowerInnerFence) {
    return LEFT_OUTLIER;
  }

  if (value > upperOuterFence) {
    return RIGHT_EXTREME_OUTLIER;
  }

  if (value > upperInnerFence) {
    return RIGHT_OUTLIER;
  }

  console.error('INVARIANT BROKEN: value unclassifiable');
  return null;
};

export const outlierFilterTest = ({ outlierFilter, outlierClass }) => {
  if (outlierFilter === SHOW_OUTLIERS) {
    return true;
  }

  if (outlierFilter === HIDE_OUTLIERS) {
    return outlierClass === NOT_OUTLIER;
  }

  if (outlierFilter === HIDE_EXTREME_OUTLIERS) {
    return (
      outlierClass !== LEFT_EXTREME_OUTLIER &&
      outlierClass !== RIGHT_EXTREME_OUTLIER
    );
  }

  if (outlierFilter === SHOW_ONLY_LEFT_OUTLIERS) {
    return (
      outlierClass === LEFT_EXTREME_OUTLIER || outlierClass === LEFT_OUTLIER
    );
  }

  if (outlierFilter === SHOW_ONLY_LEFT_EXTREME_OUTLIERS) {
    return outlierClass === LEFT_EXTREME_OUTLIER;
  }

  if (outlierFilter === SHOW_ONLY_RIGHT_OUTLIERS) {
    return (
      outlierClass === RIGHT_OUTLIER || outlierClass === RIGHT_EXTREME_OUTLIER
    );
  }

  if (outlierFilter === SHOW_ONLY_RIGHT_EXTREME_OUTLIERS) {
    return outlierClass === RIGHT_EXTREME_OUTLIER;
  }

  console.error('INVARIANT BROKEN: unrecognized outlierClass');
  return false;
};

export const applyOutlierFilter = ({ data, key, outlierFilter }) => {
  if (!Array.isArray(data)) {
    return null;
  }

  const outlierStats = getOutlierStats({ data, key });

  return data.filter(({ [key]: value }) => {
    const outlierClass = getOutlierClassification({ outlierStats, value });
    return outlierFilterTest({ outlierFilter, outlierClass });
  });
};

export const applyPartitionedOutlierFilter = ({
  data,
  partitionKey,
  key,
  outlierFilter
}) => {
  if (!Array.isArray(data)) {
    return null;
  }

  const partitionedData = data.reduce((acc, d) => {
    const pk = d[partitionKey];
    acc[pk] = acc[pk] || [];
    acc[pk].push(d);
    return acc;
  }, {});

  const outlierStatsByPartition = Object.keys(partitionedData).reduce(
    (acc, pk) => {
      acc[pk] = getOutlierStats({ data: partitionedData[pk], key });
      return acc;
    },
    {}
  );

  return data.filter(({ [key]: value, [partitionKey]: pk }) => {
    const outlierStats = outlierStatsByPartition[pk];
    const outlierClass = getOutlierClassification({ outlierStats, value });
    return outlierFilterTest({ outlierFilter, outlierClass });
  });
};

export const filterOutlierClassifiedData = ({
  data,
  outlierFilter = SHOW_OUTLIERS,
  outlierClassificationKey
}) =>
  Array.isArray(data)
    ? data.filter(d =>
        outlierFilterTest({
          outlierFilter,
          outlierClass: d[outlierClassificationKey]
        })
      )
    : null;
