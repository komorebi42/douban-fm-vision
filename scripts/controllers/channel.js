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
        $scope.redchl = []; //red heart, personal
        $scope.styles = []; //display_text, bg_color, layout_type, bg_image
        $scope.favChlIds = []; // array only channel id
        $scope.updateFavFlag = false;
        $scope.status.loginFreshChls = false;


        $scope.chlSelected = function(chlId, chlName) {
            if (chlService.chlSelected(chlId, chlName)) {
                $scope.$emit('chlSelected');
            }
        };

        $scope.showSelected = function(chlId) {
            return chlService.showSelected(chlId);
        };

        $scope.initChannels = function() {
            $scope.systemSetting.isLoading = true;
            $scope.loadChannels();
        };

        // update all the channels after user loged in
        $scope.$on('update-channels-from-music-controller', function(e,msg) {
            if (!$scope.status.loginFreshChls) {
                if (msg.content === 'loged-in') {
                    $scope.loadChannels();
                    $scope.status.loginFreshChls = true;
                }
            }
        });
        // $scope.$broadcast('updateChls', {'msg': 'loged in'});

        // initial load channels
        $scope.loadChannels = function() {
            chlService.getChannels()
                .then(function(data) {
                        $scope.groups = data.groups;
                        $scope.redchl = data.groups[0].chls;
                        if (loginService.getLogStatus() && $scope.groups[0].chls.length <= 3) {
                            $scope.loadFavChannels();
                        } else {
                            $scope.systemSetting.isLoading = false;
                        }
                    },
                    function() {
                        $scope.systemSetting.weberror = true;
                        $scope.systemSetting.isLoading = false;
                    }
                );
        };

        // load users favorite channels
        $scope.loadFavChannels = function() {
            chlService.getFavChannels()
                .then(function(data) {
                    var favChls = data.channels;
                    $scope.favChlIds = [];
                    // angular.forEach($scope.groups[0].chls, function(v) {
                    //     $scope.groups[0].chls.pop(v);
                    // });
                    // angular.forEach($scope.redchl, function(v) {
                    //     $scope.groups[0].chls.push(v);
                    // });

                    angular.forEach(favChls, function(v) {
                        $scope.groups[0].chls.push(v);
                        $scope.favChlIds.push(v.id);
                    });
                    $scope.systemSetting.isLoading = false;
                },function(reason) {
                    $scope.systemSetting.weberror = true;
                    $scope.systemSetting.isLoading = false;
                    window.console.log('get FAV CHLS REJECTED:', reason);
                }
            );
        };

        // watch a flag to trigger update favorite channels
        // $scope.$watch($scope.updateFavFlag, function(newValue) {
        //     if (newValue) {
        //         $scope.loadChannels();
        //     }
        // });

        // show the fav or unfav icon
        $scope.showFavedChl = function(chlId, groupId, chlName) {
            var star = false;
            if (groupId < 1) {
                star = true;
            } else if ($scope.favChlIds) {
                var index = $scope.favChlIds.indexOf(chlId);
                if (index !== -1) {
                    star = true;
                }
            }
            // if (!!star) {console.log('stared chls:', chlName);};
            return star;
        };

        // favorite or unfavorite the selected channel
        $scope.starSelected = function(cid, group_id) {
            $scope.status.signed = loginService.getLogStatus();
            if (!$scope.status.signed) {
                $scope.inform.notiflag = true;
                $scope.inform.favpop = true;
            } else {
                $scope.doFavChannel(cid, group_id);
            }
        };

        // check chl whether favorited
        $scope.doFavChannel = function(cid, group_id) {
            $scope.updateFavFlag = false;
            var uk = loginService.getuid();
            if (uk) {
                chlService.getFavChannelStatus(uk, cid)  // is favorite already
                .then(function(data) {
                    if (data.status) {
                        var status = data.data.res.is_fav;
                        if (status) {
                            // unfavorite the selected channel
                            chlService.unFavChannel(cid).then(function(data) {
                                if (data.status && data.data.res === 1) {
                                    $scope.updateFavFlag = $scope.modifyChls(cid, group_id, 'remove');
                                    // $scope.groups = [];
                                    // $scope.loadChannels();
                                    // $scope.updateFavFlag = true;
                                }
                            }, function(reason) {
                                    window.console.log('unFav-Channel request REJECTED', reason);
                                });
                        } else {
                            // favorite the selected channel
                            chlService.favChannel(cid).then(function(data) {
                                if (data.status && data.data.res === 1) {
                                    $scope.updateFavFlag = $scope.modifyChls(cid, group_id, 'add');
                                    // $scope.groups = [];
                                    // $scope.loadChannels();
                                    // $scope.updateFavFlag = true;
                                }
                            }, function(reason) {
                                window.console.log('fav-Channel request REJECTED', reason);
                            });
                        }
                    }
                });
            }
        };

        // modify the chls list
        $scope.modifyChls = function(cid, group_id, type) {
            var modifyFlag = false;
            if (type === 'add') {
                if (group_id !== 0) {
                    angular.forEach($scope.groups[group_id].chls, function(v, k, a) {
                        if (v.id === cid) {
                            $scope.groups[0].chls.push(a[k]);
                            $scope.favChlIds.push(cid);
                            modifyFlag = true;
                            // $scope.groups[0].chls.splice(-1, 0, a[k]);  // add 
                            // $scope.favChlIds.splice(-1, 0, cid);
                        }
                    });
                } else {
                    // should be removed ... 
                }
            } else if (type === 'remove') {
                angular.forEach($scope.groups[0].chls, function(v, k) {
                    if (v.id === cid) {
                        $scope.groups[0].chls.splice(k, 1);  // removing
                        $scope.modifyFlag = true;
                    }
                });
                angular.forEach($scope.favChlIds, function(v, k) {
                    if (v === cid) {
                        $scope.favChlIds.splice(k, 1);
                        $scope.modifyFlag = true;
                    }
                });
            }
            return modifyFlag;
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
                if (self.chlId) {
                    return self.chlId;
                } else {
                    if (window.localStorage) {
                        return localStorage.getItem('chlId') ? localStorage.getItem('chlId') : '2';
                    } else {
                        return ($cookieStore.get('chlId') ? $cookieStore.get('chlId') : '2');
                    }
                }
                // return (self.chlId ? self.chlId : ($cookieStore.get('chlId') ? $cookieStore.get('chlId') : '2'));  // 155 舒缓
            } else {
                return 0; // personal MHz
            }
        };

        this.getChlName = function() {
            if (self.chlName) {
                return self.chlName;
            } else {
                if (window.localStorage) {
                    return localStorage.getItem('chlName') ? localStorage.getItem('chlName') : '欧美';
                } else {
                    return ($cookieStore.get('chlName') ? $cookieStore.get('chlName') : '欧美');
                }
            }
            // return (self.chlName ? self.chlName : ($cookieStore.get('chlName') ? $cookieStore.get('chlName') : '欧美'));  // 155 舒缓
        };

        this.setChannels = function(Id, Name) {
            if (window.localStorage) {
                localStorage.setItem('chlId', Id);
                localStorage.setItem('chlName', Name);
            }
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

        // get all chls to play
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

        // get the favorite chls list
        this.getFavChannels = function() {
            var url = 'http://douban.fm/j/fav_channels';  //?ck=' + ck;
            return this.deferPromise(url);
            // /j/explore/get_fav_chl  ?ofavs= cid | cid(recently listened chls and fav chls had added)
            // /j/explore/get_fav_chl?ofavs=1004355|1000740|1001609|1003949
        };

        // unfavorite the selected chl
        this.unFavChannel = function(cid) {
            var url = 'http://douban.fm/j/explore/unfav_channel?cid=' + cid;
            return this.deferPromise(url);
            // {
            //     status: true,
            //     data: {
            //         res: 1
            //     }
            // }
        };

        // favorite the selected chl
        this.favChannel = function(cid) {
            var url = 'http://douban.fm/j/explore/fav_channel?cid=' + cid;
            return this.deferPromise(url);
            // {
            //     status: true,
            //     data: {
            //         res: 1
            //     }
            // }
        };

        // is favorite channel
        this.getFavChannelStatus = function(uk, cid) {
            var url = 'http://douban.fm/j/explore/is_fav_channel?uk=' + uk + '&cid=' + cid;
            // http://douban.fm/j/explore/is_fav_channel?uk=64965813&cid=1003949  uk=userid
            return this.deferPromise(url);
            // {
            //     status: true,
            //     data: {
            //         res: {
            //             is_fav: true
            //         }
            //     }
            // }
        };

        // defer promise
        this.deferPromise = function(url) {
            var deferred = $q.defer();
            var thePromise = $http.get(url, {responseType: 'json'});
            thePromise.success(function(result) {
                deferred.resolve(result);
            }).error(function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

    }]);
