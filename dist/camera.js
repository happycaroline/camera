
<<<<<<< HEAD
/* jslint undef: true */
/* global window, document, $ */

=======
>>>>>>> origin/master
/* ----------------------------------------------------------------
 * camera.js
 * 
 * Made by shash7
 * https://github.com/shash7/camera
 * 
 * Licensed under the MIT license
<<<<<<< HEAD
 * 
 * Api usage :
 * 
 * var camera = new Camera();
 * camera.start();
 * camera.snap();
 * camera.stop();
 * ---------------------------------------------------------------- */


=======
 * ---------------------------------------------------------------- */

>>>>>>> origin/master
;(function(window, document, undefined) {
	
	'use strict';
	
	function camera(opts) {
		
<<<<<<< HEAD
		
	 /* ----------------------------------------------------------------
		* globals
		* ---------------------------------------------------------------- */
		var permission = false;
		var api = false;
		var resource = {
			audio : false,
			video : true
		};
		
		// DOM elements
		var canvas;
		var video;
		var body;
		var button;
		var container;
		var hidden;
		
		// Canvas contexts
		var ctx;
		var hiddenCtx;
		
		// Options
		var onSuccess     = null;
		var onError       = null;
		var fps           = 33;
		var baseDimension = 64;
		var mirror        = true;
		
		// Control variables. Don't mess around with 'em
		var buttonActive = false;
		var previewWidth  = 128;
		var previewHeight = 100;
		
		
	 /* ----------------------------------------------------------------
		* private functions
		* ---------------------------------------------------------------- */
		function setOptions(opts) {
			onSuccess = opts.onSuccess || null;
			onError   = opts.onError   || null;
			if(opts.mirror !== undefined) { // Because false is a falsy value so I used undefined
				if(!opts.mirror) {
					mirror = false;
				}
			}
			fps       = 1000/opts.fps  || 33;
		}
		
		function hasGetUserMedia() {
			var result = !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
			if(result) {
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
				return true;
			} else {
				return false;
			}
		}
		
		function createNodes() {
			body = document.getElementsByTagName('body')[0];
			
			container = document.createElement('div');
			container.className = 'camera-container';
			canvas = document.createElement('canvas');
			canvas.className = 'camera-preview';
			
			container.appendChild(canvas);
			button = document.createElement('div');
			button.className = 'camera-button';
			container.appendChild(button);
			canvas.width  = previewWidth;
			canvas.height = previewHeight;
			body.appendChild(container);
			
			video = document.createElement('video');
			body.appendChild(video);
			video.className = 'camera-hidden';
			
			hidden = document.createElement('canvas');

		}
		
		function getDimensions() {
			var width  = video.videoWidth  || baseDimension;
			var height = video.videoHeight || baseDimension;
			var ratio = 1;
			if(width > height) {
				ratio = width/height;
				height = baseDimension;
				width = ratio*baseDimension;
			} else {
				ratio = height/width;
				width = baseDimension;
				height = ratio*baseDimension;
			}
			previewWidth  = width;
			previewHeight = height;
		}
		
		function play(stream) {
			// Setup video and play
			if (video.mozSrcObject !== undefined) {
				video.mozSrcObject = stream;
			} else {
				video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
			}
			
			video.play();
		}
		
		function bindListners() {
			video.addEventListener('play', drawVideo, false);
			button.addEventListener('click', takePhoto, false);
		}
		
		function unbindListners() {
			video.removeEventListener('play', drawVideo, false);
			button.removeEventListener('click', takePhoto, false);
		}
		
		function takePhoto() {
			if(!buttonActive) {
				snap();
				buttonActive = true;
				setTimeout(function() {
					buttonActive = false;
				}, 200);
			}
		}
		
		function drawVideo() {
			ctx = canvas.getContext('2d');
			var invert = 1;
			console.log(mirror);
			if(mirror) {
				ctx.scale(-1,1);
				invert = -1;
			}
			// Every 33 milliseconds copy the video image to the canvas
			setInterval(function() {
				ctx.fillRect(0, 0, previewWidth, previewHeight);
				ctx.drawImage(video, 0, 0, previewWidth * invert, previewHeight);
			}, fps);
		}
		
		function successCallback(stream) {
			
			if (typeof onSuccess === "function") {
				onSuccess(stream);
			} else {
				createNodes();
				bindListners();
				play(stream);
			}
		}
		
		function errorCallback(error) {
			if (typeof onSuccess === "function") {
				onError(stream);
			} else {
				return error;
			}
		}
		
		
	 /* ----------------------------------------------------------------
		* public functions
		* ---------------------------------------------------------------- */
		function start(opts) {
			opts = opts || {};
			var result = hasGetUserMedia();
			if(result) {
				setOptions(opts);
				navigator.getUserMedia(resource, successCallback, errorCallback);
			} else {
				return false;
			}
		}
		
		function snap() {
			hidden.width  = video.videoWidth;
			hidden.height = video.videoHeight;
			hiddenCtx = hiddenCtx || hidden.getContext('2d');
			
			var invert = 1;
			if(mirror) {
				hiddenCtx.scale(-1,1);
				invert = -1;
			}
			
			hiddenCtx.fillRect(0, 0, video.videoWidth, video.videoHeight);
			hiddenCtx.drawImage(video, 0, 0, video.videoWidth * invert, video.videoHeight);
			var dataURL = hidden.toDataURL();
			
			return dataURL;
		}
		
		function stop() {
			unbindListners();
			
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
=======
		var permission = false;
		var api = false;
		var resource = {
			audio : true,
			video : true
		};
		
		function hasGetUserMedia() {
			return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia || navigator.msGetUserMedia);
		}
		
		function successCallback(stream) {
			console.log(stream);
		}
		
		function errorCallback(error) {
			console.log(error);
		}
		
		function snap() {
		}
		
		function start() {
			var video = document.querySelector('video');
if (navigator.getWebkitUserMedia) {
  navigator.getUserMedia({audio: true, video: true}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
  }, errorCallback);
} else {
  video.src = 'somevideo.webm'; // fallback.
}
>>>>>>> origin/master
		}
		
		return {
			snap  : snap,
<<<<<<< HEAD
			start : start,
			stop  : stop
		};
=======
			start : start
		}
>>>>>>> origin/master
		
	}
	
	window.Camera = camera;
	
})(window, document);