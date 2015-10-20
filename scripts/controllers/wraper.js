/**
 * @ngdoc function
 * @name musicboxApp.controller:WraperController
 * @description
 * # WraperController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
	.controller('WraperController', ['$scope', function ($scope) {
		$scope.music = {
			'coffee': false
		};

	}]);