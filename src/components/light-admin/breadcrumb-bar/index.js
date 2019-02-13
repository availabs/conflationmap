import React from 'react'
import { Link } from 'react-router-dom'

export default (props) => {
	if(!props.layout) return null
	let crumbs = props.layout.map((crumb,i) => {
		if(crumb.name){
			return (
				<li key={i} className="breadcrumb-item">
					<Link to={crumb.path}>{crumb.name}</Link>
				</li>
			)
		}
		else if( crumb.param && props.match.params[crumb.param] ) {
			return (
				<li key={i} className="breadcrumb-item">
					<Link to={`${crumb.path}${props.match.params[crumb.param]}`}>{props.match.params[crumb.param]}</Link>
				</li>
			)
		}
		return false
	})
	.filter(d => d)
	
	return (
	  <ul className="breadcrumb">
	  	{crumbs}
	  </ul>
	)
}
