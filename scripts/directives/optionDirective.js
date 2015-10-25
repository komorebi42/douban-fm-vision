/**
 * @ngdoc function
 * @name musicboxApp.directive:optionDirective
 * @description
 * # optionDirective
 * Directive of the musicboxApp
 */
'use strict';
// ng-option, [bind on option div]
angular.module('musicboxApp')
    .directive('ngOption', [function () {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'views/option.html',
            // link: function (scope, iElement, iAttrs) {
            // }
        };
    }]);