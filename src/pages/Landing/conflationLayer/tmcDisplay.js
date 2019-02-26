import React, { Component } from 'react';
import conflation from "./conflation";


class TMCDisplay extends Component {
    render () {
        return (
            <div style={{'color':'#CCC'}}>
                <h4>INFO BOX {this.props.layer.activeTMC} </h4> <button onClick={() =>{
                conflation.infoBoxes.test.clearInfoBox();

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