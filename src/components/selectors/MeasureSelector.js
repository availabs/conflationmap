import React, { Component } from 'react';
import { connect } from 'react-redux';

import { reduxFalcor } from 'utils/redux-falcor';

import Select from 'react-select';
import MeasureInfoBox from 'components/information/MeasureInfoBox';

const PEAKS_REGEXP = /_am$|_off$|_pm$|_overnight$|_weekend$/;

const measureOptionsSelector = (
  { graph: { pm3: { measureInfo } = {} } = {} },
  excludePeakBreakdowns,
  excludeHarmonicMeanVersions
) =>
  measureInfo
    ? Object.keys(measureInfo)
        .filter(
          mId =>
            !(
              excludePeakBreakdowns &&
              (mId.match(PEAKS_REGEXP) ||
                (measureInfo[mId].fullname &&
                  measureInfo[mId].fullname.match(/ Peak$/i)))
            )
        )
        .filter(
          mId =>
            !(
              excludeHarmonicMeanVersions &&
              (measureInfo[mId].fullname &&
                measureInfo[mId].fullname.match(/Harmonic Mean/i))
            )
        )
        .map(mId => ({
          value: mId,
          label: (measureInfo[mId] && measureInfo[mId].fullname) || mId
        }))
    : null;

class MeasureSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMeasureInfo: false,
      selectedMeasure: props.measure
    };
  }

  componentWillReceiveProps({ measure, measureInfo }) {
    if (measure && !(measureInfo && measureInfo.definition)) {
      return this.props.falcor.get([
        'pm3',
        measure,
        ['fullname', 'definition', 'equation', 'source']
      ]);
    }
  }

  fetchFalcorDeps() {
    return this.props.falcor
      .get(['pm3', 'measureIds'])
      .then(({ json: { pm3: { measureIds } } }) => {
        return this.props.falcor.get([
          'pm3',
          'measureInfo',
          measureIds,
          'fullname'
        ]);
      });
  }

  render() {
    const { measureOptions, excludeFullNameInInfoBox } = this.props;

    if (!measureOptions) {
      return <div>Loading</div>;
    }

    const currentValue = measureOptions.find(
      ({ value }) => value === this.state.selectedMeasure
    );

    return (
      <div style={{ padding: '7px', position: 'relative' }}>
        <div>
          <div style={{ width: '10%', float: 'left' }}>
            {this.props.popoutMeasureInfoBox ? (
              <i
                style={{
                  height: '10px',
                  width: '10px'
                }}
                className="os-icon os-icon-info"
                onClick={() =>
                  this.setState({
                    showMeasureInfo: !this.state.showMeasureInfo
                  })
                }
              />
            ) : null}
          </div>
          <div style={{ width: '90%', float: 'left' }}>
            <Select
              value={currentValue}
              isMulti={false}
              options={measureOptions}
              onChange={({ value }) => {
                this.setState({ selectedMeasure: value });
                if (this.props.autoApply) {
                  this.props.setMeasure(value);
                }
              }}
            />
          </div>
        </div>
        {this.props.autoApply ? null : (
          <button
            onClick={() => this.props.setMeasure(this.state.selectedMeasure)}
          >
            Apply
          </button>
        )}
        {this.props.popoutMeasureInfoBox && this.state.showMeasureInfo ? (
          <div
            style={{
              position: 'absolute',
              left: '-300px',
              color: 'black',
              width: '300px',
              backgroundColor: 'white',
              top: '0%'
            }}
          >
            <MeasureInfoBox
              measure={this.state.selectedMeasure}
              excludeFullNameInInfoBox={excludeFullNameInInfoBox}
            />
          </div>
        ) : null}
        {!this.props.popoutMeasureInfoBox ? (
          <MeasureInfoBox
            measure={this.state.selectedMeasure}
            excludeFullNameInInfoBox={excludeFullNameInInfoBox}
          />
        ) : null}
      </div>
    );
  }
}

MeasureSelector.defaultProps = {
  autoApply: false,
  popoutMeasureInfoBox: true,
  excludePeakBreakdowns: false
};

const mapStateToProps = (state, ownProps) => {
  const { excludePeakBreakdowns, excludeHarmonicMeanVersions } = ownProps;
  return {
    measureOptions: measureOptionsSelector(
      state,
      excludePeakBreakdowns,
      excludeHarmonicMeanVersions
    )
  };
};

export default connect(mapStateToProps)(reduxFalcor(MeasureSelector));
