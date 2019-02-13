import { MAPBOX_TOKEN } from 'store/config';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';

import getTMCColorsFromData from 'utils/getTMCColorsFromData';

export const addNPMRDSLayers = map => {
  let interstateLayer = {
    id: 'interstate-symbology',
    type: 'line',
    source: 'npmrds',
    'source-layer': 'tmcsAttrs',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      // 'line-color': ['get', ['to-string', ['get', 'tmc']], ['literal', colors]],
      'line-color': 'white',
      'line-width': {
        base: 1.5,
        stops: [[3, 1], [13, 5], [18, 8]]
      },
      'line-offset': {
        base: 1.5,
        stops: [[5, 0], [9, 1], [15, 3], [18, 7]]
      }
    },
    filter: ['all', ['in', 'f_system', 1, 2]]
  };

  let primaryLayer = {
    id: 'primary-symbology',
    type: 'line',
    source: 'npmrds',
    'source-layer': 'tmcsAttrs',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': 'white',
      'line-width': {
        base: 1.5,
        stops: [[5, 1], [18, 7]]
      },
      'line-offset': {
        base: 1.5,
        stops: [[10, 0.5], [18, 10]]
      }
    },
    filter: ['all', ['!in', 'f_system', 1, 2]]
  };

  map.addLayer(primaryLayer, 'waterway-label');
  map.addLayer(interstateLayer, 'waterway-label');

  // https://www.mapbox.com/mapbox-gl-js/example/popup-on-hover
  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  const enterFn = e => {
    if (e.features && e.features.length) {
      const [{ properties: { tmc = null } } = {}] = e.features;
      if (tmc) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        popup
          .setLngLat(e.lngLat)
          .setHTML(tmc)
          .addTo(map);
      }
    }
  };

  const leaveFn = () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  };

  map.on('mouseenter', 'primary-symbology', enterFn);
  map.on('mouseleave', 'primary-symbology', leaveFn);

  map.on('mouseenter', 'interstate-symbology', enterFn);
  map.on('mouseleave', 'interstate-symbology', leaveFn);
};

export function addMapClickListener(onClick) {
  const { map } = this;
  map.on('click', onClick);
}

export function removeMapClickListener(onClick) {
  const { map } = this;
  map.off('click', onClick);
}

export function addTmcHoverListener(setHoveredTmc) {
  // The purpose of the tmcHoverListeners Map is to allow enter listeners to
  //   be added and removed while at the same time abstracting away
  //   the data structure of Mapbox events.
  const { map, tmcHoverEnterListeners, tmcHoverLeaveListeners } = this;

  if (!setHoveredTmc) {
    return;
  }

  if (tmcHoverEnterListeners.has(setHoveredTmc)) {
    console.error('addTmcHoverListeners is idempotent for listener functions');
    return;
  }

  // Wrap the enterListener so that its parameter is simply the hovered TMC
  const enterFn = e => {
    if (e.features && e.features.length) {
      const [{ properties: { tmc = null } } = {}] = e.features;
      setHoveredTmc(tmc);
    }
  };

  // Keep track of the wrapped function for the passed enterListener
  tmcHoverEnterListeners.set(setHoveredTmc, enterFn);

  map.on('mouseenter', 'primary-symbology', enterFn);
  map.on('mouseenter', 'interstate-symbology', enterFn);

  // Wrap the listerner so that it's called with null when leaving a tmc
  const leaveFn = () => setHoveredTmc(null);

  // Keep track of the wrapped function for the passed enterListener
  tmcHoverLeaveListeners.set(setHoveredTmc, leaveFn);

  map.on('mouseleave', 'primary-symbology', leaveFn);
  map.on('mouseleave', 'interstate-symbology', leaveFn);
}

export function removeTmcHoverListener(setHoveredTmc) {
  // The purpose of the tmcHoverListeners Map is to allow enter listeners to
  //   be added and removed while at the same time abstracting away
  //   the data structure of Mapbox events.
  const { map, tmcHoverEnterListeners, tmcHoverLeaveListeners } = this;

  if (!setHoveredTmc) {
    return;
  }

  const enterFn = tmcHoverEnterListeners.get(setHoveredTmc);

  if (enterFn) {
    map.off('mouseenter', 'primary-symbology', enterFn);
    map.off('mouseenter', 'interstate-symbology', enterFn);
  }

  const leaveFn = tmcHoverLeaveListeners.get(setHoveredTmc);

  if (leaveFn) {
    map.on('mouseleave', 'primary-symbology', leaveFn);
    map.on('mouseleave', 'interstate-symbology', leaveFn);
  }
}

