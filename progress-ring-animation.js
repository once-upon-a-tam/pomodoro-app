const button = document.querySelector('#timer > button');
const buttonLabel = button.querySelector("#timer-button-label");
const progressRing = document.getElementById('progress-ring');
const progressRingWrapper = document.getElementById('progress-ring-wrapper');
const timeIndicator = document.querySelector('#timer > button > time');

progressRing.r.baseVal.value = button.getBoundingClientRect().width * 0.40;
progressRingWrapper.r.baseVal.value = button.getBoundingClientRect().width * 0.42;

const progressRingRadius = progressRing.r.baseVal.value;
const progressRingCircumference = progressRingRadius * 2 * Math.PI;


progressRing.style.strokeDasharray = `${progressRingCircumference} ${progressRingCircumference}`;
progressRing.style.strokeDashoffset = `${progressRingCircumference}`;


const TIMER_VALUE_IN_SECONDS = 1080;
let isTimerActive = false;
let timerRefreshId;
let remainingTime = TIMER_VALUE_IN_SECONDS;

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

		updateProgressRing(remainingTime / TIMER_VALUE_IN_SECONDS * 100);
		updateTimeIndicator(remainingTime);

		remainingTime--;
	}, 1000);

	return timerRefreshId;
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

button.addEventListener('click', function() {
	onTimerButtonClick();
});

// Initializes the progress bar.
updateProgressRing(100);
