function changeMode(inputMode){
	mode = inputMode;
}

function requestAnimFrame() {

  if(!lastCalledTime) {
     lastCalledTime = performance.now();
     fps = 0;
     return;
  }
  delta = (performance.now() - lastCalledTime)/1000;
  lastCalledTime = performance.now();
  fps = 1/delta;
} 

var lastCalledTime;
var fps;
const FPS = 20;
function processVideo() {

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

	requestAnimFrame()

	setTimeout(processVideo, fps);
}
// schedule the first one.
setTimeout(processVideo, 0);
