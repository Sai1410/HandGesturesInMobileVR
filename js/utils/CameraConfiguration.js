let video = document.getElementById('videoInput');
		
// Get access to video
const constraints = {
    advanced: [{
        facingMode: "environment"
    }]
};

navigator.mediaDevices.getUserMedia({ video: constraints, audio: false })
	.then(function(stream) {
	  window.stream = stream; // make stream available to console
	  video.srcObject = stream;
	  video.play();
	})
	.catch(function(err) {
		console.log("An error occurred! " + err);
	});
