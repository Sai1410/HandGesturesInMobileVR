function cameraOnly (mode) {

    let hullVector = new cv.MatVector();
	var grabState = false;

	let tipPoints = [];
    
    document.getElementById('ascene').setAttribute('style', 'display: none;')

	cap.read(src);
	
	// Make Hand Mask from a video
	temp = makeHandMaskGRAY(src, temp, lowRangeGRAY, highRangeGRAY, ksize);
    if(mode === "HandMask") {
        return temp
    } else {
        dst = src.clone();
    }
    
    // find contours on img
	cv.findContours(temp, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    let [max_idx, hole_contour_idx]  = getIndexOfLargestContour(contours);

    //Draw
    if(mode === "LargestContour"){
        cv.drawContours(dst, contours, max_idx, color, 1, cv.LINE_8, hierarchy, 100);
        cv.drawContours(dst, contours, hole_contour_idx, color, 1, cv.LINE_8, hierarchy, 100);
        return dst
    }
    
    let cnt = contours.get(max_idx);

    if(cnt){

        center = findCenter(cnt, centroid);
        if(mode === "handCenter"){
            // get center
            cv.circle(dst, center, 3, color, -1)

            return dst
        }

        // get rectangle of contour
        let rect = getRectangle(cnt);

        //Draw
        if(mode === "Rectangle"){
            let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            cv.rectangle(dst, point1, point2, color, 2, cv.LINE_AA, 0);
        
            return dst    
        }



        //Draw
        if(mode === "Hull"){
            // get hull
            cv.convexHull(cnt, hull, false, true);

            hullVector.push_back(hull);
            cv.drawContours(dst, hullVector, 0, color, 1, 8, hierarchy, 0);

            return dst
        } else {
            // get hull
            cv.convexHull(cnt, hull, false, false);
        }

        // detect fingertips
        detectFingerTips(cnt, hull, rect, defect, tipPoints, hole_contour_idx);
        //Draw
        if(mode === "FingerTips"){
            for(let i = 0; i < tipPoints.length ; i++){
                cv.circle(dst, tipPoints[i], 3, color, -1)
                cv.line(dst, tipPoints[i], center, [255, 0, 0, 255])
            }
        }

        grabState = detectGrabbing(hole_contour_idx);
        document.getElementById("detectedFingerTips").innerHTML = `Detected Finger Tips: ${fingerAmount}`
        document.getElementById("detectedGrabbing").innerHTML = `Detected Grabbing: ${grabState ? grabState : false}`
    }
    return dst
}