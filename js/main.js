let browser = "Firefox"
var mode = "Main"

function changeMode(inputMode){
	mode = inputMode;
}

const FPS = 25;
function processVideo() {
		begin = Date.now();

		if(mode === "Main") {
			mainMode();
		} else  {
			dst = cameraOnly(mode)
		}

		cv.imshow('canvasOutput', dst);

		let delay = 1000/FPS - (Date.now() - begin);
		setTimeout(processVideo, delay);
}
// schedule the first one.
setTimeout(processVideo, 0);
