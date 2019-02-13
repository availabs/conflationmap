import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux';

import { login } from '../store/modules/user';


import './Login.css'

class Login extends Component {
  state = {
      isLoading: false,
      email: '',
      password: '',
      redirectToReferrer: false
  }
  
  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ isLoading: true });
    this.props.login(this.state);
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.isAuthenticated) {
      this.setState({ redirectToReferrer: true });
    } else {
      this.setState({ isLoading: false });
    }
  }

  render () {
    const { from } = this.props.location.state || { from: { pathname: "/" } };
    const { redirectToReferrer } = this.state;

    if (redirectToReferrer) {
      return <Redirect to={from} />;
    }

    return (

      	<div className="auth-box-w">
  		  <div className="logo-w">
  		    <a href="index.html"><img alt='' src="img/logo-big.png" /></a>
  		  </div>
  		  <h4 className="auth-header">Login</h4>
  		  <form onSubmit={this.handleSubmit}>
  		    <div className="form-group">
  		      <label htmlFor=''>Username</label>
  		      <input
              id="email"
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
              className="login-form-control"
              placeholder="Enter your username"
            />
  		      <div className="pre-icon os-icon os-icon-user-male-circle" />
  		    </div>
  		    <div className="form-group">
  		      <label htmlFor=''>Password</label>
  		      <input
              value={this.state.password}
              onChange={this.handleChange}
              id="password"
              type="password"
              className="login-form-control"
              placeholder="Enter your password"
            />
  		      <div className="pre-icon os-icon os-icon-fingerprint" />
  		    </div>
  		    <div className="buttons-w">
  		      <button className="btn btn-primary btn-lg btn-block" disabled={!this.validateForm()}>Log me in</button>
  		      {
  		      	this.state.isLoading ? 
  		      	(<div> Loading </div>) : ''
  		      }
  		    </div>
  		  </form>
  		</div>
     
    )
  }
}

const mapDispatchToProps = { login };

const mapStateToProps = state => {
  return {
    isAuthenticated: !!state.user.authed,
    attempts: state.user.attempts // so componentWillReceiveProps will get called.
  };
};
 
export default
{
  icon: 'icon-map',
  path: '/login',
  mainNav: false,

  component: connect(mapStateToProps, mapDispatchToProps)(Login),
  menuSettings: {hide: true}
}

  