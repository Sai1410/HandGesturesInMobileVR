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

function setDefaultCursorColor(){
	zero_position=true;
	cur.setAttribute('color', defaultCursorColor )
}

function checkHover() {
	el.addEventListener('mouseenter', function () {
		hovered = true;
		el.setAttribute('color', "blue");
	});
	el.addEventListener('mouseleave', function () {
		hovered = false;
		el.setAttribute('color', "white");
	});	  
}

function browserDetection() {
    if (navigator.userAgent.search("Chrome")) {
        browser="Chrome"
    } else if (navigator.userAgent.search("Chromium")){
		browser="Chromium"
	}
}

function setObjectStartPositions(curr_camera_position, curr_camera_rotation) {
	let curr_obj_position = el.getAttribute('position');
		
	start_obj_point = new cv.Point(curr_obj_position.z, curr_obj_position.x);
	start_camera_point = new cv.Point(curr_camera_position.z, curr_camera_position.x);
	
	start_camera_rotation = curr_camera_rotation.y;

	zero_position = false;
}

function setObjectNewPositions(curr_camera_position, curr_camera_rotation){
	deltaAngle = Math.abs(curr_camera_rotation.y - start_camera_rotation);
		
	// Calculate new position
	let new_position_z = start_obj_point.x * Math.cos(toRadians(deltaAngle)) + start_obj_point.y * Math.sin(toRadians(deltaAngle));
	let new_position_x = (-1) * start_obj_point.y * Math.cos(toRadians(deltaAngle)) + start_obj_point.x * Math.sin(toRadians(deltaAngle));

	el.object3D.position.set((-1) * new_position_x, curr_camera_position.y, new_position_z);
}

function moveAnObject() {
	cur.setAttribute('color', 'red' )
				
	let curr_camera_position = cam.getAttribute('position');
	let curr_camera_rotation = cam.getAttribute('rotation');
	
	if(zero_position == true){
		setObjectStartPositions(curr_camera_position, curr_camera_rotation)
	} else {
		setObjectNewPositions(curr_camera_position, curr_camera_rotation)
	}
}

function toRadians (angle) {
	  return angle * (Math.PI / 180);
	}

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