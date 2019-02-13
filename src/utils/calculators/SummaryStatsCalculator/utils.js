const fiveNumberSummaryPercentiles = [0, 25, 50, 75, 100];

const getFiveNumberSummaryPercentilesByPeak = peaks =>
  peaks &&
  peaks.reduce(
    (acc, peak) => Object.assign(acc, { [peak]: fiveNumberSummaryPercentiles }),
    {}
  );

export function getFiveNumberSummary() {
  return this.npmrdsDataProcessor.getPercentiles(
    Object.assign({}, this, {
      requiredPercentiles: fiveNumberSummaryPercentiles
    })
  );
}

export function getFiveNumberSummaryByPeak() {
  const { peaks } = this;
  const requiredPercentilesByPeak = getFiveNumberSummaryPercentilesByPeak(
    peaks
  );

  return this.npmrdsDataProcessor.getPercentilesByPeak(
    Object.assign({}, this, { requiredPercentilesByPeak })
  );
}

export function getPerBinFiveNumberSummaries() {
  this.npmrdsDataProcessor.getPerBinPercentiles(
    Object.assign({}, this, {
      requiredPercentiles: fiveNumberSummaryPercentiles
    })
  );
}

export function getPerBinFiveNumberSummariesByPeak() {
  this.npmrdsDataProcessor.getPerBinPercentilesByPeak(
    Object.assign({}, this, {
      requiredPercentiles: fiveNumberSummaryPercentiles
    })
  );
}
