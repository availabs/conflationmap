export const sources =  [
	{   
	  id: 'npmrds',
	  source: {
	    type: 'vector',
	    url: 'mapbox://am3081.2yitmtuu'
	  }
	}
]

export const layers = [
    {
        id: 'interstate-symbology-select',
        type: 'line',
        source: 'npmrds',
        'source-layer': 'tmcsAttrs',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ccc',
          'line-width': {
            base: 1.5,
            stops: [[3, 5], [13, 10], [18, 23]]
          },
          'line-offset': {
            base: 1.5,
            stops: [[5, 0], [9, 1], [15, 3], [18, 7]]
          }
        },
        filter: ['all', ['in', 'f_system', 1, 2], ['in','tmc','']]
      },
      {
        id: 'primary-symbology-select',
        type: 'line',
        source: 'npmrds',
        'source-layer': 'tmcsAttrs',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ccc',
          'line-width': {
            base: 1.5,
            stops: [[5, 5], [18, 13]]
          },
          'line-offset': {
            base: 1.5,
            stops: [[10, 0.5], [18, 10]]
          }
        },
        filter: ['all', ['!in', 'f_system', 1, 2],['in','tmc','']]
    },
    {
        id: 'interstate-symbology',
        type: 'line',
        source: 'npmrds',
        'source-layer': 'tmcsAttrs',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#566881',
          'line-width': {
            base: 1.5,
            stops: [[3, 1], [13, 8], [18, 19]]
          },
          'line-offset': {
            base: 1.5,
            stops: [[5, 0], [9, 1], [15, 2], [18, 4]]
          }
        },
        filter: ['all', ['in', 'f_system', 1, 2]]
      },
      {
        id: 'primary-symbology',
        type: 'line',
        source: 'npmrds',
        'source-layer': 'tmcsAttrs',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#303339',
          'line-width': {
            base: 1.5,
            stops: [[5, 1], [18, 10]]
          },
          'line-offset': {
            base: 1.5,
            stops: [[10, 0.5], [18, 10]]
          }
        },
        filter: ['all', ['!in', 'f_system', 1, 2]]
    }
]