import React from 'react';
import { reduxFalcor } from 'utils/redux-falcor';

import MarkdownRenderer from 'react-markdown-renderer';

class CMS_BodyViewer extends React.Component {
	state = {
		error: null,
		body: ""
	}

	fetchFalcorDeps() {
		const { content_id } = this.props;
		return this.props.falcor.get(
			['content', 'byId', content_id, ["body"]]
		)
		.then(response => {
			try {
				const {
					body
				} = response.json.content.byId[content_id];
				this.setState({ error: null, body });
			}
			catch (e) {
				this.setState({ error: `Invalid content id: "${ content_id }"`, body: "" });
			}
			return response;
		})
	}

	render() {
		const {
			error,
			body
		} = this.state;
		const {
			maxHeight,
			content_id
		} = this.props;
		const style = {
			maxHeight: `${ maxHeight }px`,
			overflow: "auto"
		};
		return (
			!error ?
				<div style={ style } id={ content_id }>
					<MarkdownRenderer markdown={ body }
                  		options={ { html: true } }/>
				</div>
			:
				<div>{ `There was an error: ${ error }` }</div>
		)
	}
}

export default reduxFalcor(CMS_BodyViewer);