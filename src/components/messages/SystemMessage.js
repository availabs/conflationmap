import React from 'react';
import { connect } from 'react-redux';

import {
  dismissSystemMessage
} from 'store/modules/messages';

class SystemMessage extends React.Component {
	state = {
		show: "init"
	}
	componentDidMount() {
		setTimeout(this.setState.bind(this), 250, { show: "show" });
		if (this.props.duration) {
			setTimeout(this.dismiss.bind(this), this.props.duration);
		}
	}
	dismiss() {
		this.setState({ show: "hide" });
		setTimeout(this.props.dismissSystemMessage, 500, this.props.id);
		setTimeout(this.props.onDismiss, 500);
	}
	render() {
		return (
			<div className={ `alert-${ this.props.type } system-message ${ this.state.show }` }
				style={ { top: this.props.top } }>
				<span>{ this.props.message }</span>
				<button className="close" onClick={ this.dismiss.bind(this) }>
					<span className="os-icon os-icon-arrow-right3"/>
				</button>
			</div>
		)
	}
}

const mapStateToProps1 = state => ({})

const mapDispatchToProps1 = {
  dismissSystemMessage
};

const ConnectedSystemMessage = connect(mapStateToProps1, mapDispatchToProps1)(SystemMessage);
export { ConnectedSystemMessage as SystemMessage }

class ConfirmMessage extends SystemMessage {
	dismiss() {
		this.setState({ show: "hide" });
		setTimeout(this.props.dismissSystemMessage, 500, this.props.id);
	}
	confirm() {
		this.setState({ show: "hide" });
		setTimeout(this.props.dismissSystemMessage, 500, this.props.id);
		setTimeout(this.props.onConfirm, 500);
	}
	render() {
		return (
			<div className={ `alert-${ this.props.type } system-message confirm-message ${ this.state.show }` }
				style={ { top: this.props.top } }>
				<span>{ this.props.message }</span>
				<button className="btn btn-primary" onClick={ this.dismiss.bind(this) }>
					Dismiss
				</button>
				<button className="btn btn-success" onClick={ this.confirm.bind(this) }>
					Confirm
				</button>
			</div>
		)
	}
}

const mapStateToProps2 = state => ({})

const mapDispatchToProps2 = {
  dismissSystemMessage
};

const ConnectedConfirmMessage = connect(mapStateToProps2, mapDispatchToProps2)(ConfirmMessage);
export { ConnectedConfirmMessage as ConfirmMessage }