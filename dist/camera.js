
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
		var permission    = false;
		var api           = false;
		var localStream   = null;
		var active        = false;
		var filters       = {};
		var currentFilter = 'grayscale';
		var timer         = null;
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
		
		// Default filters
		filters.grayscale = function(img) {
			var d = img.data;
			for (var i=0; i<d.length; i+=4) {
				var r = d[i];
				var g = d[i+1];
				var b = d[i+2];
				// CIE luminance for the RGB
				// The human eye is bad at seeing red and blue, so we de-emphasize them.
				var v = 0.2126*r + 0.7152*g + 0.0722*b;
				d[i] = d[i+1] = d[i+2] = v;
			}
			return img;
		};
		
		filters.brightness = function(img, adjustment) {
			adjustment = adjustment || 50;
			var d = img.data;
			for (var i=0; i<d.length; i+=4) {
				d[i] += adjustment;
				d[i+1] += adjustment;
				d[i+2] += adjustment;
			}
			return img;
		};
		
		
	 /* ----------------------------------------------------------------
		* private functions
		* ---------------------------------------------------------------- */
		function setOptions(opts) {
			onSuccess     = opts.onSuccess || null;
			onError       = opts.onError   || null;
			onSnap        = opts.onSnap    || null;
			currentFilter = opts.filter    || '';
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
			localStream = stream;
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
			
			var invert = 1;
			if(mirror) {
				ctx.scale(-1,1);
				invert = -1;
			}
			// Every 33 milliseconds copy the video image to the canvas
			timer = setInterval(function() {
				// This try-catch block is only for firefox
				try {
					ctx.drawImage(video, 0, 0, previewWidth * invert, previewHeight);
					
					
					// TODO add proper support for covulated filters
					var arr = [ 1/9,1/9, 1/9,
										 1/9, 1/9, 1/9,
										 1/9, 1/9, 1/9];
					// applyConvolutedFilter(imageData, arr, ctx);
					if(currentFilter) {
						var imageData = ctx.getImageData(0,0,previewWidth,previewHeight);
						applyFilter(imageData, ctx);
					}
				} catch (e) {
					if (e.name == "NS_ERROR_NOT_AVAILABLE") {
						// Wait for sometime then draw again, courtesy of firefox.
						// Taken from http://stackoverflow.com/questions/18580844/firefox-drawimagevideo-fails-with-ns-error-not-available-component-is-not-av
						// Also, overrides fps
						// Also, inverting won't work for firefox
						mirror = false;
						setTimeout(drawVideo, 500);
					} else {
						throw e;
					}
				}
				
			}, fps);
			
		}
		
		function applyFilter(img, context) {
			var imageData = filters[currentFilter](img);
			context.putImageData(imageData, 0, 0);
		}
		
		function applyConvolutedFilter(img, weights, context, opaque) {
			var side = Math.round(Math.sqrt(weights.length));
			var halfSide = Math.floor(side/2);
			var src = img.data;
			var sw = img.width;
			var sh = img.height;
			// pad output by the convolution matrix
			var w = sw;
			var h = sh;
			var output = img;
			var dst = output.data;
			// go through the destination image pixels
			var alphaFac = opaque ? 1 : 0;
			for (var y=0; y<h; y++) {
				for (var x=0; x<w; x++) {
					var sy = y;
					var sx = x;
					var dstOff = (y*w+x)*4;
					// calculate the weighed sum of the source image pixels that
					// fall under the convolution matrix
					var r=0, g=0, b=0, a=0;
					for (var cy=0; cy<side; cy++) {
						for (var cx=0; cx<side; cx++) {
							var scy = sy + cy - halfSide;
							var scx = sx + cx - halfSide;
							if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
								var srcOff = (scy*sw+scx)*4;
								var wt = weights[cy*side+cx];
								r += src[srcOff] * wt;
								g += src[srcOff+1] * wt;
								b += src[srcOff+2] * wt;
								a += src[srcOff+3] * wt;
							}
						}
					}
					dst[dstOff] = r;
					dst[dstOff+1] = g;
					dst[dstOff+2] = b;
					dst[dstOff+3] = a + alphaFac*(255-a);
				}
			}
			context.putImageData(output, 0, 0);
		}
		
		function successCallback(stream) {
			
			if (typeof onSuccess === "function") {
				onSuccess(stream);
			} else {
				createNodes();
				bindListners();
				ctx = canvas.getContext('2d');
				
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
			if(active) {
				console.log(active);
			}
			if(active === false) { // Weird, eh?
				var result = hasGetUserMedia();
				if(result) {
					setOptions(opts);
					navigator.getUserMedia(resource, successCallback, errorCallback);
					active = true;
				} else {
					return false;
				}
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
			
			if(currentFilter) {
				var imageData = hiddenCtx.getImageData(0,0,video.videoWidth,video.videoHeight);
				applyFilter(imageData, hiddenCtx);
			}
			
			var dataURL = hidden.toDataURL();
			if(onSnap) {
				onSnap(dataURL);
			}
			console.log(dataURL);
			return dataURL;
		}
		
		function stop() {
			
			clearInterval(timer);
			
			unbindListners();
			
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
			localStream.stop();
			active = false;
		}

		
		return {
			snap  : snap,

			start : start,
			stop  : stop
		};
		
	}
	
	window.Camera = camera;
	
})(window, document);