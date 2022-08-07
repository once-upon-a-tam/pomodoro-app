const defaultUserPreferences = {
	defaultTimerTime: {
		pomodoro: 1200,
		shortBreak: 300,
		longBreak: 600,
	},
	selectedTimerType: 'pomodoro',
	font: 'Kumbh Sans',
	accentColor: '--clr-red',
};

/**
 * @function
 * @name setUserPreferences
 * @description Saves the user preferences in local storage.
 *
 * @author Tam
 *
 * @param {object} userPreferences The user preferences to save.
 */
const saveUserPreferences = (userPreferences) => {
	window.localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
}

/**
 * @function
 * @name getUserPreferences
 * @description Returns the user preferences from the local storage or a default value if none is found.
 *
 * @author Tam
 *
 * @return {object} The user preferences.
 */
const getUserPreferences = () => {
	const userPreferences = window.localStorage.getItem('userPreferences');

	return userPreferences ? JSON.parse(userPreferences) : defaultUserPreferences;
}

export {
	saveUserPreferences,
	getUserPreferences,
};
