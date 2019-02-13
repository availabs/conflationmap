import React from 'react';

// import Logo from "components/mitigate-ny/Logo"

import AvlMap from "components/AvlMap"

import NPMRDSLayer from "./layers/npmrds"
import Pm3Layer from "./layers/npmrds/pm3"
import IncidentsLayer from "./layers/incidentsLayer"
import transcomLayer from "./layers/transcomLayer"

const SidebarHeader = ({}) =>
  <div style={ { paddingLeft: "50px" } }>Test</div>

const MapPage = ({}) =>
  <div style={ { height: "100vh" } }>
    <AvlMap layers={ [
        NPMRDSLayer,
        IncidentsLayer,
        Pm3Layer,
        transcomLayer
      ]}
      header={ SidebarHeader }
      style={ 'mapbox://styles/am3081/cjlpipjg47q7u2rmrmyo39x78' }
    />
  </div>

export default {
	icon: 'os-icon-map',
	path: '/nat',
	exact: true,
	mainNav: true,
  menuSettings: {
    display: 'none',
    image: 'none',
    scheme: 'color-scheme-dark', 
    position: 'menu-position-left',
    layout: 'menu-layout-mini',
    style: 'color-style-default'  
  },
  name: 'Network Analysis Tools',
	auth: false,
	component: MapPage
}