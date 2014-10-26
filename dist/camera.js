
/* jslint undef: true */
/* global window, document, $ */

/* ----------------------------------------------------------------
 * camera.js
 * 
 * Made by shash7
 * https://github.com/shash7/camera
 * 
 * Licensed under the MIT license
 * 
 * Api usage :
 * 
 * var camera = new Camera();
 * camera.start();
 * camera.snap();
 * camera.stop();
 * ---------------------------------------------------------------- */





;(function(window, document, undefined) {
	
	'use strict';
	
	function camera(opts) {
		opts = opts || {};
		
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
		var snapButton;
		var container;
		var hidden;
		var closeButton;
		
		// Canvas contexts
		var ctx;
		var hiddenCtx;
		
		// Options
		var onSuccess     = null;
		var onError       = null;
		var onSnap        = null;
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
			console.log(opts);
			onSuccess     = opts.onSuccess     || null;
			onError       = opts.onError       || null;
			onSnap        = opts.onSnap        || null;
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
			snapButton = document.createElement('div');
			snapButton.className = 'camera-snap-button';
			closeButton = document.createElement('button');
			closeButton.className = 'camera-close-button icon-cross';
			container.appendChild(closeButton);
			container.appendChild(snapButton);
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
			snapButton.addEventListener('click', takePhoto, false);
			closeButton.addEventListener('click', stop, false);
		}
		
		function unbindListners() {
			video.removeEventListener('play', drawVideo, false);
			snapButton.removeEventListener('click', takePhoto, false);
			closeButton.removeEventListener('click', stop, false);
		}
		
		function takePhoto(e) {
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
				ctx.drawImage(video, 0, 0, previewWidth * invert, previewHeight );
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
		function start() {
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
			console.log(onSnap);
			if(onSnap) {
				onSnap(dataURL);
			}
			return dataURL;
		}
		
		function stop() {
			unbindListners();
			
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
		}

		
		return {
			snap  : snap,

			start : start,
			stop  : stop
		};
		
	}
	
	window.Camera = camera;
	
})(window, document);