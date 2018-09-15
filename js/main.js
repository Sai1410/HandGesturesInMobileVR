let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let temp = new cv.Mat(video.height, video.width, cv.CV_8UC1);

var hovered = false;

var grabState = false;

var zero_position = true;
var d = 0;
var el = document.getElementById('box');
var cam = document.getElementById('camera');
var cur = document.getElementById('cursor');
var defaultCursorColor = cur.getAttribute('color');
var text = document.getElementById('text');

let begin = Date.now();

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

function moveAnObject() {

	if(hovered){

		grabState = DetectGrabbing(video);
		
		if(grabState){
		  	
			cur.setAttribute('color', 'red' )
			
			let curr_camera_position = cam.getAttribute('position');
			let curr_camera_rotation = cam.getAttribute('rotation');
			
			if(zero_position == true){
			
				let curr_obj_position = el.getAttribute('position');
				
				obj_point = new cv.Point(curr_obj_position.z, curr_obj_position.x);
				camera_point = new cv.Point(curr_camera_position.z, curr_camera_position.x);
				
				// Count distance between camera and obj
				d = getDist(obj_point, camera_point);
				zero_position = false;
					
			} else {
				
				// Count new position
				let new_position_z = (-1)*d*Math.cos(toRadians(curr_camera_rotation.y));
				let new_position_x = (-1)*Math.sin(toRadians(curr_camera_rotation.y));
				
				el.object3D.position.set(new_position_x, curr_camera_position.y, new_position_z);
			}
		} else {
			// If not grabbing object start again
			zero_position=true;
			cur.setAttribute('color', defaultCursorColor )
		}
	}
}

function toRadians (angle) {
	  return angle * (Math.PI / 180);
	}

const FPS = 25;
function processVideo() {
        begin = Date.now();

        // start processing.
		checkHover();
		
		moveAnObject();

        //cv.imshow('canvasOutput', temp);

        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
}
// schedule the first one.
setTimeout(processVideo, 0);