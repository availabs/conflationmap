import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor } from 'utils/redux-falcor';

import { queryTmcAttributes } from 'store/falcorGraphQueryBuilders';
import { precisionRound } from 'utils/calculators/MathUtils';

import { getTmcAttributes } from 'store/falcorGraphSelectors';

import tmcAttributes2GeoInfoObj from 'utils/tmcAttributes2GeoInfoObj';

import {
  functionalSystemCodes,
  facilityTypeCodes,
  structureTypeCodes,
  routeSigningCodes,
  routeQualifierCodes,
  nationalHighwaySystemCodes,
  strategicHighwayNetworkCodes,
  nationalTruckNetworkCodes,
  tmcAttributesMap,
  clickableStyle
} from 'utils/constants';

const allTmcAttributes = Object.keys(tmcAttributesMap);

class TmcInfo extends Component {
  fetchFalcorDeps() {
    const { tmc, falcor } = this.props;

    return tmc
      ? falcor.get(queryTmcAttributes(tmc, allTmcAttributes))
      : Promise.resolve();
  }

  render() {
    const {
      tmcAttributes,
      onTmcClick,
      onCountyClick,
      onMpoClick,
      onUAClick
    } = this.props;

    const {
      tmc,
      tmcAadt,
      tmcAadtCombi,
      tmcAadtSingl,
      tmcAltRteName,
      tmcAvgSpeedlimit,
      tmcCountyName,
      tmcDirection,
      tmcFSystem,
      tmcFacilType,
      tmcLength,
      tmcLinear,
      tmcMpoName,
      tmcNHS,
      tmcNHSPct,
      tmcRoadname,
      tmcRouteNumb,
      tmcRouteQual,
      tmcRouteSign,
      tmcStateName,
      tmcStrhntPct,
      tmcStrhntTyp,
      tmcStrucType,
      tmcThruLanes,
      tmcTruck,
      tmcUAName
    } = tmcAttributes;

    if (!tmc) {
      return null;
    }

    const formattedLength =
      tmcLength < 0.1
        ? `${precisionRound(5280 * tmcLength)} feet`
        : `${precisionRound(tmcLength, 4)} miles`;

    return (
      <div style={{ width: '100%', height: 450, color: '#333' }}>
        <dl style={{ columns: 3, breakInside: 'avoid' }}>
          <dt>tmc</dt>
          <dd
            onClick={() => onTmcClick && onTmcClick(tmc)}
            style={onTmcClick ? clickableStyle : {}}
          >
            {tmc}
          </dd>
          <dt>roadname</dt>
          <dd>{tmcRoadname}</dd>
          <dt>alternate name</dt>
          <dd>{tmcAltRteName}</dd>
          <dt>route number</dt>
          <dd>{tmcRouteNumb}</dd>
          <dt>route signing</dt>
          <dd>{routeSigningCodes[tmcRouteSign] || ''}</dd>
          <dt>route qualifier</dt>
          <dd>{routeQualifierCodes[tmcRouteQual] || ''}</dd>
          <dt>direction</dt>
          <dd>{tmcDirection}</dd>
          <dt>State</dt>
          <dd>{tmcStateName}</dd>
          <dt>County</dt>
          <dd
            onClick={() =>
              onCountyClick &&
              onCountyClick(
                tmcAttributes2GeoInfoObj({ tmcAttributes, geolevel: 'COUNTY' })
              )
            }
            style={onCountyClick ? clickableStyle : {}}
          >
            {tmcCountyName || ''}
          </dd>
          <dt>MPO</dt>
          <dd
            onClick={() =>
              onMpoClick &&
              onMpoClick(
                tmcAttributes2GeoInfoObj({ tmcAttributes, geolevel: 'MPO' })
              )
            }
            style={onMpoClick ? clickableStyle : {}}
          >
            {tmcMpoName || ''}
          </dd>
          <dt>Urban Area</dt>
          <dd
            onClick={() =>
              onUAClick &&
              onUAClick(
                tmcAttributes2GeoInfoObj({ tmcAttributes, geolevel: 'UA' })
              )
            }
            style={onUAClick ? clickableStyle : {}}
          >
            {tmcUAName || ''}
          </dd>
          <dt>length</dt>
          <dd>{tmcLength ? formattedLength : ''}</dd>
          <dt>avg speedlimit</dt>
          <dd>{precisionRound(tmcAvgSpeedlimit) || ''}</dd>
          <dt>AADT</dt>
          <dd>{tmcAadt || ''}</dd>
          <dt>Single-Unit Truck & Bus AADT</dt>
          <dd>{tmcAadtSingl || ''}</dd>
          <dt>Combination Truck AADT</dt>
          <dd>{tmcAadtCombi || ''}</dd>
          <dt>functional classification</dt>
          <dd>{functionalSystemCodes[tmcFSystem] || ''}</dd>
          <dt>facility type</dt>
          <dd>{facilityTypeCodes[tmcFacilType] || ''}</dd>
          <dt>structure type</dt>
          <dd>{structureTypeCodes[tmcStrucType] || ''}</dd>
          <dt>through lanes</dt>
          <dd>{`${tmcThruLanes} ${
            tmcFacilType > 1 ? '(both travel directions)' : ''
          }`}</dd>
          <dt>NHS Component Type</dt>
          <dd>{nationalHighwaySystemCodes[tmcNHS] || ''}</dd>
          <dt>% of TMC on NHS</dt>
          <dd>
            {tmcNHSPct === undefined || tmcNHSPct === null
              ? ''
              : `${tmcNHSPct}%`}
          </dd>
          <dt>STRAHNET Component Type</dt>
          <dd>{strategicHighwayNetworkCodes[tmcStrhntTyp] || ''}</dd>
          <dt>% of TMC on STRAHNET</dt>
          <dd>
            {tmcStrhntPct === undefined || tmcStrhntPct === null
              ? ''
              : `${tmcStrhntPct}%`}
          </dd>
          <dt>National Truck Network Compnent Type</dt>
          <dd>{nationalTruckNetworkCodes[tmcTruck] || ''}</dd>
          <dt>TMC Linear</dt>
          <dd>{tmcLinear}</dd>
        </dl>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { tmc } = ownProps;

  return { tmcAttributes: getTmcAttributes(state, tmc) };
};

export default connect(mapStateToProps)(reduxFalcor(TmcInfo));
