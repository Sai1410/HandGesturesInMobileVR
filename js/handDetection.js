// segmenting by skin color (has to be adjusted)

let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let temp = new cv.Mat(video.height, video.width, cv.CV_8UC1);
let temp2 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
let temp3 = new cv.Mat();
let temp4 = new cv.Mat();
let dst = new cv.Mat.zeros(video.height, video.width, cv.CV_8UC3);
let cap = new cv.VideoCapture(video);


let lowScalarHLS = new cv.Scalar(0, 0.1 * 255, 0.05 * 255);
let highScalarHLS = new cv.Scalar(15, 0.8 * 255, 0.6 * 255);

let lowScalarHSV = new cv.Scalar(90, 0, 0);
let highScalarHSV = new cv.Scalar(140,255, 0.5 * 255);


let lowScalarRGB = [117, 117, 117, 0];
let highScalarRGB = [255, 255, 255, 255];


function makeHandMaskRGBA(){

		let low = new cv.Mat(src.rows, src.cols, src.type(), lowScalarRGB);
		let high = new cv.Mat(src.rows, src.cols, src.type(), highScalarRGB);
		cv.inRange(src,low, high,temp);

		let ksize = new cv.Size(9, 9);
		cv.GaussianBlur(temp, temp, ksize, 0, 0, cv.BORDER_DEFAULT);
		cv.threshold(temp, temp, 200, 255,cv.THRESH_BINARY);
}

function makeHandMaskGRAY(){

		cv.cvtColor(src, temp, cv.COLOR_RGB2GRAY);

		let low = new cv.Mat(temp.rows, temp.cols, temp.type(), lowScalarRGB);
		let high = new cv.Mat(temp.rows, temp.cols, temp.type(), highScalarRGB);
		cv.inRange(temp,low, high,temp);

		let ksize = new cv.Size(9, 9);
		cv.GaussianBlur(temp, temp, ksize, 0, 0, cv.BORDER_DEFAULT);
		cv.threshold(temp, temp, 200, 255,cv.THRESH_BINARY);
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

function makeHandMaskHLS(){

		cv.cvtColor(src, temp, cv.COLOR_BGR2HLS);
		let low = new cv.Mat(temp.rows, temp.cols, temp.type(), lowScalarHLS);
		let high = new cv.Mat(temp.rows, temp.cols, temp.type(), highScalarHLS);
		cv.inRange(temp,low, high,temp);
		let ksize = new cv.Size(9, 9);
		cv.GaussianBlur(temp, temp, ksize, 0, 0, cv.BORDER_DEFAULT);
		cv.threshold(temp, temp, 200, 255,cv.THRESH_BINARY);
		
}

function makeContours(){

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
	let color = new cv.Scalar(255, 0, 0);
	let max_contour_index = 0; 
	let cnt;
	
	cv.findContours(temp, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
	let max_area = 0;

	// get largest contour

	for (let i = 0; i < contours.size(); ++i) {
            cnt=contours.get(i);
            area = cv.contourArea(cnt, false)
            if(area>max_area){
                max_area=area;
                max_contour_index=i;
            }
	}
	
	cnt = contours.get(max_contour_index);
	if(cnt){
	
			
		let tmp = new cv.Mat();
		
		let hull = new cv.MatVector();
		
		
		cv.convexHull(cnt, tmp, false, true);
		hull.push_back(tmp);
		cv.drawContours(dst, hull, 0, color, 2, cv.LINE_8, hierarchy, 0);
	}



	
	
	
	//cv.drawContours(dst, contours, max_contour_index, color, 2, cv.LINE_8, hierarchy, 100);
	//return contours.get(max_contour_index);
};

const FPS = 20;
function processVideo() {

        let begin = Date.now();
        
        // start processing.
        cap.read(src);
        src.copyTo(dst);
        
        makeHandMaskHSV();
		
		makeContours();
		
		//detectFingers(contour);
		
		//cv.cvtColor(src, temp2, cv.COLOR_BGR2HSV);
		
		cv.imshow('canvasOutput', dst);
		//cv.imshow('canvasTemp', temp2);
        // schedule the next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);

};

// schedule the first one.
setTimeout(processVideo, 0);
