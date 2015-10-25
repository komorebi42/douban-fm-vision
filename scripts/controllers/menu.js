/**
 * @ngdoc function
 * @name musicboxApp.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('MenuController', ['$scope', '$location', function ($scope, $location) {
        $scope.isActive = function(route) {
            return route === $location.path(); //ng-class="{active: isActive('/music')}"
        };

    }]);

// do not repeat click the button frequently
angular.module('musicboxApp')
	.directive('ngForbidrepeat', [function () {
		return {
			restrict: 'A',
			link: function (scope, iElement) {
				var clickcount = 0;
				iElement.bind('click', function() {
					clickcount ++;

				});
			}
		};
	}]);