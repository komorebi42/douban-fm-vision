/**
 * @ngdoc function
 * @name musicboxApp.controller:NavTabsCtrl
 * @description
 * # NavTabsCtrl
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('NavTabsController', ['$scope', '$location', 'expandService', function ($scope, $location, expandService) {
    	$scope.btnStatus = {
    		'expanded': false,
    	};

        $scope.isActive = function(route) {
            return route === $location.path();
        };

        $scope.expandPlayer = function() {
        	$scope.showbtn = !$scope.showbtn;
        	$scope.btnStatus.expanded = !$scope.btnStatus.expanded;
        	// expandService.setExpandStatus($scope.btnStatus.expand);
        	$scope.btnStatus.expanded ? $scope.$emit('setExpand', {'value': true}) : $scope.$emit('setExpand', {'value': false});
        };
    }]);

// do not repeat click the button frequently
angular.module('musicboxApp')
	.directive('ngForbidrepeat', [function () {
		return {
			restrict: 'A',
			link: function (scope, iElement, iAttrs) {
				var clickcount = 0;
				iElement.bind('click', function() {
					clickcount ++;

				});
			}
		};
	}])