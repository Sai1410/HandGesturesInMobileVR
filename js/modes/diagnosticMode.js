function showHandMoment() {
	if(center){
		if(center.x > (video.width * 0.9) || center.x < (video.width * 0.1) || center.y < (video.y * 0.1) || center.y > (video.y * 0.9)){
			document.getElementById('MessageField').setAttribute('text', "value: Hand out of borders; color: red; width: 1.5;")
		} else {
			document.getElementById('MessageField').setAttribute('text',  "value: ok; color: red; width: 1.5;")
		}
	} else {
		document.getElementById('MessageField').setAttribute('text',  "value: Hand not found; color: red; width: 1.5;");
	}
}

function diagnosticMode(){

	document.getElementById('cameraOnly').setAttribute('style', 'display: none;')
	document.getElementById('ascene').setAttribute('style', 'display: default;')

    document.getElementById('FPSField').setAttribute('text', "value: FPS:"  + Math.floor(fps) + "; color: red; width: 2;")
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