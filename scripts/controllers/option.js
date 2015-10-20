/**
 * @ngdoc function
 * @name musicboxApp.controller:OptionController
 * @description
 * # OptionController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
	.controller('OptionController', ['$scope', function ($scope) {
		
		
	}]);

// ng-option
angular.module('musicboxApp')
	.directive('ngOption', [function () {
		return {
			restrict: 'A',
			scope: true,
			templateUrl: 'views/option.html',
			link: function (scope, iElement, iAttrs) {
			}
		};
	}]);