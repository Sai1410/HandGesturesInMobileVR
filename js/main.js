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
let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
let start_camera_rotation = cam.getAttribute('rotation');
let alfa;
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

		grabState = DetectGrabbing(video, true);
		
		
		if(grabState){
		  	
			cur.setAttribute('color', 'red' )
			
			let curr_camera_position = cam.getAttribute('position');
			let curr_camera_rotation = cam.getAttribute('rotation');
			
			if(zero_position == true){
			
				let curr_obj_position = el.getAttribute('position');
				
				start_obj_point = new cv.Point(curr_obj_position.z, curr_obj_position.x);
				start_camera_point = new cv.Point(curr_camera_position.z, curr_camera_position.x);
				
				start_camera_rotation = curr_camera_rotation.y;
				// Count distance between camera and obj
				//d = getDist(obj_point, camera_point);
				zero_position = false;
					
			} else {
			
				alfa = Math.abs(curr_camera_rotation.y - start_camera_rotation);
				
				// Count new position
				let new_position_z = start_obj_point.x * Math.cos(toRadians(alfa)) + start_obj_point.y * Math.sin(toRadians(alfa));
				let new_position_x = (-1) * start_obj_point.y * Math.cos(toRadians(alfa)) + start_obj_point.x * Math.sin(toRadians(alfa));
				console.log(new_position_z)
				console.log(new_position_x)
				el.object3D.position.set((-1) * new_position_x, curr_camera_position.y, new_position_z);
			}
		} else {
			// If not grabbing object start again
			zero_position=true;
			cur.setAttribute('color', defaultCursorColor )
		}
	} else {
		// If not grabbing object start again
		zero_position=true;
		cur.setAttribute('color', defaultCursorColor )
	}
}

function toRadians (angle) {
	  return angle * (Math.PI / 180);
	}

const FPS = 25;
function processVideo() {
        begin = Date.now();
		//dst = src.clone();
        // start processing.
		checkHover();
//		
		moveAnObject();
       // DetectGrabbing(video, true);
        

        //cv.imshow('canvasOutput', dst);

        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
}
// schedule the first one.
setTimeout(processVideo, 0);
