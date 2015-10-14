/**
 * @ngdoc function
 * @name musicboxApp.controller:AudioController
 * @description
 * # AudioController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
	.controller('AudioController', ['$scope', 'UIService', function ($scope, UIService) {
		//$scope.playing = $scope.status.playing;
        //$scope.imguseful = $scope.status.imguseful;
        //$scope.vol = $scope.status.vol;
        //$scope.curtime = $scope.status.curtime;

        $scope.paused = false;
        //$scope.diskImg = $scope.songUI.disk;
        //$scope.audioUrl = $scope.songUI.url;
        
        $scope.initPlay = function() {
            $scope.getCurrPlay('n');
        };

	}]);

angular.module('musicboxApp')
	.service('UIService', [function () {
		var self = this;

		this.scrollTo = function(container, target, offset){
            var ele = angular.element(target);
            angular.element(container).animate({scrollTop: offset}, "slow");
        };
	}]);