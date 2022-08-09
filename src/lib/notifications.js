let areNotificationsGranter = false;

const requestNotificationPermission = () => {
	if (Notification.permission === "default") {
		Notification.requestPermission()
			.then((result) => {
				console.log(result);
			});
	}
};

const notifyTimerEnded = () => {
	if (Notification.permission === "granted") {
		const notification = new Notification("Time's up!", {
			body: 'Your pomodoro timer has ended.',
		});

		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				notification.close();
			}
		})
	}
};

export {
	requestNotificationPermission,
	notifyTimerEnded,
}
