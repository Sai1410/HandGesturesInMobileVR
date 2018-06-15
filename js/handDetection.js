// segmenting by skin color (has to be adjusted)

let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let temp = new cv.Mat(video.height, video.width, cv.CV_8UC1);
let temp2 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
let temp3 = new cv.Mat();
let temp4 = new cv.Mat();
let dst = new cv.Mat.zeros(video.height, video.width, cv.CV_8UC3);
let cap = new cv.VideoCapture(video);

let color = new cv.Scalar(255, 0, 0);

let lowScalarHSV = new cv.Scalar(90, 0, 0);
let highScalarHSV = new cv.Scalar(140,255, 0.5 * 255);

var mainTips;

let tipPoints = [];

function getDist(a, b){

	let diffx = a.x-b.x;
	let diffy = a.y-b.y;
	
	return Math.sqrt(diffx*diffx + diffy*diffy);
}



function makeHandMaskHSV(){

		cv.cvtColor(src, temp, cv.COLOR_BGR2HSV, 0);
		let low = new cv.Mat(temp.rows, temp.cols, temp.type(), lowScalarHSV);
		let high = new cv.Mat(temp.rows, temp.cols, temp.type(), highScalarHSV);
		cv.inRange(temp,low, high,temp);
		let ksize = new cv.Size(9, 9);
		cv.GaussianBlur(temp, temp, ksize, 0, 0, cv.BORDER_DEFAULT);
		cv.threshold(temp, temp, 200, 255,cv.THRESH_BINARY);
		
		
}

function findCenter(cnt){

	let moments = cv.moments(cnt, false);
	let centroid = new cv.Point();
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
	
	dist = getDist(new cv.Point(point.x, rect.y + rect.height), point);
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
	
	let defect = new cv.Mat();
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

	let thumb = new cv.Point();
	let pointer = new cv.Point();
	let minx = video.width;
	
	for(let i = 0; i < tipPoints.length; i++){
	
		if(tipPoints[i].x < minx){
			pointer.x = thumb.x;
			pointer.y = thumb.y;
			thumb = tipPoints[i];	
			minx = thumb.x;
		} 
	}
	cv.circle(dst, thumb, 3, color, -1);
	cv.circle(dst, pointer, 3, color, -1);
}

function makeContours(){

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
	
	let cnt;
	let rect;
	let center;
	let hull = new cv.Mat();
	

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
		
		// Get thumb and pointing finger
		getThumbAndPointer();
		
		
		tipPoints = [];

	}

};

function detectFingers(){

	

}

const FPS = 20;
function processVideo() {

        let begin = Date.now();
        
        // start processing.
        cap.read(src);
        src.copyTo(dst);
        
        makeHandMaskHSV();
		
		makeContours();
		
		detectFingers();
		
		//cv.cvtColor(src, temp2, cv.COLOR_BGR2HSV);
		
		cv.imshow('canvasOutput', dst);
		//cv.imshow('canvasTemp', temp2);
        // schedule the next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);

};

// schedule the first one.
setTimeout(processVideo, 0);
