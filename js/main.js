function changeMode(inputMode){
	if(inputMode === "AFrameMainMode") {
		document.getElementById('cameraOnly').setAttribute('style', 'display: none;')
		document.getElementById('ascene').setAttribute('style', 'display: default;')
		document.getElementById('FPSField').setAttribute('text', 'value: ')
		document.getElementById('FingerAmountField').setAttribute('text', 'value: ')
		document.getElementById('MessageField').setAttribute('text', 'value: ')
		
	} else if (inputMode === "DiagnosticMode") {
		document.getElementById('cameraOnly').setAttribute('style', 'display: none;')
		document.getElementById('ascene').setAttribute('style', 'display: default;')	
	}
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
		if(mode === "AFrameMainMode") {
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
