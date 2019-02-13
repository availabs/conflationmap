import { Model } from 'falcor'
import HttpDataSource from 'falcor-http-datasource'
import { FALCOR_HOST } from 'config'

class CustomSource extends HttpDataSource {
  onBeforeRequest (config) {
    // var token = ''
    // if (localStorage) {
    //   token = localStorage.getItem('token')
    // }
    // config.headers['Authorization'] = `${token}`
    // // console.log('header', config.headers)
    // config.url = config.url.replace(/%22/g, '%27')
    // // config.url = config.url.replace(/"/g, "'")
    // var splitUrl = config.url.split('?')
    // if (splitUrl[1] && config.method === 'GET') {
    //   // config.url = splitUrl[0] + '?' + encodeURI(splitUrl[1])
    //   delete config.headers
    // } else if (config.method === 'POST') {
    //   config.method = 'GET'
    //   delete config.headers
    //   config.url = config.url + '?' + config.data.replace(/%22/g, '%27')
    //   // console.log(config.url)
    // }
    // console.log('FR:', config)
  }
}

// function graphFromCache () {
//   let restoreGraph = {}
//   if (localStorage && localStorage.getItem('falcorCache')) {
//     let token = localStorage.getItem('token')
//     let user = localStorage.getItem('currentUser')
//     if (token && user) {
//       restoreGraph = JSON.parse(localStorage.getItem('falcorCache'))
//     }
//   }
//   return restoreGraph // {}
// }

export const falcorGraph = (function () {
  var storedGraph = {} // graphFromCache() // {};//JSON.parse(localStorage.getItem('falcorCache'))
  let model = new Model({
    source: new CustomSource(FALCOR_HOST + '/graph', {
      crossDomain: true,
      withCredentials: false,
      timeout: 0
    }),
    errorSelector: function (path, error) {
      console.log('errorSelector', path, error)
      return error
    },
    cache: storedGraph || {}
  }).batch()
  return model
})()

window.addEventListener('beforeunload', function (e) {
  var getCache = falcorGraph.getCache()
  console.log('windowUnload', getCache)
  localStorage.setItem('falcorCache', JSON.stringify(getCache))
})
