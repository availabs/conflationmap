import React, { Component } from 'react';
import conflation from './conflationLayer/conflation.js'
import conflation_LRS from './conflationLayerLRS/conflationLRS.js'
//import conflationLayer_new from './conflationLayerLRS/conflationLayer.js'


// import Logo from "components/mitigate-ny/Logo"

import AvlMap from "components/AvlMap"
import conflationLayer_new from "./conflationLayerLRS/conflationLayer";

const SidebarHeader = ({}) =>
    <div style={ { paddingLeft: "50px" } }>Test</div>

const Landing = ({}) => {
    console.log('I ran')
    return (<div style={{height: "100vh"}}>
        <AvlMap layers={[
            conflation,
            conflation_LRS,
            //conflationLayer_new
        ]}
                header={SidebarHeader}
        />
    </div>)
}

export default {
  icon: 'icon-map',
  path: '/',
  name: 'AVAIL NPMRDS Analysis Tools',
  mainNav: false,
  menuSettings: {hide: true},
  component: Landing
}