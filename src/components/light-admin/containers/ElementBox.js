import React from 'react'

export default ({ children, title, desc , ...rest}) => {
	let titleOut = title ? (<h5 className="form-header">{title}</h5>) : ''
	let descOut = desc ? (<div className="form-desc">{desc}</div>) : ''
	return (
		<div className="element-box" {...rest}>
			{ titleOut }
		  	{ descOut }
	        { children }
	    </div>
	)
}