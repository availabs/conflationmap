import React, { Component } from 'react';
import { ResponsiveScatterPlotCanvas } from '@nivo/scatterplot';

// make sure parent container have a defined height when using responsive component,
// otherwise height will be 0 and no chart will be rendered.
// website examples showcase many properties, you'll often use just a few of them.

export default class ScatterPlot extends Component {
  render() {
    const {
      data: theData,
      includedTicksFilter,
      bottomLegend = '',
      bottomFormat,
      leftLegend = '',
      xScale,
      animate = true,
      tooltipFormat
    } = this.props;

    return (
      <ResponsiveScatterPlotCanvas
        data={theData}
        margin={{
          top: 60,
          right: 140,
          bottom: 70,
          left: 90
        }}
        xScale={
          xScale || {
            type: 'linear',
            min: 0,
            max: 'auto'
          }
        }
        yScale={{
          type: 'linear',
          min: 0,
          max: 'auto'
        }}
        tooltipFormat={tooltipFormat}
        symbolSize={4}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'weight',
          legendPosition: 'middle',
          legendOffset: 36,
          format: bottomFormat
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: leftLegend,
          legendPosition: 'middle',
          legendOffset: -40
        }}
        animate={animate}
        motionStiffness={90}
        motionDamping={15}
        useMesh={true}
        colorBy={n => (n && n.serie && n.serie.color) || (n && n.color)}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            translateX: 130,
            itemWidth: 100,
            itemHeight: 12,
            itemsSpacing: 5,
            symbolSize: 12,
            symbolShape: 'circle'
          }
        ]}
      />
    );
  }
}
