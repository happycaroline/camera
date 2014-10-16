
/* ----------------------------------------------------------------
 * camera.js
 * 
 * Made by shash7
 * https://github.com/shash7/camera
 * 
 * Licensed under the MIT license
 * ---------------------------------------------------------------- */

;(function(window, document, undefined) {
	
	'use strict';
	
	function camera(opts) {
		
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
		}
		
		return {
			snap  : snap,
			start : start
		}
		
	}
	
	window.Camera = camera;
	
})(window, document);