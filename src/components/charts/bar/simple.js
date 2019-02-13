import React, {Component} from 'react';
import { ResponsiveBar } from '@nivo/bar'

// make sure parent container have a defined height when using responsive component,
// otherwise height will be 0 and no chart will be rendered.
// website examples showcase many properties, you'll often use just a few of them.
const testData = [    
      {
        "x": "PR",
        "y": 4,
        "yColor": "hsl(10, 70%, 50%)"
      },
      {
        "x": "UA",
        "y": 49,
        "yColor": "hsl(10, 70%, 50%)"
      },
      {
        "x": "CD",
        "y": 1,
        "yColor": "hsl(10, 70%, 50%)"
      },
      {
        "x": "MK",
        "y": 49,
        "yColor": "hsl(10, 70%, 50%)"
      },
      {
        "x": "KN",
        "y": 27,
        "yColor": "hsl(10, 70%, 50%)"
      },
      {
        "x": "NZ",
        "y": 39,
        "yColor": "hsl(10, 70%, 50%)"
      },
      {
        "x": "BL",
        "y": 28,
        "yColor": "hsl(10, 70%, 50%)"
      },
      {
        "x": "HT",
        "y": 4,
        "yColor": "hsl(10, 70%, 50%)"
      },
      {
        "x": "AR",
        "y": 38,
        "yColor": "hsl(10, 70%, 50%)"
      }
  
]
export default class SimpleBar extends Component {

    render () {
        let theData = testData
        return (  
            <ResponsiveBar
                data={theData}
                indexBy="x"
                keys={['y']}
                margin={{
                    "top": 50,
                    "right": 130,
                    "bottom": 50,
                    "left": 60
                }}
                padding={0.3}
                colors="nivo"
                colorBy="id"
                borderColor="inherit:darker(1.6)"
                axisBottom={{
                    "orient": "bottom",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legendPosition": "center",
                    "legendOffset": 36
                }}
                axisLeft={{
                    "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legendPosition": "center",
                    "legendOffset": -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="inherit:darker(1.6)"
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                tooltip={function(e){
                    console.log('bar e', e)

                }}
                legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom-right",
                        "direction": "column",
                        "translateX": 120,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 2,
                        "symbolSize": 20
                    }
                ]}
                theme={{
                    "tooltip": {
                        "container": {
                            "fontSize": "13px",
                            "background": "#333"
                        }
                    },
                    "labels": {
                        "textColor": "#555"
                    }
                }}
            />
        )
    }
}