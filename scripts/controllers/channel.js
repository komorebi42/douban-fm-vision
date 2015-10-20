/**
 * @ngdoc function
 * @name musicboxApp.controller:ChannelListController
 * @description
 * # ChannelListController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('ChannelListController', ['$scope', '$http', 'chlService', 'loginService', function($scope, $http, chlService, loginService) {
        $scope.chls = []; //chls.style{}, chls.intro, chls.name, chls.song_num, chls.collected, chls.cover, chls.id
        $scope.groups = []; //group_id, group_name
        $scope.groupsChl = []; //group_id, group_name
        $scope.styles = []; //display_text, bg_color, layout_type, bg_image
        $scope.favchls = [];
        $scope.favChlId = [];
        $scope.userfav = {
            'fav': false
        };

        $scope.chlSelected = function(chlId, chlName) {
            if (chlService.chlSelected(chlId, chlName)) {
                $scope.$emit('chlSelected');
            }
        };

        $scope.showSelected = function(chlId) {
            return chlService.showSelected(chlId);
        };

        $scope.favOrUnfavSelected = function(chlId, chlName, group_id) {
            $scope.status.signed = loginService.getLogStatus();
            if (!$scope.status.signed) {
                $scope.inform.notiflag = true;
                $scope.inform.favpop = true;
            }

            var alreadyFav = $scope.showFavChl(chlId);
            if (alreadyFav) {
                // unfav
                chlService.unFavChannel(chlId).then(
                    function(data) {
                        if (data.status == 1) {
                            angular.forEach($scope.favchls, function(v, k, a) {
                                if (chlId == v.id) {
                                    a.splice(k, 1);  // delete the unfavorated chlid
                                } else {
                                    $scope.groupsChl[0].chls.push(v);
                                }
                            });
                            $scope.groups = $scope.groupsChl;  // rebuild groups then refresh UI
                        }
                    }, function(reason) {
                        window.console.log('unFavChannel request REJECTED');
                    });
            } else {
                // fav
                chlService.favChannel(chlId).then(
                    function(data) {
                        if (data.status == 1) {
                            angular.forEach($scope.groups[group_id].chls, function(v, k, a) {
                                if (chlId === v.id) {
                                    $scope.favchls.push(v);  // push the favorated chlid
                                    $scope.groupsChl[0].chls.push(v);
                                }
                            });
                            $scope.groups = $scope.groupsChl;  // rebuild groups then refresh UI
                        }
                    }, function(reason) {
                        window.console.log('favChannel request REJECTED');
                    });
            }
        };

        $scope.showFavChl = function(chlId) {
            // if ($scope.favChlId.find(chlId)){    // find is new in ECMAScript 6.0
            //     return true;
            // } else {
            //     return false;
            // }
            var status = false;
            angular.forEach($scope.favChlId, function(v, k, a) {
                if (v === chlId) {
                    status = true;
                }
            });
            return status;
        };

        $scope.loadChannels = function() {
            $scope.status.isLoading = true;

            chlService.getChannels()
                .then(
                    function(data) {
                        // window.console.log(data);
                        $scope.groupsChl = data.groups;
                        if (loginService.getLogStatus()) {
                            $scope.loadFavChannels();
                        } else {
                            $scope.groups = $scope.groupsChl;
                            $scope.status.isLoading = false;
                        }
                        // $scope.status.isLoading = false;
                    },
                    function() {
                        $scope.dataRetrievalError = true;
                        $scope.status.isLoading = false;
                    }
                );
        };

        // load users favorate channels 
        $scope.loadFavChannels = function() {
            if (loginService.getLogStatus()) {
                chlService.getFavChannels()
                    .then(
                        function(data) {
                            $scope.favchls = data.channels;
                            angular.forEach(data.channels, function(v, k, a) {
                                $scope.groupsChl[0].chls.push(v);
                                $scope.favChlId.push(v.id);
                            });
                            $scope.groups = $scope.groupsChl;
                            $scope.status.isLoading = false;
                        },function(reason) {
                            $scope.dataRetrievalError = true;
                            $scope.status.isLoading = false;
                            window.console.log('FAV CHLS REJECTED:', reason);
                        }
                    );
            }
        };

    }]);

// channel service
angular.module('musicboxApp')
    .service('chlService', ['$http', '$q', '$cacheFactory', '$parse', '$cookieStore', 'appConstants', function($http, $q, $cacheFactory, $parse, $cookieStore, appConstants) {
        var self = this;
        self.ChannelsListCache = $cacheFactory('ChannelsList');
        self.chlId = '';
        self.chlName = '';

        this.getChlId = function() {
            if (self.chlId !== 0) {
                return (self.chlId ? self.chlId : ($cookieStore.get('chlId') ? $cookieStore.get('chlId') : '155'));
            } else {
                return 0; // personal MHz            
            }
        };

        this.getChlName = function() {
            return (self.chlName ? self.chlName : ($cookieStore.get('chlName') ? $cookieStore.get('chlName') : '舒缓'));
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
            return (this.getChlId() === Id);
        };

        this.getChannels = function() {
            var cachedData = self.ChannelsListCache.get(url);
            var deferred = $q.defer();

            var url = 'https://api.douban.com/v2/fm/app_channels'; //'scripts/channels-oauth2.json';
            if ((!cachedData) || (cachedData.timestamp <= (new Date()).getTime() - appConstants.cacheExpiryPeriodMs)) {
                var thePromise = $http.get(url, {
                    cache: appConstants.useBrowserCache,
                    responseType: 'json'
                });
                //var thePromise = $http.jsonp(url2, {cache: appConstants.useBrowserCache, responseType: 'json'});
                thePromise.success(function(result) {
                    self.ChannelsListCache.put(url, {
                        timestamp: (new Date()).getTime(),
                        realData: result
                    });
                    deferred.resolve(result);
                }).error(function(response) {
                    deferred.reject(response);
                });
            } else {
                deferred.resolve(cachedData.realData);
            }
            return deferred.promise;
        };        

        this.getFavChannels = function() {
            var deferred = $q.defer();
            var url = 'http://douban.fm/j/fav_channels';

            var thePromise = $http.get(url, {responseType: 'json'});
            thePromise.success(function(result) {
                deferred.resolve(result);
                //$scope.favchls = result.channels;
                //window.console.log('FAV CHANNELS:', result);
            }).error(function(response) {
                deferred.reject(response);
                //window.console.log('FAV CHL REJECTED REQUEST:', response);
            });
            return deferred.promise;
        };

        this.unFavChannel = function(chlId) {
            var deferred = $q.defer();
            var url = 'http://douban.fm/j/explore/unfav_channel?cid=' + chlId;

            var thePromise = $http.get(url, {responseType: 'json'});
            thePromise.success(function(result) {
                deferred.resolve(result);
            }).error(function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.favChannel = function(chlId) {
            var deferred = $q.defer();
            var url = 'http://douban.fm/j/explore/fav_channel?cid=' + chlId;

            var thePromise = $http.get(url, {responseType: 'json'});
            thePromise.success(function(result) {
                deferred.resolve(result);
            }).error(function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    }]);
