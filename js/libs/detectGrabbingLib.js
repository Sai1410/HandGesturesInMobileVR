function DetectGrabbing(video, htmlView){

	var grabState = false;

	let tipPoints = [];
	
	let cnt;
	let rect;

	fingerAmount = -1;
	
	cap.read(src);
	
	// Make Hand Mask from a video
	temp = makeHandMaskGRAY(src, temp, lowRangeGRAY, highRangeGRAY, ksize);
	
	// find contours on img
	cv.findContours(temp, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

	// find largest contour
	let [max_idx, hole_contour_idx]  = getIndexOfLargestContour(contours);	
	cnt = contours.get(max_idx);
	
	if(cnt) {
	
		// get center
		center = findCenter(cnt, centroid);
	
		// get rectangle of contour
		rect = getRectangle(cnt);
		
		// get hull
		cv.convexHull(cnt, hull, false, false);
		
		// detect fingertips
		detectFingerTips(cnt, hull, rect, defect, tipPoints, hole_contour_idx);
		
		// DetectGrabbing
		grabState = detectGrabbing(hole_contour_idx);
		
		tipPoints = [];
	} else {
		center.x = 0;
		center.y = 0;
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
	cv.threshold(temp, temp, 175, 255,cv.THRESH_BINARY);
	
	return temp;
}

function getIndexOfLargestContour(contours){

	let max_area = 0;
	let hole_area = 0;
	let cnt;
	let area;
	let max_contour_index = 0; 
	let hole_contour_index = 0
	for (let i = 0; i < contours.size(); ++i) {
		cnt=contours.get(i);
		area = cv.contourArea(cnt, false)
		
		if(area>max_area){
			max_area=area;
			max_contour_index=i;
		}
		if(area > hole_area && hole_area < max_area){
			hole_contour_index = i
		}
	}

	return [max_contour_index, hole_contour_index];
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

function detectFingerTips(cnt, hull, rect, defect, tipPoints, hole_contour_idx){

	let previewTip = null;
	
	// Get all convexity defects
	cv.convexityDefects(cnt, hull, defect);
	
	for(let i = 0; i < defect.rows; i = ++i){
	
		let point = new cv.Point(cnt.data32S[defect.data32S[i * 4] * 2],
			                     cnt.data32S[defect.data32S[i * 4] * 2 + 1]);
		if(tipPoints.length < 5) decideTipPoint(previewTip, point, rect, tipPoints);
		previewTip = point;
	}
	if(fingerAmount){	
		fingerAmount = tipPoints.length
		hole_contour_idx && fingerAmount < 5 && fingerAmount++
	}
}

function decideTipPoint(previewTip, point, rect, tipPoints){
	
	let newPoint = new cv.Point(point.x, rect.y + rect.height)
	dist = getDist(newPoint, point);
	
	if(previewTip){
	
		dist2 = getDist(previewTip, point);
		if(dist2 > 40){
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

function detectGrabbing(hole_contour_index) {
	if(hole_contour_index) return true;
}

