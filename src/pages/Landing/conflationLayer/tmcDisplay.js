import React, { Component } from 'react';


class TMCDisplay extends Component {
    render () {
        return (
            <div>
                <h4>INFO BOX {this.props.layer.activeTMC}</h4>
            </div>

        )
    }
}

export default TMCDisplay