const SET_CURRENT_POPULATION_YEAR = "SET_CURRENT_POPULATION_YEAR"

export const setCurrrentPopulationYear = year =>
  	dispatch => {
	    dispatch(_setCurrrentPopulationYear(year));
	    return Promise.resolve();
  	}

const _setCurrrentPopulationYear = year => ({
	type: SET_CURRENT_POPULATION_YEAR,
	year
})

const INITIAL_STATE = {
	currentPopulationYear: 2016
}

export default (state=INITIAL_STATE, action) => {
	switch (action.type) {
		case SET_CURRENT_POPULATION_YEAR:
			return Object.assign({}, state, { currentPopulationYear: action.year });
		default:
			return state;
	}
}