/**
 * @ngdoc function
 * @name musicboxApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the musicboxApp
 */

'use strict';
angular.module('musicboxApp')
	.controller('MainController', ['$scope', 'userSettingService', function ($scope, userSettingService) {
		$scope.systemSetting = {
			'isLoading': false,
            'weberror': false,
            'expanded': false,
            'hidedpannel': false,
            'frontCaption': userSettingService.getFrontCaption() ? userSettingService.getFrontCaption() : false,
            'displayCaption': false
  		};

		$scope.userSetting = {
			'goodluck':  userSettingService.getGoodLuck() || 1,
			'goodluckToggle': false,
			'captionAlways': userSettingService.getDisplayCaption() === '11' ? true : false,
			'captionFirst': userSettingService.getDisplayCaption() === '10' ? true : false,
			'captionFullscreen': userSettingService.getDisplayCaption() === '01' ? true : false,
			'captionNone': userSettingService.getDisplayCaption() === '00' ? true : false,
			'axisNone': userSettingService.getAxisSetting() ? userSettingService.getAxisSetting() : false,
			'notifyNone': userSettingService.getNotifySetting() ? userSettingService.getNotifySetting() : false
		};

		$scope.checkCaptionStatus = function() {
			switch(userSettingService.getDisplayCaption()) {
				case '11':
					$scope.userSetting.captionAlways = true;
					$scope.systemSetting.displayCaption = true;
					$scope.userSetting.captionFirst = false;
					$scope.userSetting.captionFullscreen = false;
					$scope.userSetting.captionNone = false;
					break;
				case '10':
					$scope.userSetting.captionFirst = true;
					if (!$scope.systemSetting.expanded) {
						$scope.systemSetting.displayCaption = false;
					} else {
						$scope.systemSetting.displayCaption = true;
					}
					$scope.userSetting.captionAlways = false;
					$scope.userSetting.captionFullscreen = false;
					$scope.userSetting.captionNone = false;
					break;
				case '01':
					$scope.userSetting.captionFullscreen = true;
					if ($scope.systemSetting.expanded) {
						$scope.systemSetting.displayCaption = true;
					} else {
						$scope.systemSetting.displayCaption = false;
					}
					$scope.userSetting.captionAlways = false;
					$scope.userSetting.captionFirst = false;
					$scope.userSetting.captionNone = false;
					break;
				case '00':
					$scope.userSetting.captionNone = true;
					$scope.systemSetting.displayCaption = false;
					$scope.userSetting.captionAlways = false;
					$scope.userSetting.captionFirst = false;
					$scope.userSetting.captionFullscreen = false;
					break;
			}
		};

		// fullscreen the player
        $scope.expandPlayer = function() {
        	if ($scope.systemSetting.hidedpannel === false) {
        		$scope.systemSetting.expanded = !$scope.systemSetting.expanded;
        		if ($scope.userSetting.captionFirst) {
					// $scope.systemSetting.expanded ? $scope.systemSetting.displayCaption = false : $scope.systemSetting.displayCaption = true;
					if ($scope.systemSetting.expanded) {
						$scope.systemSetting.displayCaption = false;
					} else {
						$scope.systemSetting.displayCaption = true;
					}
				}
				if ($scope.userSetting.captionFullscreen) {
					// $scope.systemSetting.expanded ? $scope.systemSetting.displayCaption = true : $scope.systemSetting.displayCaption = false;
					if ($scope.systemSetting.expanded) {
						$scope.systemSetting.displayCaption = true;
					} else {
						$scope.systemSetting.displayCaption = false;
					}
				}
        	}
        };

        // enter user setting
        $scope.enterSetting = function() {
        	$scope.systemSetting.hidedpannel = !$scope.systemSetting.hidedpannel;
        	$scope.$broadcast('SettingMode', $scope.systemSetting.hidedpannel);
        };

        // front set or close or display caption
        $scope.frontCaption = function() {
        	// $scope.systemSetting.frontCaption ? $scope.systemSetting.frontCaption = false : $scope.systemSetting.frontCaption = true;
        	//
        	if (!$scope.systemSetting.displayCaption) {
        		$scope.systemSetting.displayCaption = true;
        		$scope.systemSetting.frontCaption = false;
        		userSettingService.setFrontCaption(false);

				$scope.userSetting.captionAlways = true;
        		$scope.userSetting.captionFirst = false;
				$scope.userSetting.captionFullscreen = false;
				$scope.userSetting.captionNone = false;
				userSettingService.setDisplayCaption('11');
        	} else if (!$scope.systemSetting.frontCaption) {
        		$scope.systemSetting.frontCaption = true;
        		userSettingService.setFrontCaption(true);
        	} else if ($scope.systemSetting.frontCaption) {
        		$scope.systemSetting.displayCaption = false;

        		$scope.userSetting.captionNone = true;
				$scope.userSetting.captionAlways = false;
				$scope.userSetting.captionFirst = false;
				$scope.userSetting.captionFullscreen = false;
				userSettingService.setDisplayCaption('00');
        	}
        };

        // always display caption  11
		$scope.captionAlways = function() {
			$scope.userSetting.captionAlways = !$scope.userSetting.captionAlways;
			if ($scope.userSetting.captionAlways) {
				$scope.systemSetting.displayCaption = true;
				$scope.userSetting.captionFirst = false;
				$scope.userSetting.captionFullscreen = false;
				$scope.userSetting.captionNone = false;
				userSettingService.setDisplayCaption('11');
			}
		};

		// only display caption on first page  10
		$scope.captionFirst = function() {
			$scope.userSetting.captionFirst = !$scope.userSetting.captionFirst;
			if ($scope.userSetting.captionFirst) {
				// $scope.systemSetting.expanded ? $scope.systemSetting.displayCaption = false : $scope.systemSetting.displayCaption = true;
				if ($scope.systemSetting.expanded) {
					$scope.systemSetting.displayCaption = false;
				} else {
					$scope.systemSetting.displayCaption = true;
					userSettingService.setDisplayCaption('10');
				}
				$scope.userSetting.captionAlways = false;
				$scope.userSetting.captionFullscreen = false;
				$scope.userSetting.captionNone = false;
			}
		};

		// only display caption on fullscreen page  01
		$scope.captionFullscreen = function() {
			$scope.userSetting.captionFullscreen = !$scope.userSetting.captionFullscreen;
			if ($scope.userSetting.captionFullscreen) {
				// $scope.systemSetting.expanded ? $scope.systemSetting.displayCaption = true : $scope.systemSetting.displayCaption = false;
				if ($scope.systemSetting.expanded) {
					$scope.systemSetting.displayCaption = true;
					userSettingService.setDisplayCaption('01');
				} else {
					$scope.systemSetting.displayCaption = false;
				}
				$scope.userSetting.captionAlways = false;
				$scope.userSetting.captionFirst = false;
				$scope.userSetting.captionNone = false;
			}
		};

		// donot display caption on all pages  00
		$scope.captionNone = function() {
			$scope.userSetting.captionNone = !$scope.userSetting.captionNone;
			if ($scope.userSetting.captionNone) {
				$scope.systemSetting.displayCaption = false;
				$scope.userSetting.captionAlways = false;
				$scope.userSetting.captionFirst = false;
				$scope.userSetting.captionFullscreen = false;
				userSettingService.setDisplayCaption('00');
			}
		};

		// display axis on the disk
		$scope.axisNone = function() {
			$scope.userSetting.axisNone = !$scope.userSetting.axisNone;
			$scope.$broadcast('axis-not-display', ($scope.userSetting.axisNone));
			userSettingService.setAxisSetting($scope.userSetting.axisNone);
		};

		// close notification on the desktop
		$scope.notifyNone = function() {
			$scope.userSetting.notifyNone = !$scope.userSetting.notifyNone;
			$scope.$broadcast('notification-not-display', ($scope.userSetting.notifyNone));
			userSettingService.setNotifySetting($scope.userSetting.notifyNone);
		};

		// set goodluck
		$scope.setGoodLuck = function() {
			$scope.userSetting.goodluckToggle = !$scope.userSetting.goodluckToggle;
			if ($scope.userSetting.goodluckToggle) {
				$scope.userSetting.goodluck = Math.round(Math.random() * 5);
				userSettingService.setGoodLuck($scope.userSetting.goodluck);
			}
		};

	}]);
