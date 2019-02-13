// See http://nivo.rocks/calendar

import React, { Component } from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';

// make sure parent container have a defined height when using responsive component,
// otherwise height will be 0 and no chart will be rendered.
// website examples showcase many properties, you'll often use just a few of them.

export default class SimpleCalendar extends Component {
  render() {
    const { data, from, to } = this.props;
    if (!data) {
      return null;
    }

    const days = from && to ? null : data.map(({ day }) => day).sort();
    const f = from || days[1];
    const t = to || days[data.length - 1];

    return (
      <ResponsiveCalendar
        data={data}
        from={f}
        to={t}
        emptyColor="#eeeeee"
        colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
        margin={{
          top: 100,
          right: 30,
          bottom: 60,
          left: 30
        }}
        yearSpacing={40}
        monthBorderColor="#ffffff"
        monthLegendOffset={10}
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'row',
            translateY: 36,
            itemCount: 4,
            itemWidth: 34,
            itemHeight: 36,
            itemDirection: 'top-to-bottom'
          }
        ]}
      />
    );
  }
}
