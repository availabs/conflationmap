import React from 'react';
import { connect } from 'react-redux';

import {
	SystemMessage,
	ConfirmMessage
} from "./SystemMessage"

import "./messages.css"

class SystemMessages extends React.Component {

	render() {
		return (
			!this.props.messages.length ? null :
			<div className="system-message-container">
				{
					this.props.messages.map((message, i) =>
						message.onConfirm ?
							<ConfirmMessage key={ message.id } top={ i * 75 } { ...message }/>
						: 	<SystemMessage key={ message.id } top={ i * 75 } { ...message }/>
					)
				}
			</div>
		)
	}
}

const mapStateToProps = state => ({
    messages: state.messages
})

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SystemMessages);