/**
 * @ngdoc function
 * @name musicboxApp.controller:AudioController
 * @description
 * # AudioController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
	.controller('AudioController', ['$scope', function ($scope) {
        $scope.paused = false;
        
        $scope.initPlay = function() {
            $scope.playMusic('n');
        };

	}]);