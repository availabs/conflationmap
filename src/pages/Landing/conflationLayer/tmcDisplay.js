import React, { Component } from 'react';


class TMCDisplay extends Component {
    render () {
        return (
            <div style={{'color':'#CCC'}}>
                <h4>INFO BOX {this.props.layer.activeTMC}</h4>


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