let intervalID;
let startTime;
let initialOffset;

onmessage = (e) => {
	if(e.data.type === "start") {
		clearInterval(intervalID);
		initialOffset = e.data.t || 0;
		startTime = Date.now();

		intervalID = setInterval(() => {
			const elapsed = Math.floor((Date.now() - startTime) / 1000);
			const t = initialOffset + elapsed;

			if(t > e.data.maxDuration) {
				postMessage({
					t: e.data.maxDuration,
					running: false
				});
				clearInterval(intervalID);
			} else {
				postMessage({
					t: t,
					running: true
				});
			}
		}, 1000);
	} else {
		clearInterval(intervalID);
	}
}