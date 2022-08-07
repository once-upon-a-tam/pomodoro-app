import { notifyTimerEnded, requestNotificationPermission } from './src/lib/notifications';
import { getUserPreferences, saveUserPreferences } from './src/lib/userPreferences';

const button = document.querySelector('#timer > button');
const buttonLabel = button.querySelector("#timer-button-label");
const progressRing = document.getElementById('progress-ring');
const progressRingWrapper = document.getElementById('progress-ring-wrapper');
const timeIndicator = document.querySelector('#timer > button > time');

const timerTypeInputs = document.querySelectorAll('input[name="timer-type"]');

const settingsButton = document.getElementById('settings-dialog-toggle');
const settingsDialog = document.getElementById('settings-dialog');
const settingsForm = settingsDialog.querySelector('form');
const closeDialogButton = document.getElementById('close-dialog');

const timerTypeValues = new Map([
	['pomodoro', 'pomodoro'],
	['short-break', 'shortBreak'],
	['long-break', 'longBreak'],
]);

/**
 * @var
 * @name userPreferences
 */
const userPreferences = getUserPreferences();

let isTimerActive = false;

// Checks the timer type radio button linked to the selected timer type.
[...timerTypeInputs].find((element) => timerTypeValues.get(element.value) === userPreferences.selectedTimerType).checked = true;

let remainingTime = userPreferences.defaultTimerTime[userPreferences.selectedTimerType];

let progressRingCircumference = null;

/**
 * @function
 * @name initialiseProgressRing
 * @description Initialises the progress ring.
 *
 * @author Tam
 */
const initialiseProgressRing = () => {
	progressRing.r.baseVal.value = button.getBoundingClientRect().width * 0.40;
	progressRingWrapper.r.baseVal.value = button.getBoundingClientRect().width * 0.42;
	
	const progressRingRadius = progressRing.r.baseVal.value;
	progressRingCircumference = progressRingRadius * 2 * Math.PI;
	
	progressRing.style.strokeDasharray = `${progressRingCircumference} ${progressRingCircumference}`;
	progressRing.style.strokeDashoffset = `${progressRingCircumference}`;

	progressRing.style.strokeDashoffset = 0;
}

/**
 * @function
 * @name updateProgressRing
 * @description Updates the progress ring with the given percentage.
 *
 * @param {number} percent The progress percentage.
 */
const updateProgressRing = (percent) => {
	if (progressRingCircumference === null) {
		initialiseProgressRing();
	}

	const offset = progressRingCircumference - percent / 100 * progressRingCircumference;
	progressRing.style.strokeDashoffset = offset;
}

/**
 * @function
 * @name updateTimeIndicator
 * @description Updates the time indicator with the remaining time, formatted in MM:SS.
 *
 * @author Tam
 *
 * @param {number} remainingTime The remaining time in seconds.
 */
function updateTimeIndicator (remainingTime) {
	let minutes = parseInt(remainingTime / 60, 10).toString().padStart(2, '0');
	let seconds = parseInt(remainingTime % 60, 10).toString().padStart(2, '0');

	timeIndicator.firstElementChild.innerText = minutes;
	timeIndicator.lastElementChild.innerText = seconds;
}

let intervalId;
let timeoutId;

/**
 * @function
 * @name updateTimer
 * @description The method to use every second to refresh the timer's UI.
 *
 * @author Tam
 */
const updateTimer = () => {
	updateProgressRing(remainingTime / userPreferences.defaultTimerTime[userPreferences.selectedTimerType] * 100);
	updateTimeIndicator(remainingTime);
	remainingTime--;
}

/**
 * @function
 * @name startTimer
 * @description Starts the timer.
 *
 * @author Tam
 */
const startTimer = () => {
	isTimerActive = true;
	buttonLabel.innerText = "Pause";
	updateTimer();

	intervalId = setInterval(() => {
		updateTimer();
	}, 1000);

	timeoutId = setTimeout(() => {
	resetTimer();
	notifyTimerEnded();
	}, userPreferences.defaultTimerTime[userPreferences.selectedTimerType] * 1000);
}

/**
 * @function
 * @name pauseTimer
 * @description Pauses the timer.
 *
 * @author Tam
 */
