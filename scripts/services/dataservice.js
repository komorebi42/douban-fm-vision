/**
 * @ngdoc service
 * @name musicboxApp.MusicDataService
 * @description
 * # MusicDataService
 * Service in the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .service('MusicDataService',['$http', '$log', '$q', '$cacheFactory', 'appConstant',
    function MusicDataService($http, $log, $q, $cacheFactory, appConstant) {

        var self = this;
        self.MusicDataCache = $cacheFactory('MusicData');

        this.getChannels = function() {
            var jsonUrl = appConstant.doubanChannelUrl;

            return this.getMusicData(jsonUrl);
        };

        this.getMusicData = function(url) {
            $log.debug('About to retrieve data for: ' + url);
            var cachedData = self.MusicDataCache.get(url);

            var deferred = $q.defer();

            var cacheBust = '';
            if (!appConstant.useBrowserCache) {
                cacheBust = '&rm=' + Math.random();
            }

            if ((!cachedData) || (cachedData.timestamp <= (new Date()).getTime() - appConstant.cacheExpiryPeriodMs)) {
                var aPromise;
                if (corsCapable){
                    $log.debug('CORS is supported');
                    aPromise = $http.get(url, {cache: appConstant.useBrowserCache});
                } else {
                    $log.debug('CORS is not supported');
                    aPromise = $http.jsonp(url + '&callback=JSON_CALLBACK');
                }

                aPromise.success(function(data) {
                    $log.debug('Cache miss - data retrieved OK by http');
                    self.MusicDataCache.put(url, {
                        timestamp: (new Date()).getTime(),
                        theData: data
                    });
                    deferred.resolve(data);
                }).error(function(response) {
                    $log.debug('Cache miss - failed to retriev data by http');
                    deferred.reject(response);
                });
            } else {
                $log.debug('Cache hit - data returned from cache');
                deferred.resolve(cachedData.theData);
            }

            return deferred.promise;
        };

        function corsCapable() {
            var browserSupportsCors = false;
            var aRequest = new XMLHttpRequest();
            if ('withCredentials' in aRequest) {
                browserSupportsCors = true;
            }
            return browserSupportsCors;
        }

    }]);
