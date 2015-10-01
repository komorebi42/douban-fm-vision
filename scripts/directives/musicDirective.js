/**
 * @ngdoc function
 * @name musicboxApp.directive:musicDirective
 * @description
 * # musicDirective
 * Directive of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .directive('isPlaying', ['playMusicService', function(playMusicService) {
        return {
            restrict: 'A',
            link: function(scope, iElement) {
                scope.toggleflag = false;
                iElement.bind('click', function() {
	                var audio = document.querySelector("#musicAudio");
                    if (!scope.toggleflag) {
                    	scope.$apply(function() {
                        	audio.play();
                        	scope.toggleflag = !scope.toggleflag;
                    	})
                    } else {
                    	scope.$apply(function() {
                    		audio.pause();
                        	scope.toggleflag = !scope.toggleflag;
                    	})
                    }
                });
            }
        };
    }])
    .directive('errImgSrc',['$timeout', function ($timeout) {
    	return {
    		restrict: 'A',
    		link: function (scope, iElement, iAttrs) {
    			iElement.bind('error', function() {
    				if (!iAttrs.src) {
    					$timeout(function() {
	    					iAttrs.$set('src', iAttrs.errImgSrc);
    					}, 2000);
    				}
    			});
    		}
    	};
    }]);
