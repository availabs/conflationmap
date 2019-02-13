import React from 'react'

export default (props) => (
  <div className="project-box" style={props.style || {}}>
    <div className="project-head">
      <div className="project-title">
        <h5>{props.title}</h5>
      </div>
    </div>
    <div className="project-info">
      {props.children}
    </div>
  </div>
)