// user setting service
angular.module('musicboxApp')
	.service('userSettingService', ['$cookieStore', function ($cookieStore) {
		// save goodluck for the next use
        this.setGoodLuck = function(goodLuck) {
            $cookieStore.put('goodLuck', goodLuck);
        };

        // get goodluck
        this.getGoodLuck = function() {
            return $cookieStore.get('goodLuck');
        };

        // save frontCaption for the next use
        this.setFrontCaption = function(frontCaption) {
            $cookieStore.put('frontCaption', frontCaption);
        };

        // get frontCaption
        this.getFrontCaption = function() {
            return $cookieStore.get('frontCaption');
        };

        // save displayCaption for the next use
        this.setDisplayCaption = function(displayCaption) {
            $cookieStore.put('displayCaption', displayCaption);
        };

        // get displayCaption
        this.getDisplayCaption = function() {
            return $cookieStore.get('displayCaption');
        };

		// save axisNone for the next use
        this.setAxisSetting = function(axisNone) {
            $cookieStore.put('axisNone', axisNone);
        };

        // get axisNone
        this.getAxisSetting = function() {
            return $cookieStore.get('axisNone');
        };

        // save notifyNone for the next use
        this.setNotifySetting = function(notifyNone) {
            $cookieStore.put('notifyNone', notifyNone);
        };

        // get notifyNone
        this.getNotifySetting = function() {
            return $cookieStore.get('notifyNone');
        };
	}]);