const geoFilterToMapboxClauses = geoFilter => {
  console.log('geoFilter', geoFilter)
  const mapboxClauses =
    geoFilter &&
    Object.keys(geoFilter).reduce((acc, geoLevel) => {
      if (!(Array.isArray(geoFilter[geoLevel]) && geoFilter[geoLevel].length)) {
        return acc;
      }

      acc.push(...geoFilter[geoLevel].map(geoid => ['in', geoLevel, geoid]));
      return acc;
    }, []);

  return Array.isArray(mapboxClauses) && mapboxClauses.length
    ? mapboxClauses
    : null;
};

export const createNewMapboxGLMap = containerId => {
  mapboxgl.accessToken = MAPBOX_TOKEN;

  const map = new mapboxgl.Map({
    container: containerId,
    style: 'mapbox://styles/am3081/cjmv42jae08mb2so83hdks8nb',
    center: [-73.979531, 40.7587],
    minZoom: 2,
    zoom: 12
  });

  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

  map.on('load', () => {
    map.addSource('npmrds', {
      type: 'vector',
      url: 'mapbox://am3081.2yitmtuu'
    });

    addNPMRDSLayers(map);
    filterGeography.call({ map });
  });

  return map;
};

export function zoomToBoundingBox(boundingBox) {
  if (!boundingBox) {
    return;
  }

  const { map } = this;
  map.fitBounds(boundingBox);
}

// Becomes a method of the MacroViewMap instance using bind.
export function filterGeography(geoFilter, boundingBox) {
  const { map } = this;
  this.geoFilter = geoFilter;

  const mapboxClauses = geoFilterToMapboxClauses(geoFilter);
  console.log('mapboxClauses', mapboxClauses)

  return new Promise(resolve => {
    if (mapboxClauses) {
      if (boundingBox) {
        map.fitBounds(boundingBox);
      }
      const listener = () => {
        // if (map.areTilesLoaded() && map.isStyleLoaded()) {
        const primaryLayer = map.getLayer('primary-symbology');
        const interstateLayer = map.getLayer('interstate-symbology');
        if (
          primaryLayer &&
          interstateLayer &&
          map.loaded() &&
          map.isStyleLoaded() &&
          map.areTilesLoaded()
        ) {
          map.off('render', listener);
          map.setLayoutProperty('primary-symbology', 'visibility', 'visible');
          map.setLayoutProperty(
            'interstate-symbology',
            'visibility',
            'visible'
          );

          const mapboxFilter = [
            'all',
            ['in', '$type', 'LineString'],
            ['any', ...mapboxClauses]
          ];

          mapboxFilter[3] = ['all', ['!in', 'f_system', 1, 2]];
          map.setFilter('primary-symbology', mapboxFilter);
          mapboxFilter[3] = ['all', ['in', 'f_system', 1, 2]];
          map.setFilter('interstate-symbology', mapboxFilter);

          resolve();
        }
      };

      // map.on('style.load', listener);
      map.on('render', listener);
    } else {
      map.setLayoutProperty('primary-symbology', 'visibility', 'none');
      map.setLayoutProperty('interstate-symbology', 'visibility', 'none');
      resolve();
    }
  });
}

function queryMapForSelectedTmcs(map, mapboxClauses) {
  const mapboxFilter = ['any', ...mapboxClauses];

  const d = map.querySourceFeatures('npmrds', {
    filter: mapboxFilter,
    sourceLayer: 'tmcsAttrs'
  });

  const tmcs = d.map(({ properties: { tmc } }) => tmc);
  return [...new Set(tmcs)];
}

export function getSelectedTmcs() {
  const { map, geoFilter } = this;

  const mapboxClauses = geoFilterToMapboxClauses(geoFilter);

  // TODO: The following is not immune to race conditions.
  //       It depends on a render event firing.
  //       A simple "work-around" at this point would be
  //         for the user to "shake" the map a bit.
  //       Not sure how to make completely bullet-proof.
  return !mapboxClauses
    ? Promise.resolve(null)
    : new Promise(resolve => {
        const listener = () => {
          if (
            !(map.isMoving() || map.isZooming() || map.isRotating()) &&
            map.areTilesLoaded()
          ) {
            map.off('render', listener);
            resolve(queryMapForSelectedTmcs(map, mapboxClauses));
          }
        };
        map.on('render', listener);
      });
}

