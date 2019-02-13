const AM_PEAK_START_HOUR = 6; // 6am
const AM_PEAK_END_HOUR = 10; // 10am

const PM_PEAK_START_HOUR = 3 + 12; // 3pm
const PM_PEAK_END_HOUR = 7 + 12; // 7pm

const FREEFLOW_PM_START_EPOCH = 10 + 12; // 10pm
const FREEFLOW_AM_END_EPOCH = 5; // 5am

// Helper function for getTrafficDistributionFactors
function computeRequiredAvgTravelTimes({ npmrdsDataProcessor, tmcLength }) {
  if (!npmrdsDataProcessor) {
    return null;
  }
  // Accumulators [count, sum]
  const combinedPeak = [0, 0];
  const amPeak = [0, 0];
  const pmPeak = [0, 0];
  const freeFlow = [0, 0];

  const binnedTravelTimesIterator = npmrdsDataProcessor.makeBinnedTravelTimesIterator(
    {
      tmcLength
    }
  );

  if (!binnedTravelTimesIterator) {
    return null;
  }

  for (let { avgTT, hour } of binnedTravelTimesIterator) {
    if (avgTT) {
      if (hour >= AM_PEAK_START_HOUR && hour < AM_PEAK_END_HOUR) {
        ++combinedPeak[0];
        combinedPeak[1] += +avgTT;

        ++amPeak[0];
        amPeak[1] += +avgTT;
      } else if (hour >= PM_PEAK_START_HOUR && hour < PM_PEAK_END_HOUR) {
        ++combinedPeak[0];
        combinedPeak[1] += +avgTT;

        ++pmPeak[0];
        pmPeak[1] += +avgTT;
      } else if (
        hour < FREEFLOW_AM_END_EPOCH ||
        hour > FREEFLOW_PM_START_EPOCH
      ) {
        ++freeFlow[0];
        freeFlow[1] += +avgTT;
      }
    }
  }

  return {
    combinedPeakAvgTT: combinedPeak[1] / combinedPeak[0],
    amPeakAvgTT: amPeak[1] / amPeak[0],
    pmPeakAvgTT: pmPeak[1] / pmPeak[0],
    freeFlowAvgTT: freeFlow[1] / freeFlow[0]
  };
}

export const getTrafficDistributionFactors = ({
  npmrdsDataProcessor,
  binMinutes,
  tmcLength,
  meanType,
  tmcIsControlledAccess
}) => {
  const requiredAvgTravelTimes = computeRequiredAvgTravelTimes({
    npmrdsDataProcessor,
    binMinutes,
    tmcLength,
    meanType
  });

  if (!requiredAvgTravelTimes) {
    return null;
  }

  const {
    combinedPeakAvgTT,
    amPeakAvgTT,
    pmPeakAvgTT,
    freeFlowAvgTT
  } = requiredAvgTravelTimes;

  const speedReductionFactor = freeFlowAvgTT / combinedPeakAvgTT;

  let tmcCongestionLevel;

  if (tmcIsControlledAccess) {
    // Freeway
    if (!speedReductionFactor || speedReductionFactor >= 0.9) {
      tmcCongestionLevel = 'NO2LOW_CONGESTION';
    } else if (speedReductionFactor >= 0.75) {
      tmcCongestionLevel = 'MODERATE_CONGESTION';
    } else {
      tmcCongestionLevel = 'SEVERE_CONGESTION';
    }
  } else if (!speedReductionFactor || speedReductionFactor >= 0.8) {
    tmcCongestionLevel = 'NO2LOW_CONGESTION';
  } else if (speedReductionFactor >= 0.65) {
    tmcCongestionLevel = 'MODERATE_CONGESTION';
  } else {
    tmcCongestionLevel = 'SEVERE_CONGESTION';
  }

  const peakTimeDifferential =
    Math.max(amPeakAvgTT, pmPeakAvgTT) - Math.min(amPeakAvgTT, pmPeakAvgTT);

  const peakSpeedDifferential =
    Math.abs(tmcLength / amPeakAvgTT - tmcLength / pmPeakAvgTT) * 3600;

  let tmcDirectionality;

  if (!peakSpeedDifferential || peakSpeedDifferential <= 6) {
    tmcDirectionality = 'EVEN_DIST';
  } else {
    tmcDirectionality = amPeakAvgTT > pmPeakAvgTT ? 'AM_PEAK' : 'PM_PEAK';
  }

  return {
    tmcCongestionLevel,
    tmcDirectionality,
    combinedPeakAvgTT,
    amPeakAvgTT,
    pmPeakAvgTT,
    freeFlowAvgTT,
    speedReductionFactor,
    peakTimeDifferential,
    peakSpeedDifferential
  };
};
