export const getTTRByPeak = ({ percentilesByPeak }) => {
  if (!percentilesByPeak) {
    return null;
  }

  return Object.keys(percentilesByPeak).reduce((acc, peak) => {
    const peakPercentiles = percentilesByPeak[peak];

    const ttPercentiles = peakPercentiles && peakPercentiles.tt;

    const percentiles = ttPercentiles && Object.keys(ttPercentiles);

    if (!(Array.isArray(percentiles) && percentiles.length === 2)) {
      console.error(
        'INVARIANT BROKEN: percentilesByPeak should contain two percentiles for each peak.'
      );
      console.error(percentilesByPeak);

      return acc;
    }

    const [a, b] = percentiles;

    acc[peak] =
      +a > +b
        ? +ttPercentiles[a] / +ttPercentiles[b]
        : +ttPercentiles[b] / +ttPercentiles[a];

    return acc;
  }, {});
};

export const getMaxPeakTTR = ({ ttrByPeak }) =>
  ttrByPeak ? Math.max(...Object.values(ttrByPeak)) : null;
