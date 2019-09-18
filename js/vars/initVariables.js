//Variables for detecting grabbing
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

//Variables for interaction with a-frame

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

let fingerAmount = -1;

//Init mode
var mode = "CameraOnly"