import { tmcAttributesMap } from 'utils/constants';

export const queryTmcAttributes = (tmc, attributes) => [
  'tmc',
  tmc,
  'attributes',
  Array.isArray(attributes)
    ? attributes.map(attr => tmcAttributesMap[attr] || attr)
    : tmcAttributesMap[attributes] || attributes
];

export const queryNPMRDSDataForTmc = (tmc, year, dataSource = 'ALL') => [
  'tmc',
  tmc,
  'year',
  year,
  'npmrds',
  dataSource
];

export const queryTrafficDistributionsProfiles = () => [
  'trafficDistributions',
  'profiles'
];

export const queryTrafficDistributionsDOWAdjFactors = () => [
  'trafficDistributions',
  'dowAdjFactors'
];

export const queryMeasureRules = measure => ['pm3', 'measureSpec', measure];

export const queryGeoLevelsForState = stateCode => [
  'geo',
  stateCode,
  'geoLevels'
];

export const queryPM3MeasuresForTmcs = (tmcs, years, measures) => {
  // const t = Array.isArray(tmcs) ? tmcs : [tmcs]
  // const y = Array.isArray(years) ? years : [years]
  // const m = Array.isArray(measures) ? measures : [measures]
  return ['pm3', 'measuresByTmc', tmcs, years, measures];
};

export const queryGeoAttributes = (geoLevel, geoId) => {
  const syntheticGeoKey = `${geoLevel}|${geoId}`;
  return ['geoAttributes', syntheticGeoKey];
};
