const ADD_ACTIVE_FILTER = "ADD_ACTIVE_FILTER",
	REMOVE_ACTIVE_FILTER = "REMOVE_ACTIVE_FILTER",
	TOGGLE_ACTIVE_FILTER = "TOGGLE_ACTIVE_FILTER",
	SET_CONTENT_FILTERS = "SET_CONTENT_FILTERS",

	RECEIVE_CONTENT = "RECEIVE_CONTENT",

	SET_EDIT_TARGET = "SET_EDIT_TARGET",

	UPDATE_NEW_CONTENT_DATA = "UPDATE_NEW_CONTENT_DATA";

export const addActiveFilter = filter =>
	dispatch => (
		dispatch({
			type: ADD_ACTIVE_FILTER,
			filter
		}), Promise.resolve())

export const removeActiveFilter = filter =>
	dispatch =>
		(dispatch({
			type: REMOVE_ACTIVE_FILTER,
			filter
		}),
		Promise.resolve())
export const toggleActiveFilter = filter =>
	dispatch =>
		(dispatch({
			type: TOGGLE_ACTIVE_FILTER,
			filter
		}),
		Promise.resolve())

export const receiveContent = content =>
	dispatch =>
		(dispatch({
			type: RECEIVE_CONTENT,
			content
		}),
		Promise.resolve())

export const setContentFilters = filters =>
	dispatch =>
		(dispatch({
			type: SET_CONTENT_FILTERS,
			filters
		}),
		Promise.resolve())

export const setEditTarget = target =>
	dispatch =>
		(dispatch({
			type: SET_EDIT_TARGET,
			target
		}),
		Promise.resolve())
export const updateNewContentData = update =>
	dispatch =>
		(dispatch({
			type: UPDATE_NEW_CONTENT_DATA,
			update
		}),
		Promise.resolve())

const INITIAL_STATE = {
	contentFilters: [],
	activeFilters: [],
	content: [],
	newContentData: {
		content_id: "",
		new_content_id: "",
		attributes: {},
		body: "",
		isEditTarget: false
	}
}

export default (state=INITIAL_STATE, action) => {
	// console.log("<CMS>",state,action);
	switch (action.type) {
		case ADD_ACTIVE_FILTER: {
			const newState = Object.assign({}, state);
			newState.activeFilters.push(action.filter);
			return newState;
		}
		case REMOVE_ACTIVE_FILTER: {
			const newState = Object.assign({}, state);
			newState.activeFilters = newState.activeFilters.filter(f => f !== action.filter);
			return newState;
		}
		case TOGGLE_ACTIVE_FILTER: {
			let newState = Object.assign({}, state);
			if (newState.activeFilters.includes(action.filter)) {
				newState.activeFilters = newState.activeFilters.filter(filter => filter !== action.filter);
			}
			else {
				newState.activeFilters.push(action.filter);
			}
			return newState;
		}
		case RECEIVE_CONTENT:
			return Object.assign({}, state, { content: action.content });
		case SET_CONTENT_FILTERS:
			return Object.assign({}, state, { contentFilters: action.filters });
		case SET_EDIT_TARGET: {
			let newState = Object.assign({}, state);
			newState.newContentData = {
				...newState.newContentData,
				...action.target,
				isEditTarget: true,
				new_content_id: action.target.content_id
			}
			return newState;
		}
		case UPDATE_NEW_CONTENT_DATA: {
			let newState = Object.assign({}, state);
			newState.newContentData = {
				...newState.newContentData,
				...action.update
			}
			return newState;
		}
		default:
			return state;
	}
}