export function widenFocusedTmc(selectedTmcs, focusedTmc) {
  const { map } = this;

  return new Promise(resolve => {
    if (!selectedTmcs) {
      return resolve;
    }

    const widths = selectedTmcs.reduce((acc, tmc) => {
      acc[tmc] = tmc === focusedTmc ? 30 : 2.5;
      return acc;
    }, {});

    const listener = () => {
      // if (map.areTilesLoaded() && map.isStyleLoaded()) {
      if (map.loaded()) {
        const primaryLayer = map.getLayer('primary-symbology');
        const interstateLayer = map.getLayer('interstate-symbology');
        if (primaryLayer && interstateLayer) {
          clearInterval(interval);
          map.setPaintProperty('interstate-symbology', 'line-width', [
            'get',
            ['to-string', ['get', 'tmc']],
            ['literal', widths]
          ]);
          map.setPaintProperty('primary-symbology', 'line-width', [
            'get',
            ['to-string', ['get', 'tmc']],
            ['literal', widths]
          ]);

          const foc = selectedTmcs.reduce((acc, tmc) => {
            acc[tmc] = tmc === focusedTmc ? 15 : 0;
            return acc;
          }, {});

          map.setPaintProperty('interstate-symbology', 'line-blur', [
            'get',
            ['to-string', ['get', 'tmc']],
            ['literal', foc]
          ]);
          map.setPaintProperty('primary-symbology', 'line-blur', [
            'get',
            ['to-string', ['get', 'tmc']],
            ['literal', foc]
          ]);
        }

        return resolve();
      }
    };

    // map.on('style.load', listener);
    const interval = setInterval(listener, 200);
  });
}

export function updateColors(
  selectedTmcs,
  activeTmcsData = {},
  activeTmcsDataDomain = [],
  tmcColors
) {
  const { map } = this;

  const colors =
    tmcColors || getTMCColorsFromData(activeTmcsData, activeTmcsDataDomain);

  if (selectedTmcs) {
    selectedTmcs.forEach(tmc => {
      if (activeTmcsData[tmc] === undefined) {
        colors[tmc] = 'rgba(0, 0, 0, 0)';
      }
    });
  }

  const listener = () => {
    // if (map.areTilesLoaded() && map.isStyleLoaded()) {
    if (map.loaded()) {
      const primaryLayer = map.getLayer('primary-symbology');
      const interstateLayer = map.getLayer('interstate-symbology');
      if (primaryLayer && interstateLayer) {
        clearInterval(interval);
        map.setPaintProperty('interstate-symbology', 'line-color', [
          'get',
          ['to-string', ['get', 'tmc']],
          ['literal', colors]
        ]);
        map.setPaintProperty('primary-symbology', 'line-color', [
          'get',
          ['to-string', ['get', 'tmc']],
          ['literal', colors]
        ]);
      }
    }
  };

  // map.on('style.load', listener);
  const interval = setInterval(listener, 200);
}

export function colorTmcs(activeTmcsData, activeTmcsDataDomain, tmcColors) {
  const { map } = this;

  if (
    !(
      Object.keys(activeTmcsData || {}).length &&
      Array.isArray(activeTmcsDataDomain) &&
      activeTmcsDataDomain.length
    )
  ) {
    return;
  }

  const colors =
    tmcColors || getTMCColorsFromData(activeTmcsData, activeTmcsDataDomain);

  map.setPaintProperty('interstate-symbology', 'line-color', [
    'get',
    ['to-string', ['get', 'tmc']],
    ['literal', colors]
  ]);
  map.setPaintProperty('primary-symbology', 'line-color', [
    'get',
    ['to-string', ['get', 'tmc']],
    ['literal', colors]
  ]);
}

export function uncolorTmcs(selectedTmcs) {
  if (!selectedTmcs) {
    return;
  }
  const { map } = this;

  const colors = selectedTmcs.reduce((acc, tmc) => {
    acc[tmc] = 'white';
    return acc;
  }, {});

  map.setPaintProperty('interstate-symbology', 'line-color', [
    'get',
    ['to-string', ['get', 'tmc']],
    ['literal', colors]
  ]);
  map.setPaintProperty('primary-symbology', 'line-color', [
    'get',
    ['to-string', ['get', 'tmc']],
    ['literal', colors]
  ]);
}
