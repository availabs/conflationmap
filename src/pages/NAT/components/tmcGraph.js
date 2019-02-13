import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor } from 'utils/redux-falcor';
// import { tmcArrays } from './tmcCalculations'

import LineChart from 'pages/auth/Incidents/components/charts/lineChart';

import get from 'lodash.get';

// import get from 'lodash.get';

// export const tmcArrays = (tmcData, tmc, date) => {
//   let year = date.split('-')[0];
//     let day = get(
//       tmcData.tmc[tmc],
//       `day.${date}.tt`,
//       {}
//     );

//     let freeflow = get(
//       tmcData.tmc[tmc],
//       `pm3.${year}.freeflowtt`,
//       {}
//     );

//     let length = +get(
//       tmcData.tmc[tmc],
//       'attributes.length',
//       1
//     );

//     let avgDay = get(
//       tmcData.tmc[tmc],
//       `year.${year}.avgtt`,
//       {}
//     );

//     let dayData =  { id: `Speed`, data: [] }
//     for(let i=0; i<288; i++){
//         let dataPoint = {
//           x: i,
//           y: day[i] 
//             ? +((length / day[i]) * 3600).toFixed(1)
//             : null
//         };
//         dayData.data.push(dataPoint);
//     }
    

//     let ffData =  { id: `ff`, data: [] }
//     for(let i=0; i<288; i++){
//         let dataPoint = {
//           x: i,
//           y: freeflow.toFixed(1)
//         };
//         ffData.data.push(dataPoint);
//     }
    

//     let avgDayData = avgDay.reduce(
//       (out, epoch, i) => {
//         let dataPoint = {
//           x: i,
//           y: +((length / epoch) * 3600).toFixed(1)
//         };
//         out.data.push(dataPoint);
//         return out;
//       },
//       { id: `Avg Speed`, data: [], }
//     );

//     return {
//       dayData,
//       avgDayData,
//       ffData
//     }
// }

class TMCGraph extends Component {
  componentDidUpdate(oldProps) {
    if (oldProps.tmc !== this.props.tmc) {
      this.fetchFalcorDeps()
        .then(() => this.forceUpdate());
    }
  }
  fetchFalcorDeps() {
console.log("<TMCGraph.fetchFalcorDeps>")
    let year = +this.props.date.split('-')[0];
    if (!this.props.tmc) return Promise.resolve()
    return this.props.falcor
      .get(
        [
          'tmc',
          this.props.tmc,
          'attributes',
          ['road_name', 'avg_speedlimit', 'length']
        ],
        [
          'tmc',
          this.props.tmc,
          'pm3',
          year,
          ['freeflowtt', 'vd_total', 'aadt']
        ],
        ['tmc', this.props.tmc, 'year', year, 'avgtt'],
        ['tmc', this.props.tmc, 'day', this.props.date, 'tt_fill']
      )
  }

  processData() {
    const tmc = this.props.tmc,
      date = this.props.date,
      year = date.split('-')[0],

      graph = this.props.tmcGraph[tmc];

    const day = get(
      graph,
      `day.${ date }.tt_fill.value`,
      {}
    );

    let freeflow = get(
      graph,
      `pm3.${year}.freeflowtt`,
      {}
    );

    const length = +get(
      graph,
      'attributes.length',
      0
    );

    let avgDay = get(
      graph,
      `year.${year}.avgtt.value`,
      {}
    );

    let dayData =  { id: `Speed`, data: [] }
    for (let i = 0; i < 288; ++i) {
      let dataPoint = {
        x: i,
        y: day[i] 
          ? +((length / day[i]) * 3600).toFixed(1)
          : null
      };
      dayData.data.push(dataPoint);
    }

    let ffData =  { id: `FF`, data: [] }
    for (let i = 0; i < 288; ++i){
      let dataPoint = {
        x: i,
        y: freeflow.toFixed(1)
      };
      ffData.data.push(dataPoint);
    }

    let avgDayData = avgDay.reduce(
      (out, epoch, i) => {
        let dataPoint = {
          x: i,
          y: +((length / epoch) * 3600).toFixed(1)
        };
        out.data.push(dataPoint);
        return out;
      },
      { id: `Avg Speed`, data: [], }
    );

    return [dayData, ffData, avgDayData];
  }

  renderGraph() {
    try {
      return (
        <div style={ { width: '100%', height: 100, color: '#333' } }>
          <LineChart data={ this.processData() } />
        </div>
      );
    }
    catch (e) {
      return null;
    }
  }

  render() {
    return this.renderGraph()
  }
}

TMCGraph.defaultProps = {
  date: '2017-02-01'
};

const mapStateToProps = state => {
  return {
    tmcGraph: state.graph.tmc
  };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxFalcor(TMCGraph));
