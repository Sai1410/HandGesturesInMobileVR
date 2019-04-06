function changeMode(inputMode){
	mode = inputMode;
}

const FPS = 20;
function processVideo() {
	begin = Date.now();

	try{
		if(mode === "Main") {
			mainMode();
		} else if(mode === "DiagnosticMode"){
			diagnosticMode();
		} else  {
			dst = cameraOnly(mode)
		}
		cv.imshow('canvasOutput', dst);
	}catch(error){
		document.getElementById('MessageField').setAttribute('text',  "value: " + error + "; color: red; width: 1.5;");
	}
	
	delay = 1000/FPS - (Date.now() - begin);
	setTimeout(processVideo, delay);
}
// schedule the first one.
setTimeout(processVideo, 0);