const pauseTimer = () => {
	isTimerActive = false;
	buttonLabel.innerText = "Resume";
	clearInterval(intervalId);
	clearTimeout(timeoutId);
}

/**
 * @function
 * @name resetTimer
 * @description Resets the remaining time and restarts the timer.
 * 
 * @author Tam
 */
const resetTimer = () => {
	buttonLabel.innerText = "Start";
	clearInterval(intervalId);
	clearTimeout(timeoutId);
	remainingTime = userPreferences.defaultTimerTime[userPreferences.selectedTimerType];
	updateProgressRing(100);
	updateTimeIndicator(remainingTime);
}

/**
 * @function
 * @name restartTimer
 * @description Restarts the timer after resetting it.
 * 
 * @author Tam
 */
 const restartTimer = () => {
	resetTimer();
	startTimer();
}

/**
 * @function
 * @name onTimerButtonClick
 * @description Handles the click event on the timer button.
 *
 * @author Tam
 */
const onTimerButtonClick = () => {
	if (!isTimerActive && remainingTime > 0) {
		startTimer();
	} else if (!isTimerActive && remainingTime === 0) {
		restartTimer();
	} else {
		pauseTimer();
	}
}

/**
 * @function
 * @name processFormData
 * @description Extracts data from the provided form.
 *
 * @author Tam
 *
 * @param {HTMLElement} form The form to extract data from.
 *
 * @returns {object}
 */
const processFormData = (form) => {
	const font = [...form.querySelectorAll('input[type="radio"][name="font"]')]
		.find((input) => input.checked)
		.value;

	const accentColor = [...form.querySelectorAll('input[type="radio"][name="accent-color"]')]
		.find((input) => input.checked)
		.value;

	const formData = {
		pomodoro: form.querySelector('#pomodoro-time-input').value,
		shortBreak: form.querySelector('#pomodoro-short-break-input').value,
		longBreak: form.querySelector('#pomodoro-long-break-input').value,
		font,
		accentColor: `--clr-${accentColor}`,
	};

	return formData;
}

/**
 * @function
 * @name initializeSettingsForm
 * @description Initialises the settings form.
 *
 * @author Tam
 */
const initializeSettingsForm = () => {
	const { pomodoro, shortBreak, longBreak } = userPreferences.defaultTimerTime;

	document.getElementById('pomodoro-time-input').value = pomodoro / 60;
	document.getElementById('pomodoro-short-break-input').value = shortBreak / 60;
	document.getElementById('pomodoro-long-break-input').value = longBreak / 60;
}

/**
 * @function
 * @name onSettingsFormSubmit
 * @description Handles the submit event on the settings form.
 *
 * @param {*} event
 */
const onSettingsFormSubmit = (event) => {
	const { pomodoro, shortBreak, longBreak, font, accentColor } = processFormData(event.target);

	userPreferences.defaultTimerTime = {
		pomodoro: pomodoro * 60,
		shortBreak: shortBreak * 60,
		longBreak: longBreak * 60,
	};	
	userPreferences.font = font;
	userPreferences.accentColor = accentColor;

	saveUserPreferences(userPreferences);

	document.querySelector(':root').style.setProperty('--font', userPreferences.font);
	document.querySelector(':root').style.setProperty('--clr-accent', `var(${userPreferences.accentColor})`);

	resetTimer();
};

/**
 * @function
 * @name onTimerTypeInputChange
 * @description Handles the change event on the timer type input.
 *
 * @author Tam
 *
 * @param {string} value The selected timer type.
 */
const onTimerTypeChange = ({ target: { value } }) => {
	if (!timerTypeValues.has(value)) {
		return;
	}

	userPreferences.selectedTimerType = timerTypeValues.get(value);
	saveUserPreferences(userPreferences);
	resetTimer();
};

button.addEventListener('click', function() {
	onTimerButtonClick();
});

timerTypeInputs.forEach((input) => input.addEventListener('change', function(e) {
	onTimerTypeChange(e);
}));

settingsButton.addEventListener('click', function() {
	settingsDialog.showModal();
});

closeDialogButton.addEventListener('click', function() {
	settingsDialog.close();
});

settingsForm.addEventListener('submit', function(e) {
	onSettingsFormSubmit(e);
});


initialiseProgressRing();
updateTimeIndicator(remainingTime);
initializeSettingsForm();
requestNotificationPermission();