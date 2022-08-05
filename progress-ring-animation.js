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

progressRing.r.baseVal.value = button.getBoundingClientRect().width * 0.40;
progressRingWrapper.r.baseVal.value = button.getBoundingClientRect().width * 0.42;

const progressRingRadius = progressRing.r.baseVal.value;
const progressRingCircumference = progressRingRadius * 2 * Math.PI;

progressRing.style.strokeDasharray = `${progressRingCircumference} ${progressRingCircumference}`;
progressRing.style.strokeDashoffset = `${progressRingCircumference}`;

const settings = {
	pomodoroTime: 1200,
	shortBreakTime: 300,
	longBreakTime: 600,
};

let isTimerActive = false;
let selectedTimerType = 'pomodoro';
timerTypeInputs[0].checked = true;
let timerRefreshId;
let remainingTime = settings.pomodoroTime;

/**
 * @function
 * @name updateProgressRing
 * @description Updates the progress ring with the given percentage.
 *
 * @param {number} percent The progress percentage.
 */
function updateProgressRing(percent) {
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
	let minutes = parseInt(remainingTime / 60, 10)
	let seconds = parseInt(remainingTime % 60, 10)

	minutes = `${minutes < 10 ? '0' : ''}${minutes}`;
	seconds = `${seconds < 10 ? '0' : ''}${seconds}`;

	timeIndicator.firstElementChild.innerText = minutes;
	timeIndicator.lastElementChild.innerText = seconds;
}

/**
 * @function
 * @name refreshTimer
 * @description Generates an interval to refresh the timer every second
 *
 * @author Tam
 *
 * @returns {number} The interval id.
 */
function refreshTimer() {
	timerRefreshId = setInterval(() => {
		if (remainingTime === 0) {
			buttonLabel.innerText = "Restart";
			clearInterval(timerRefreshId);
		}

		updateProgressRing(remainingTime / settings[`${selectedTimerType}Time`] * 100);
		updateTimeIndicator(remainingTime);

		remainingTime--;
	}, 1000);

	return timerRefreshId;
}

/**
 * @function
 * @name resetTimer
 * @description Resets the timer to the default value.
 *
 * @author Tam
 */
const resetTimer = () => {
	remainingTime = settings[`${selectedTimerType}Time`];
	clearInterval(timerRefreshId);
	updateTimeIndicator(remainingTime);
	updateProgressRing(100);
	buttonLabel.innerText = 'Start';
}

/**
 * @function
 * @name onTimerButtonClick
 * @description Handles the click event on the timer button.
 */
function onTimerButtonClick () {
	if (!isTimerActive) {
		isTimerActive = true;
		buttonLabel.innerText = "Pause";
		timerRefreshId = refreshTimer();
	} else {
		clearInterval(timerRefreshId);
		isTimerActive = false;
		buttonLabel.innerText = "Start";
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
	const inputs = [...form.elements].filter((element) => (
		element.tagName.toLowerCase() === 'input' && element.getAttribute('type') === 'number'
	));

	const formData = inputs.reduce((data, { name, value }) => ({
		...data,
		[name]: value,
	}), {});

	return formData;
}

const initializeSettingsForm = () => {
	document.getElementById('pomodoro-time-input').value = settings.pomodoroTime / 60;
	document.getElementById('pomodoro-short-break-input').value = settings.shortBreakTime / 60;
	document.getElementById('pomodoro-long-break-input').value = settings.longBreakTime / 60;
}

const onSettingsFormSubmit = (event) => {
	const {
		pomodoro: pomodoroTime,
		'short-break': shortBreakTime,
		'long-break': longBreakTime,
	} = processFormData(event.target);

	settings.pomodoroTime = pomodoroTime * 60;
	settings.shortBreakTime = shortBreakTime * 60;
	settings.longBreakTime = longBreakTime * 60;

	resetTimer();
};

const onTimerTypeChange = ({ target: { value } }) => {
	switch(value) {
		case 'pomodoro': {
			selectedTimerType = 'pomodoro';
			break;
		}
		case 'short-break': {
			selectedTimerType = 'shortBreak';
			break;
		}
		case 'long-break': {
			selectedTimerType = 'longBreak';
			break;
		}
		default:
			break;
	}
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


initializeSettingsForm();
updateTimeIndicator(remainingTime);
// Initializes the progress bar.
updateProgressRing(100);
