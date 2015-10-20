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
    	$scope.menubtn = {
    		'expanded': false,
    	};

        $scope.isActive = function(route) {
            return route === $location.path(); //ng-class="{active: isActive('/music')}"
        };

        $scope.expandPlayer = function() {
        	if ($scope.music.coffee === false) {
        		$scope.menubtn.expanded = !$scope.menubtn.expanded;
	        	// expandService.setExpandStatus($scope.menubtn.expand);
	        	$scope.menubtn.expanded ? $scope.$emit('setExpand', {'value': true}) : $scope.$emit('setExpand', {'value': false});
        	}
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