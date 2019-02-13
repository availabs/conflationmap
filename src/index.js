import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import { FalcorProvider } from 'utils/redux-falcor'
import { falcorGraph } from 'store/falcorGraph'

import store, { history } from './store'
import App from './App';

// import registerServiceWorker from './registerServiceWorker';
// https://github.com/facebook/create-react-app/issues/2715#issuecomment-313171863
import { unregister } from './registerServiceWorker';
unregister();

ReactDOM.render(
  <Provider store={store}>
  	<FalcorProvider store={store} falcor={falcorGraph}>
	    <ConnectedRouter history={history}>
	     	<App />
	    </ConnectedRouter>
	</FalcorProvider>
  </Provider>,
  document.getElementById('root')
)

// registerServiceWorker();
