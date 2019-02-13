import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux';

import { logout } from '../store/modules/user';


class Logout extends Component {
  state = {}  

  componentWillMount(nextProps) {
    this.props.logout()
  }

  render () {
    const { from } = this.props.location.state || { from: { pathname: "/" } };
    
    return <Redirect to={from} />;
  }
}

const mapDispatchToProps = { logout };

const mapStateToProps = state => {
  return {
    isAuthenticated: !!state.user.authed,
    attempts: state.user.attempts // so componentWillReceiveProps will get called.
  };
};
 
export default
{
  path: '/logout',
  mainNav: false,
  component: connect(mapStateToProps, mapDispatchToProps)(Logout)
}

  