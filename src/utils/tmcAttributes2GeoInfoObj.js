const tmcAttributes2GeoInfoObj = ({ tmcAttributes, geolevel }) => {
  if (!(tmcAttributes && geolevel)) {
    return null;
  }

  const { state_code } = tmcAttributes;
  const states = [state_code];

  let geoid = null;
  let geoname = null;

  if (geolevel === 'COUNTY') {
    geoid = tmcAttributes.tmcCountyCode;
    geoname = tmcAttributes.tmcCountyName;
  }

  if (geolevel === 'MPO') {
    geoid = tmcAttributes.tmcMpoCode;
    geoname = tmcAttributes.tmcMpoName;
  }

  if (geolevel === 'UA') {
    geoid = tmcAttributes.tmcUACode;
    geoname = tmcAttributes.tmcUAName;
  }

  if (geolevel === 'STATE') {
    geoid = tmcAttributes.tmcStateCode;
    geoname = tmcAttributes.tmcStateName;
  }

  return geoid
    ? {
        geolevel,
        geoid,
        geoname,
        states
      }
    : null;
};

export default tmcAttributes2GeoInfoObj;
