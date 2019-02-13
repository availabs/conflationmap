import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch } from 'react-router-dom';

import { ThemeProvider }  from 'styled-components';
import theme from 'components/common/themes/dark'

import { login } from './store/modules/user';
// comp
import Layout from './layouts/Layout'
import Routes from './routes'
import './App.css';

import Messages from "./components/messages"

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isAuthenticating: true
    }
  }

  componentWillMount() {
    if (typeof Storage !== 'undefined' && localStorage.getItem('user')) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        //console.log('===== App sent auth user request =====');
        this.setState({ isAuthenticating: true });
        this.props.login(user);
      } catch (err) {
       // console.log('there is an load auth error',err)
        this.setState({ isAuthenticating: false });
        localStorage.removeItem('user');
        console.error(err);
      }
    } else {
      this.setState({ isAuthenticating: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.attempts) {
      this.setState({ isAuthenticating: false });
    }
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <div className="all-wrapper solid-bg-all">
          <Switch>
          {
          	Routes.map((route,i) => {
              return (
    	    			<Layout
                  key = {i}
                  { ...route }
                  isAuthenticating = {this.state.isAuthenticating}
                  authed = { this.props.isAuthenticated }
                  router = {this.props.router}
                  user = {this.props.user}
                  menuSettings = { route.menuSettings ?  route.menuSettings  : {} }
                  routes={route.routes}
    	    				menus = { Routes } 
                  breadcrumbs = {route.breadcrumbs}
    	    			/>
    	    		)
  	    	  }) 
          }
          </Switch>
          <Messages />
        </div>
      </ThemeProvider>
    );
  }
}



const mapStateToProps = state => {
  return {
    isAuthenticated: !!state.user.authed,
    user: state.user,
    router: state.router
  };
};
 
export default connect(mapStateToProps, { login })(App);
