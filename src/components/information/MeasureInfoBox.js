import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor } from 'utils/redux-falcor';

import { measureInfoSelector } from 'store/falcorGraphSelectors';

// Falcor Route:
//   `pm3.measureInfo.[{keys:measureIds}]['fullname', 'definition', 'equation', 'source']`,
class MeasureInfoBox extends Component {
  fetchFalcorDeps() {
    const { measure, measureInfo: { definition } = {} } = this.props;
    return measure && !definition
      ? this.props.falcor.get([
          'pm3',
          'measureInfo',
          measure,
          ['fullname', 'definition', 'equation', 'source']
        ])
      : Promise.resolve();
  }

  componentWillReceiveProps({ measure, measureInfo: { definition } = {} }) {
    if (measure && !definition) {
      return this.props.falcor
        .get([
          'pm3',
          'measureInfo',
          measure,
          ['fullname', 'definition', 'equation', 'source']
        ])
        .then(() => this.forceUpdate());
    }
  }

  render() {
    const {
      measureInfo: { fullname, definition, equation, peaks } = {},
      excludeFullNameInInfoBox
    } = this.props;

    return definition ? (
      <div style={{ padding: '7px' }}>
        <dl>
          {excludeFullNameInInfoBox ? null : <dt>Measure</dt>}
          {excludeFullNameInInfoBox ? null : <dd>{fullname || ''}</dd>}
          <dt>Definition</dt>
          <dd>{definition || ''}</dd>
          <dt>{equation ? 'Equation' : null}</dt>
          <dd>{equation || null}</dd>
          <dt>{peaks ? 'Measure Defined Peaks or time periods' : null}</dt>
          <dd>{peaks || null}</dd>
        </dl>
      </div>
    ) : null;
  }
}

MeasureInfoBox.defaultProps = {
  title: 'MeasureInfoBox'
};

const mapStateToProps = (state, ownProps) => {
  const { measure } = ownProps;

  return {
    measure,
    measureInfo: measureInfoSelector(state, measure)
  };
};

export default connect(mapStateToProps)(reduxFalcor(MeasureInfoBox));
