let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let temp = new cv.Mat(video.height, video.width, cv.CV_8UC1);
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

let thumb = new cv.Point();
let pointer = new cv.Point();

let contours = new cv.MatVector();
let hierarchy = new cv.Mat();

let defect = new cv.Mat();

let center;

function DetectGrabbing(video, htmlView){

	if(htmlView == false){
		
		let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
		let temp = new cv.Mat(video.height, video.width, cv.CV_8UC1);
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

		let thumb = new cv.Point();
		let pointer = new cv.Point();

		let contours = new cv.MatVector();
		let hierarchy = new cv.Mat();

		let defect = new cv.Mat();
		
	}
	
	var grabState = false;

	let tipPoints = [];
	
	let cnt;
	let rect;
	
	cap.read(src);
	
	// Make Hand Mask from a video
	temp = makeHandMaskGRAY(src, temp, lowRangeGRAY, highRangeGRAY, ksize);
	
	// find contours on img
	cv.findContours(temp, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

	// find largest contour
	cnt = contours.get(getIndexOfLargestContour(contours));
	
	if(cnt) {
	
		// get center
		center = findCenter(cnt, centroid);
	
		// get rectangle of contour
		rect = getRectangle(cnt);
		
		// get hull
		cv.convexHull(cnt, hull, false, false);
		
		// detect fingertips
		detectFingerTips(cnt, hull, rect, defect, tipPoints);
		
		if(tipPoints.length > 3){
			
			
			// Get thumb and pointing finger
			getThumbAndPointer(video, tipPoints, pointer, thumb);
			
			// DetectGrabbing
			grabState = detectGrabbing(tipPoints, pointer, thumb);
		}
		
		tipPoints = [];
	}
	
	return grabState;
}

function makeHandMaskHSV(src, temp, lowRangeHSV, highRangeHSV, ksize){
	
	cv.cvtColor(src, temp, cv.COLOR_RGB2HSV, 0);
	cv.inRange(temp, lowRangeHSV, highRangeHSV, temp);
	cv.GaussianBlur(temp, temp, ksize, 0, 0, cv.BORDER_DEFAULT);
	cv.threshold(temp, temp, 200, 255,cv.THRESH_BINARY);
	
	return temp;
}

function makeHandMaskGRAY(src, temp, lowRangeGRAY, highRangeGRAY, ksize){

	cv.cvtColor(src, temp, cv.COLOR_RGB2GRAY, 0);
	cv.inRange(temp,lowRangeGRAY, highRangeGRAY,temp);
	cv.GaussianBlur(temp, temp, ksize, 0, 0, cv.BORDER_DEFAULT);
	cv.threshold(temp, temp, 200, 255,cv.THRESH_BINARY);
	
	return temp;
}

function getIndexOfLargestContour(contours){

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

	return max_contour_index;
}

function findCenter(cnt, centroid){

	let moments = cv.moments(cnt, false);
	
	if(moments.m00 !=0 ){
		centroid.x = moments.m10/moments.m00;
		centroid.y = moments.m01/moments.m00;
	}
	
	return centroid;
}

function getRectangle(cnt){
	return cv.boundingRect(cnt);
}

function detectFingerTips(cnt, hull, rect, defect, tipPoints){

	let total = 0;
	let previewTip = null;
	let previewFold = null;
	
	// Get all convexity defects
	cv.convexityDefects(cnt, hull, defect);
	
	for(let i = 0; i < defect.rows; i = ++i){
	
		let point = new cv.Point(cnt.data32S[defect.data32S[i * 4] * 2],
			                     cnt.data32S[defect.data32S[i * 4] * 2 + 1]);
		decideTipPoint(previewTip, point, rect, tipPoints);
		previewTip = point;
	}
}

function decideTipPoint(previewTip, point, rect, tipPoints){
	
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

function getDist(a, b){

	let diffx = b.x-a.x;
	let diffy = b.y-a.y;
	
	return Math.sqrt(diffx*diffx + diffy*diffy);
}

function getThumbAndPointer(video, tipPoints, pointer, thumb){

	let minx = video.width;
	
	for(let i = 0; i < tipPoints.length; i++){
	
		if(tipPoints[i].x < minx){
			pointer.x = thumb.x;
			pointer.y = thumb.y;
			thumb = tipPoints[i];	
			minx = thumb.x;
		} 
	}
}

function detectGrabbing(tipPoints, pointer, thumb) {
	if(tipPoints.length == 4) {
		if(getDist(pointer,thumb) > 50) {
			return true;
		}
	} else if (tipPoints.length == 5){
		if(getDist(pointer,thumb) < 30) {
			return true;		
		} else {
		
			return false;
		}
	}	
}

