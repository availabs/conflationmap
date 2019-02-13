
import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class Logo extends Component {
  render () {
    return (
      <div className="logo-w">
        <Link className="logo" to="/">
          <div className="logo-element" />
          <div className="logo-label">NPMRDS</div>
        </Link>
      </div>
    )
  }
}

class AvatarUser extends Component {
  render () {
    return (
      <div className="logged-user-w avatar-inline">
        <div className="logged-user-i">
          <div className="avatar-w" style={{border: 'none'}}><i style={{fontSize: 30}}className='pre-icon os-icon os-icon-user-male-circle' /></div>
          <div className="logged-user-info-w">
            <div className="logged-user-name">{this.props.user.displayName ? this.props.user.displayName : ''}</div>
            <div className="logged-user-role">{this.props.user.groups ? this.props.user.groups[0].displayName : ''}</div>
          </div>
          <div className="logged-user-toggler-arrow">
            <div className="os-icon os-icon-chevron-down" />
          </div>
          <div className="logged-user-menu color-style-bright">
            <div className="logged-user-avatar-info">
              <div className="avatar-w"><i style={{fontSize: 30, color: 'white'}}className='pre-icon os-icon os-icon-user-male-circle' /></div>
              <div className="logged-user-info-w">
                <div className="logged-user-name">{this.props.user.displayName ? this.props.user.displayName : ''}</div>
                <div className="logged-user-role">{this.props.user.groups ? this.props.user.groups[0].displayName : ''}</div>
              </div>
            </div>
            <div className="bg-icon"><i className="os-icon os-icon-wallet-loaded" /></div>
            <ul>
              <li><a href="/cms"><i className="os-icon os-icon-newspaper" /><span>Content Management</span></a></li>
              <li><a href="apps_email.html"><i className="os-icon os-icon-mail-01" /><span>Incoming Mail</span></a></li>
              <li><a href="users_profile_big.html"><i className="os-icon os-icon-user-male-circle2" /><span>Profile Details</span></a></li>
              <li><a href="/"><i className="os-icon os-icon-others-43" /><span>Notifications</span></a></li>
              <li><Link to="/logout"><i className="os-icon os-icon-signs-11" /><span>Logout</span></Link></li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

class LoginMenu extends Component {
  render () {
    return (
      <div className="menu-actions">
        <Link to={'/login'}>
          <div className="top-icon top-settings os-dropdown-trigger os-dropdown-position-right">
            <span className='loginMenu'>LOGIN </span>
            <i className='pre-icon os-icon os-icon-user-male-circle' />
          </div>
        </Link>
      </div>
    )
  }
}

class TopSearch extends Component {
  render () {
    return (
      <div className="element-search autosuggest-search-activator">
        <input placeholder="Start typing to search..." type="text" />
      </div>
    )
  }
}

class TopNav extends Component {
  render () {
    return (
      <span style={{width:'100%'}}>
        <Logo />
        <TopSearch />
        <LoginMenu />
        <AvatarUser />
      </span>
    )
  }
}

export default TopNav
export {
  Logo,
  TopSearch,
  LoginMenu,
  AvatarUser
}