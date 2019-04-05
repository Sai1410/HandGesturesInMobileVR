var hovered = false;

var zero_position = true;
var d = 0;
var el = document.getElementById('box');
var cam = document.getElementById('camera');
var cur = document.getElementById('cursor');
var defaultCursorColor = cur.getAttribute('color');
var text = document.getElementById('text');

let begin = Date.now();
let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
let start_camera_rotation = cam.getAttribute('rotation');
let alfa;

function mainMode(){

	document.getElementById('cameraOnly').setAttribute('style', 'display: none;')

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