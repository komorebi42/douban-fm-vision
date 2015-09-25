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

        //$scope.channels = $rootScope.channels;

        
       	$scope.loadChannels = function(){
       		$scope.isLoading = true;

       		chlService.getChannels()
   			.then(
   				function(data) {
   					console.log(data);
   					$scope.groups = data.groups;
   					$scope.isLoading = false;
   					console.log($scope.channels);
   				},
   				function(){
   					$scope.dataRetrievalError = true;
   					$scope.isLoading = false;
   				}
   			);
       	};

	}])
	.service('chlService',['$http', '$q', '$cacheFactory', '$sce', '$parse', 'appConstants', 
		function($http, $q, $cacheFactory, $sce, $parse, appConstants){
        var self = this;
        self.ChannelsListCache = $cacheFactory('ChannelsList');

        this.getChannels = function(){
        	var url = appConstants.doubanChannelUrl + '?app_name=radio_desktop_win&version=100';
        	//$sce.trustAsResourceUrl(url);
        	var cachedData = self.ChannelsListCache.get(url);
        	var deferred = $q.defer();

        	var url2 = 'https://api.douban.com/v2/fm/app_channels&callback=JSON_CALLBACK';//'scripts/Channels.json';
        	if ((!cachedData) || (cachedData.timestamp <= (new Date()).getTime() - appConstants.cacheExpiryPeriodMs)) {
    			//var thePromise = $http.get(url2, {cache: appConstants.useBrowserCache});
    			var thePromise = $http.jsonp(url2, {cache: appConstants.useBrowserCache, responseType: 'json'});
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
/*
    .run('getChannels', ['$rootScope', '$http', function($rootScope, $http){
        $http({
            method: 'GET',
            url: 'http://www.douban.com/j/app/radio/channels?app_name=radio_desktop_win&version=100&',
        }).success(function(data){
            console.log('Channels get success!');
            $rootScope.Channels = data.channels;
            console.log($rootScope.channels);
        }).error(function(){
            console.log('Getting Channels error.');
            });
    }]);
	

/*
(function init($rootScope,$http){
	$http({
        	method: 'GET',
        	url: 'http://www.douban.com/j/app/radio/channels?app_name=radio_desktop_win&version=100&',
        	dataType: 'json'
        }).success(function(data, status, headers, config){
        	console.log(status);
        	console.log('Channels get success!');
    		$rootScope.Channels = data.channels;
			console.log($rootScope.channels);
        }).error(function(data, status, headers, config){
        	console.log('Getting Channels error.');
        	});
})();
        /*
        var headers = {
        	'Access-Control-Allow-Origin' : 'localhost:8000',
			'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
			'Content-Type': 'application/x-www-form-urlencoded',
        };

        var tempChlList = [];
    	$http({
        	method: 'GET',
        	//headers: headers,
        	//withCredentials: true,
        	url: 'http://www.douban.com/j/app/radio/channels?app_name=radio_desktop_win&version=100&='
        }).success(function(data, status, headers, config){
        	console.log(status);
        	console.log('Channels get success!');
        	if (status === 200) {
        		tempChlList = data.channels;
				console.log(tempChlList);
				return tempChlList;
        	};
        }).error(function(data, status, headers, config){
        	console.log('Getting Channels error.');
        	});
	{
		{"channels":[{"name_en":"Personal Radio","seq_id":0,"abbr_en":"My","name":"私人兆赫","channel_id":0},{"name":"华语","seq_id":0,"abbr_en":"","channel_id":"1","name_en":""},{"name":"欧美","seq_id":1,"abbr_en":"","channel_id":"2","name_en":""},{"name":"七零","seq_id":2,"abbr_en":"","channel_id":"3","name_en":""},{"name":"八零","seq_id":3,"abbr_en":"","channel_id":"4","name_en":""},{"name":"九零","seq_id":4,"abbr_en":"","channel_id":"5","name_en":""},{"name":"粤语","seq_id":5,"abbr_en":"","channel_id":"6","name_en":""},{"name":"摇滚","seq_id":6,"abbr_en":"","channel_id":"7","name_en":""},{"name":"民谣","seq_id":7,"abbr_en":"","channel_id":"8","name_en":""},{"name":"轻音乐","seq_id":8,"abbr_en":"","channel_id":"9","name_en":""},{"name":"原声","seq_id":9,"abbr_en":"","channel_id":"10","name_en":""},{"name":"爵士","seq_id":10,"abbr_en":"","channel_id":"13","name_en":""},{"name":"电子","seq_id":11,"abbr_en":"","channel_id":"14","name_en":""},{"name":"说唱","seq_id":12,"abbr_en":"","channel_id":"15","name_en":""},{"name":"R&B ","seq_id":13,"abbr_en":"","channel_id":"16","name_en":""},{"name":"日语","seq_id":14,"abbr_en":"","channel_id":"17","name_en":""},{"name":"韩语","seq_id":15,"abbr_en":"","channel_id":"18","name_en":""},{"name":"女声","seq_id":16,"abbr_en":"","channel_id":"20","name_en":""},{"name":"法语","seq_id":17,"abbr_en":"","channel_id":"22","name_en":""},{"name":"古典","seq_id":18,"abbr_en":"","channel_id":"27","name_en":""},{"name":"动漫","seq_id":19,"abbr_en":"","channel_id":"28","name_en":""},{"name":"咖啡馆","seq_id":20,"abbr_en":"","channel_id":"32","name_en":""},{"name":"圣诞","seq_id":21,"abbr_en":"","channel_id":"170","name_en":""},{"name":"豆瓣好歌曲","seq_id":22,"abbr_en":"","channel_id":"179","name_en":""},{"name":"世界音乐","seq_id":23,"abbr_en":"","channel_id":"187","name_en":""},{"name":"布鲁斯","seq_id":24,"abbr_en":"","channel_id":"188","name_en":""},{"name":"新歌","seq_id":25,"abbr_en":"","channel_id":"61","name_en":""},{"name":"雷鬼","seq_id":26,"abbr_en":"","channel_id":"190","name_en":""},{"name":"新青年","seq_id":27,"abbr_en":"","channel_id":"196","name_en":""},{"name":"世界杯","seq_id":28,"abbr_en":"","channel_id":"201","name_en":""},{"name":"小清新","seq_id":29,"abbr_en":"","channel_id":"76","name_en":""},{"name":"Easy ","seq_id":30,"abbr_en":"","channel_id":"77","name_en":""},{"name":"91.1 ","seq_id":31,"abbr_en":"","channel_id":"78","name_en":""},{"name":"“砖”属音乐","seq_id":32,"abbr_en":"","channel_id":"145","name_en":""},{"name":"Pop","seq_id":33,"abbr_en":"","channel_id":"194","name_en":""},{"name":"拉丁","seq_id":34,"abbr_en":"","channel_id":"189","name_en":""},{"name":"草莓乐堡酒镇","seq_id":35,"abbr_en":"","channel_id":"245","name_en":""},{"name":"GAP 独立演绎 乐动初秋","seq_id":36,"abbr_en":"","channel_id":"248","name_en":""},{"name":"这一刻，从轻开始","seq_id":37,"abbr_en":"","channel_id":"250","name_en":""},{"name":"Hollister热辣歌单","seq_id":38,"abbr_en":"","channel_id":"251","name_en":""}]}
	}*/
