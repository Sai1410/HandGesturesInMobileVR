function showHandMoment() {

}

function diagnosticMode(){

	document.getElementById('cameraOnly').setAttribute('style', 'display: none;')
	document.getElementById('ascene').setAttribute('style', 'display: default;')

    document.getElementById('FPSField').setAttribute('text', "value: FPS:"  + (delay < 0 ? 0 : delay) + "; color: red; width: 2;")
    document.getElementById('FingerAmountField').setAttribute('text', "value: Fingers Detected:" + (fingerAmount == -1 ? 0 : fingerAmount) + "; color: red; width: 1.5;")
    
	checkHover();

    showHandMoment();

	if(hovered){
		if(DetectGrabbing(video, true)){
			moveAnObject();
		} else {
			setDefaultCursorColor();
		}
	} else {
		setDefaultCursorColor();
	}

}