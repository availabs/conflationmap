export const INTERSTATE = 'INTERSTATE';
export const NONINTERSTATE = 'NONINTERSTATE';

export const daysOfWeek = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];

export const hoursOfDay = [...Array(24)].map(
  (_, i) => `${i % 12 || 12} ${i < 12 ? 'am' : 'pm'}`
);

export const monthAbbrs = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];
export const monthColors = [
  '#A0141A',
  '#A14BA2',
  '#97D9E7',
  '#EEEEEE',
  '#1F7839',
  '#D5BDE8',
  '#EC2028',
  '#A9D81C',
  '#000DFE',
  '#FE5288',
  '#FFC713',
  '#08A2E7'
];

export const standardColors = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928'
];

export const functionalSystemCodes = {
  1: 'Interstate',
  2: 'Principal Arterial – Other Freeways and Expressways',
  3: 'Principal Arterial – Other',
  4: 'Minor Arterial',
  5: 'Major Collector',
  6: 'Minor Collector',
  7: 'Local'
};

export const facilityTypeCodes = {
  1: 'One-Way Roadway',
  2: 'Two-Way Roadway',
  4: 'Ramp',
  5: 'Non Mainlane',
  6: 'Non Inventory Direction',
  7: 'Planned/Unbuilt'
};

export const structureTypeCodes = {
  1: 'Bridge',
  2: 'Tunnel',
  3: 'Causeway'
};

export const routeSigningCodes = {
  1: 'Not Signed',
  2: 'Interstate',
  3: 'U.S.',
  4: 'State',
  5: 'Off-Interstate Business Marker',
  6: 'County',
  7: 'Township',
  8: 'Municipal',
  9: 'Parkway Marker or Forest Route Marker',
  10: 'None of the Above'
};

export const routeQualifierCodes = {
  1: 'No qualifier or Not Signed',
  2: 'Alternate',
  3: 'Business Route',
  4: 'Bypass Business',
  5: 'Spur',
  6: 'Loop',
  7: 'Proposed',
  8: 'Temporary',
  9: 'Truck Route',
  10: 'None of the Above'
};

export const nationalHighwaySystemCodes = {
  1: 'Non Connector NHS',
  2: 'Major Airport',
  3: 'Major Port Facility',
  4: 'Major Amtrak Station',
  5: 'Major Rail/Truck Terminal',
  6: 'Major Inter City Bus Terminal',
  7: 'Major Public Transportation or Multi-Modal Passenger Terminal',
  8: 'Major Pipeline Terminal',
  9: 'Major Ferry Terminal'
};
export const strategicHighwayNetworkCodes = {
  1: 'Regular STRAHNET',
  2: 'Connector'
};

export const nationalTruckNetworkCodes = {
  1: 'Section is on the National Truck Network',
  2: 'Other State-designated truck route'
};

export const tmcAttributesMap = {
  tmcAadt: 'aadt',
  tmcAadtCombi: 'aadt_combi',
  tmcAadtSingl: 'aadt_singl',
  tmcAltRteName: 'altrtename',
  tmcAvgSpeedlimit: 'avg_speedlimit',
  tmcBoundingBox: 'bounding_box',
  tmcCountyCode: 'county_code',
  tmcCountyName: 'county',
  tmcDirection: 'direction',
  tmcFSystem: 'f_system',
  tmcFacilType: 'faciltype',
  // TODO: Get rid of tmcIsControlledAccess and compute in selector
  //       using the f_system number.
  tmcIsControlledAccess: 'is_controlled_access',
  tmcLength: 'length',
  tmcLinear: 'tmclinear',
  tmcMpoCode: 'mpo_code',
  tmcMpoName: 'mpo_name',
  tmcNHS: 'nhs',
  tmcNHSPct: 'nhs_pct',
  tmcRoadname: 'roadname',
  tmcRouteNumb: 'route_numb',
  tmcRouteQual: 'route_qual',
  tmcRouteSign: 'route_sign',
  tmcState: 'state',
  tmcStateCode: 'state_code',
  tmcStateName: 'statename',
  tmcStrhntPct: 'strhnt_pct',
  tmcStrhntTyp: 'strhnt_typ',
  tmcStrucType: 'structype',
  tmcThruLanes: 'thrulanes',
  tmcTruck: 'truck',
  tmcUACode: 'ua_code',
  tmcUAName: 'ua_name'
};

export const numericTmcAttributes = [
  'tmcAadt',
  'tmcAadtCombi',
  'tmcAadtSingl',
  'tmcAvgSpeedlimit',
  'tmcFSystem',
  'tmcFacilType',
  'tmcStrucType',
  'tmcThruLanes',
  'tmcRouteNumb',
  'tmcRouteSign',
  'tmcRouteQual',
  'tmcNHS',
  'tmcNHSPct',
  'tmcStrhntTyp',
  'tmcStrhntPct',
  'tmcTruck',
  'tmcLength',
  'tmcLinear'
];

export const tmcAttributesDisplayNames = {
  tmc: 'tmc',
  tmcLength: 'length',
  tmcDirection: 'direction',
  tmcAadt: 'AADT',
  tmcAadtCombi: 'AADT (combi)',
  tmcAadtSingl: 'AADT (singl)',
  tmcAvgSpeedlimit: 'Avg Speedlimit',
  tmcFSystem: 'Functional System Code',
  tmcFacilType: 'Facility Type',
  tmcStrucType: 'Structure Type',
  tmcThruLanes: 'Thru Lanes',
  tmcRouteNumb: 'Route Number',
  tmcRouteSign: 'Route Signing',
  tmcRouteQual: 'Route Qualifier',
  tmcAltRteName: 'Alternate Route Name',
  tmcNHS: 'NHS Code',
  tmcNHSPct: 'NHS %',
  tmcStrhntTyp: 'Strategic Highway Network Type',
  tmcStrhntPct: 'Strategic Highway Network %',
  tmcTruck: 'National Truck Network Code',
  tmcRoadname: 'Road Name',
  tmcCountyName: 'County',
  tmcMpoName: 'MPO',
  tmcUAName: 'UA',
  tmcLinear: 'Associated Linear TMC'
};

export const geoLevelTypesDisplayNames = {
  STATE: 'State',
  COUNTY: 'County',
  MPO: 'MPO',
  UA: 'UA'
};

export const clickableStyle = {
  color: '#0000EE',
  cursor: 'pointer'
};

export const reportingVehiclesByDataDensityIndicator = {
  A: [1, 4],
  B: [5, 9],
  C: [10]
};

export const travelTimeDataSourceDisplayNames = {
  ALL: 'All Vehicles',
  PASS: 'Passenger Vehicles',
  TRUCK: 'Freight Trucks'
};
