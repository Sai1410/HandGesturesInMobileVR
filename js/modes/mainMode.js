function mainMode(){

	document.getElementById('cameraOnly').setAttribute('style', 'display: none;')
	document.getElementById('ascene').setAttribute('style', 'display: default;')

	browserDetection();

	checkHover();

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