/**
 * @ngdoc function
 * @name musicboxApp.controller:ChannelListController
 * @description
 * # ChannelListController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
	.controller('ChannelListController', ['$scope', '$http', 'chlService', function($scope, $http, chlService){
		$scope.chls = [];  //chls.style{}, chls.intro, chls.name, chls.song_num, chls.collected, chls.cover, chls.id
        $scope.groups = [];  //group_id, group_name
        $scope.styles = [];  //display_text, bg_color, layout_type, bg_image

        $scope.chlSelected = function(chlId, chlName) {
            if (chlService.chlSelected(chlId, chlName)) {
              $scope.$emit('chlSelected');
            }
        };

        $scope.showSelected = function(chlId) {
            return chlService.showSelected(chlId);
        };

       	$scope.loadChannels = function(){
       		$scope.isLoading = true;

       		chlService.getChannels()
       			.then(
       				function(data) {
       					//window.console.log(data);
       					$scope.groups = data.groups;
       					$scope.isLoading = false;
       				},
       				function(){
       					$scope.dataRetrievalError = true;
       					$scope.isLoading = false;
       				}
       			);
       	};

	}]);
  
  // channel service
angular.module('musicboxApp')
	.service('chlService',['$http', '$q', '$cacheFactory', '$parse', '$cookieStore', 'appConstants', function($http, $q, $cacheFactory, $parse, $cookieStore, appConstants){
        var self = this;
        self.ChannelsListCache = $cacheFactory('ChannelsList');
        self.chlId = '155';
        self.chlName = '舒缓';

        this.getChlId = function() {
            return (self.chlId ? self.chlId : $cookieStore.get('chlId'));
        };

        this.getChlName = function() {
            return (self.chlName ? self.chlName : $cookieStore.get('chlName'));
        };

        this.setChannels = function(Id, Name) {
            $cookieStore.put('chlId', Id);
            $cookieStore.put('chlName', Name);
        };

        this.chlSelected = function(Id, Name) {
            if (self.chlId === Id) {
                this.setChannels(Id, Name);
                return false;
            } else {
                self.chlId = Id;
                self.chlName = Name;
                this.setChannels(Id, Name);
                return true;
            }
        };

        this.showSelected = function(Id) {
            return (this.getChlId() == Id);
        };

        this.getChannels = function(){
        	var cachedData = self.ChannelsListCache.get(url);
        	var deferred = $q.defer();

        	var url = 'https://api.douban.com/v2/fm/app_channels';  //'scripts/channels-oauth2.json';
        	if ((!cachedData) || (cachedData.timestamp <= (new Date()).getTime() - appConstants.cacheExpiryPeriodMs)) {
    			var thePromise = $http.get(url, {cache: appConstants.useBrowserCache, responseType: 'json'});
    			//var thePromise = $http.jsonp(url2, {cache: appConstants.useBrowserCache, responseType: 'json'});
    			thePromise.success(function(result){
    				self.ChannelsListCache.put(url, {
    					timestamp: (new Date()).getTime(),
    					realData: result
    				});
    				deferred.resolve(result);
    			}).error(function(response){
    				deferred.reject(response);
    			});
        	} else {
        		deferred.resolve(cachedData.realData);
        	}
        	return deferred.promise;
        };
        
	}]);
