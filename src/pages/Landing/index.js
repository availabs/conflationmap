import React, { Component } from 'react';
import conflation from './conflationLayer/conflation.js'


// import Logo from "components/mitigate-ny/Logo"

import AvlMap from "components/AvlMap"

const SidebarHeader = ({}) =>
    <div style={ { paddingLeft: "50px" } }>Test</div>

const Landing = ({}) => {
    console.log('I ran')
    return (<div style={{height: "100vh"}}>
        <AvlMap layers={[
            conflation
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