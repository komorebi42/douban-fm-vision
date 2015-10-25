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
		$scope.tabs = ['setting', 'update', 'about'];
		$scope.selection = $scope.tabs[0];
		
	}]);