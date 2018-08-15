// segmenting by skin color (has to be adjusted)
//"use strict";

let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let temp = new cv.Mat(video.height, video.width, cv.CV_8UC1);
let dst = new cv.Mat.zeros(video.height, video.width, cv.CV_8UC3);
let cap = new cv.VideoCapture(video);

let color = new cv.Scalar(255, 0, 0);

let lowScalarHSV= new cv.Scalar(0, 0, 0);
let highScalarHSV= new cv.Scalar(65,255, 15);
let lowRangeHSV = new cv.Mat(temp.rows, temp.cols, temp.type(), new cv.Scalar(0, 0, 0));
let highRangeHSV = new cv.Mat(temp.rows, temp.cols, temp.type(), new cv.Scalar(65,255, 15));

let lowScalarGRAY= new cv.Scalar(0, 0, 0);
let highScalarGRAY= new cv.Scalar(65,255, 15);
let lowRangeGRAY= new cv.Mat(temp.rows, temp.cols, temp.type(), lowScalarGRAY);
let highRangeGRAY = new cv.Mat(temp.rows, temp.cols, temp.type(), highScalarGRAY );

let ksize = new cv.Size(9, 9);

let centroid = new cv.Point();

let hull = new cv.Mat();

var thumb = new cv.Point();
var pointer = new cv.Point();

let contours = new cv.MatVector();
let hierarchy = new cv.Mat();

let defect = new cv.Mat();

var grabState = false;

let tipPoints = [];

let i = 0;

var hovered = false;

var zero_position = true;
var d = 0;
var el = document.getElementById('box');
var cam = document.getElementById('camera');
var cur = document.getElementById('cursor');
var defaultCursorColor = cur.getAttribute('color');

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function getDist(a, b){

	let diffx = b.x-a.x;
	let diffy = b.y-a.y;
	
	return Math.sqrt(diffx*diffx + diffy*diffy);
}

function makeHandMaskHSV(){
	
		cv.cvtColor(src, temp, cv.COLOR_RGB2HSV, 0);
		cv.inRange(temp,lowRangeHSV, highRangeHSV,temp);
		//cv.GaussianBlur(temp, temp, ksize, 0, 0, cv.BORDER_DEFAULT);
		//cv.threshold(temp, temp, 200, 255,cv.THRESH_BINARY);
		
}

function makeHandMaskGRAY(){

	cv.cvtColor(src, temp, cv.COLOR_RGB2GRAY, 0);
	
	cv.inRange(temp,lowRangeGRAY, highRangeGRAY,temp);
	
	cv.GaussianBlur(temp, temp, ksize, 0, 0, cv.BORDER_DEFAULT);
	cv.threshold(temp, temp, 200, 255,cv.THRESH_BINARY);
	
}

function findCenter(cnt){

	let moments = cv.moments(cnt, false);
	
	if(moments.m00 !=0 ){
	
		centroid.x = moments.m10/moments.m00;
		centroid.y = moments.m01/moments.m00;
	
	}
	return centroid;
}

function getLargestContour(contours){

	let max_area = 0;
	let cnt;
	let area;
	let max_contour_index = 0; 
	
	for (let i = 0; i < contours.size(); ++i) {
            cnt=contours.get(i);
            area = cv.contourArea(cnt, false)
            if(area>max_area){
                max_area=area;
                max_contour_index=i;
            }
	}

	cnt = contours.get(max_contour_index);

	return cnt;
}

function getRectangle(cnt){

	return cv.boundingRect(cnt);

}

function decideTipPoint(previewTip, point, rect){
	
	let newPoint = new cv.Point(point.x, rect.y + rect.height)
	dist = getDist(newPoint, point);
	
	if(previewTip){
	
		dist2 = getDist(previewTip, point);
		if(dist2 > 20){
			if(dist > (rect.height / 4)){
				tipPoints.push(point);
			}
		} 
	} else {
		if(dist > (rect.height / 4)){
			tipPoints.push(point);
		}
	}
}


function detectFingerTips(cnt, hull, rect){

	let total = 0;
	let previewTip = null;
	let previewFold = null;
	
	
	// Get all convexity defects
	cv.convexityDefects(cnt, hull, defect);
	
	for(let i = 0; i < defect.rows; i = ++i){
	
		let point = new cv.Point(cnt.data32S[defect.data32S[i * 4] * 2],
			                     cnt.data32S[defect.data32S[i * 4] * 2 + 1]);
		
		decideTipPoint(previewTip, point, rect);
		
		previewTip = point;
	}
	
}

function getThumbAndPointer(){

	let minx = video.width;
	
	for(let i = 0; i < tipPoints.length; i++){
	
		if(tipPoints[i].x < minx){
			pointer.x = thumb.x;
			pointer.y = thumb.y;
			thumb = tipPoints[i];	
			minx = thumb.x;
		} 
	}
	
	//cv.circle(dst, thumb, 3, color, -1);
	//cv.circle(dst, pointer, 3, color, -1);
}

function detectGrabbing() {
	if(tipPoints.length == 4) {
		if(getDist(pointer,thumb) > 50) {
			grabState = true;
		}
	
	} else if (tipPoints.length == 5){
		if(getDist(pointer,thumb) < 30) {
			grabState = true;		
		} else {
		
			grabState = false;
		}
	}	
}

function detectHand(){

	let cnt;
	let rect;
	let center;

	// find contours on img
	cv.findContours(temp, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

	// find largest contour
	cnt = getLargestContour(contours);

	// if it is not null
	if(cnt){
	
		// get center of contour
		center = findCenter(cnt);
		cv.circle(dst, center, 3, color, -1);
		
		// get rectangle of contour
		rect = getRectangle(cnt);
		
		// get hull
		cv.convexHull(cnt, hull, false, false);
		
		// detect fingertips
		detectFingerTips(cnt, hull, rect);
		
		if(tipPoints.length > 3){
			// Get thumb and pointing finger
			getThumbAndPointer();
			
			// DetectGrabbing
			detectGrabbing();
		}

		
		tipPoints = [];

	}

};

function transformCoordinatesToAFRAME(point){

	const MAXX = 1.68;
	const MAXY = 0.84;
	
	let t = point.x/video.width;
	let x = t * (MAXX * 2) - MAXX;
	t = point.y/video.height;
	let y = -(t * (MAXY * 2) - MAXY);
	
	return new cv.Point(x,y);
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

function moveAnObject() {

	if(hovered && grabState){
		  	
		cur.setAttribute('color', 'red' )
		
		let curr_camera_position = cam.getAttribute('position');
		let curr_camera_rotation = cam.getAttribute('rotation');
		
		if(zero_position == true){
		
			let curr_obj_position = el.getAttribute('position');
			//console.log(curr_obj_position);
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

const FPS = 25;
function processVideo() {
        let begin = Date.now();

        // start processing.
        cap.read(src);
        
        makeHandMaskGRAY();

		detectHand();

		checkHover();
		
		moveAnObject();

        //cv.imshow('canvasOutput', temp);

        // schedule the next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
}
// schedule the first one.
setTimeout(processVideo, 0);
