/**
 * @ngdoc function
 * @name musicboxApp.controller:NavTabsCtrl
 * @description
 * # NavTabsCtrl
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('NavTabsController', ['$scope', '$location', function ($scope, $location) {
        $scope.isActive = function(route) {
            return route === $location.path();
        };
    }]);