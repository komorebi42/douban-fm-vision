/**
 * @ngdoc function
 * @name musicboxApp.directive:spinDirective
 * @description
 * # spinDirective
 * Directive of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
	.directive('spinDirective', [function () {
		return {
			restrict: 'A',
			link: function (scope, iElement, iAttrs) {
				iElement.bind('click', function() {
					//$animate.addClass(iElement, 'spin');
				});
			}
		};
	}])
	.animation('spin', function() {
		var zdeg = 360;
	});