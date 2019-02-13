import React, { Component } from 'react';
import { connect } from 'react-redux';

import { reduxFalcor } from 'utils/redux-falcor';

import Select from 'react-select';

import { queryGeoLevelsForState } from 'store/falcorGraphQueryBuilders';
import { getGeoLevelsForState } from 'store/falcorGraphSelectors';

const getInterstateGeoStatesSubset = geoInfo =>
  geoInfo &&
  geoInfo.geoname &&
  geoInfo.states &&
  geoInfo.geoname.match(/[A-Z]{2}--[A-Z]{2}$/)
    ? ` {${geoInfo.states.join(',')}}`
    : '';

class GeographySelector extends Component {
  fetchFalcorDeps() {
    const { falcor, stateCode } = this.props;
    const q = queryGeoLevelsForState(stateCode);
    console.log('GeographySelector query', q)
    return falcor.get(q);
  }

  render() {
    const { curGeoInfo, geoLevels, isMulti = true } = this.props;

    if (!geoLevels) {
      return <div>Loading</div>;
    }

    const options = geoLevels.map(geoInfo => ({
      value: geoInfo,
      label: `${geoInfo.geoname} (${
        geoInfo.geolevel
      })${getInterstateGeoStatesSubset(geoInfo)}`
    }));

    let curGeoName = curGeoInfo && curGeoInfo.geoname;

    // Parent components may not need to know the geoname.
    //   We get it here, without mutating the curGeoInfo prop object.
    if (curGeoInfo && !curGeoName) {
      const cgi =
        geoLevels.find(
          ({ geolevel, geoid }) =>
            geolevel === curGeoInfo.geolevel && geoid === curGeoInfo.geoid
        ) || {};

      curGeoName = cgi && cgi.geoname;
    }

    return (
      <Select
        value={
          curGeoName
            ? {
                value: { ...curGeoInfo, ...{ geoname: curGeoName } },
                label: `${curGeoName} (${
                  curGeoInfo.geolevel
                })${getInterstateGeoStatesSubset(curGeoInfo)}`
              }
            : undefined
        }
        isMulti={isMulti}
        options={options}
        onChange={this.props.onChange}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { stateCode, curGeoInfo, isMulti } = ownProps;
  return {
    curGeoInfo,
    isMulti,
    geoLevels: getGeoLevelsForState(state, stateCode)
  };
};

export default connect(mapStateToProps)(reduxFalcor(GeographySelector));
