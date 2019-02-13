import debounce from 'lodash.debounce';

import {
  createNewMapboxGLMap,
  filterGeography,
  getSelectedTmcs,
  colorTmcs,
  uncolorTmcs,
  updateColors,
  widenFocusedTmc,
  zoomToBoundingBox,
  addMapClickListener,
  removeMapClickListener,
  addTmcHoverListener,
  removeTmcHoverListener
} from './map_functions';

export default class MacroViewMap {
  constructor({ containerId }) {
    const that = {
      map: createNewMapboxGLMap(containerId),
      tmcHoverEnterListeners: new Map(),
      tmcHoverLeaveListeners: new Map()
    };

    this.filterGeography = filterGeography.bind(that);
    this.getSelectedTmcs = getSelectedTmcs.bind(that);
    this.colorTmcs = colorTmcs.bind(that);
    this.uncolorTmcs = uncolorTmcs.bind(that);
    this.updateColors = debounce(updateColors.bind(that), 250, {
      trailing: true
    });
    this.widenFocusedTmc = debounce(widenFocusedTmc.bind(that), 200);
    this.zoomToBoundingBox = zoomToBoundingBox.bind(that);
    this.addMapClickListener = addMapClickListener.bind(that);
    this.removeMapClickListener = removeMapClickListener.bind(that);
    this.addTmcHoverListener = addTmcHoverListener.bind(that);
    this.removeTmcHoverListener = removeTmcHoverListener.bind(that);
  }
}
