/**
 * @ngdoc function
 * @name musicboxApp.controller:AudioController
 * @description
 * # AudioController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
	.controller('AudioController', ['$rootScope', '$scope', function ($rootScope, $scope) {
        $scope.paused = false;
        $scope.menu = {
        	'expand' : false
        };
        
        $scope.initPlay = function() {
            $scope.playMusic('n');
        };

        // $rootScope.$on('setExpand', function(event, attrs) {
        // 	$rootScope.$broadcast('getExpand', attrs);
        // });

        // $scope.$on('getExpand', function(event, attrs) {
        // 	attrs.value ? $scope.menu.expand = true : $scope.menu.expand = false;
        // });

	}]);