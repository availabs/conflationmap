import React, { Component } from 'react';
import conflation_LRS from "./conflationLRS";


class TMCDisplay extends Component {
    render () {
        return (
            <div style={{'color':'#CCC','overflow': 'scroll'}}>
                <h4>INFO BOX {this.props.layer.activeTMC} </h4> <button onClick={() =>{
                    //console.log(this.props.layer.layers.find(f => f.id === 'TMC_layer_osm_one_way').filter.length);
                    /*if (this.props.layer.layers.find(f => f.id === 'TMC_layer_osm_one_way').filter.length > 2)
                    {
                        console.log('pop!');
                        this.props.layer.layers.find(f => f.id === 'TMC_layer_osm_one_way').filter.pop();}
                    if (this.props.layer.layers.find(f => f.id === 'TMC_layer_osm_two_way_1').filter.length > 2)
                    {
                        console.log('pop!');
                        this.props.layer.layers.find(f => f.id === 'TMC_layer_osm_two_way_1').filter.pop();}*/

                //console.log(this.map.getFilter('TMC_layer_osm_one_way'))
                }
                }>Clear</button>


                    {this.props.layer.activeWays &&
                    this.props.layer.activeWays.map(way => {
                            return <h6> {way} </h6>
                        })
                    }




            </div>

        )
    }
}

export default TMCDisplay