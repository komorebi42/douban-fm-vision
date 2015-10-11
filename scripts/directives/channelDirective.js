/**
 * @ngdoc function
 * @name musicboxApp.directive:channelDirective
 * @description
 * # channelDirective
 * Directive of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
	.directive('showCid', [function () {
		return {
			restrict: 'A',
			scope: {
				setSelect: '&',
				showSelect: '&'
			},
			required: 'ChannelListController',
			link: function (scope, iElement, iAttrs, ChannelListController) {
					
			}
		};
	}]);