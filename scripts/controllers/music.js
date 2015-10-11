/**
 * @ngdoc function
 * @name musicboxApp.controller:MusicController
 * @description
 * # MusicController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('MusicController', ['$scope', '$filter', 'songsService', 'lyricsService', 'chlService', 'loginService', 'appConstants', '$timeout', function ($scope, $filter, songsService, lyricsService, chlService, loginService, appConstants, $timeout) {
        var self = this;
        self.pt = '';

        $scope.songUrl = 'musics/Like Sunday,Like Rain.mp3';  
        //'http://mr3.douban.com/201308250247/4a3de2e8016b5d659821ec76e6a2f35d/view/song/small/p1562725.mp3';
        //$scope.songs: album, picture, artist, url, title, length, sid, aid, albumtitle, like
        
        $scope.authorize = appConstants.AUTH_HOST + appConstants.AUTHORIZE_URL + '?client_id=' + appConstants.apikey + '&redirect_uri=' + appConstants.REDIRECT_URL + '&response_type=token';

        //请求部分
        //b: bye, sid  long  删除当前曲
        //e: end, sid  short  播放完毕,当前列表还有歌曲  返回ok
        //n: new,      long  返回新播放列表, 换频道
        //p: playing,  long  单曲开始，播放列表空时发送,
        //s: skip, sid  short 下一首,   type=s，跳过歌曲的sid不一定要在h记录里面。
        //r: rate, sid  short 加tag  喜欢
        //u: unlike, sid  short 取消tag  取消喜欢 
        //b,n,p: 都是返回新的播放列表
        //h= sid:[psbr] | sid:[psbr]，避免重复，长度限定20项
        //type= [bnsur],benpsur

        // channel selected
        $scope.$on('chlSelected', function(e) {
            $scope.channel = {
                'chlId': chlService.getChlId(),
                'chlName': chlService.getChlName()
            };
            if ($scope.channel.chlId <= 0) {
                $scope.loged = loginService.getLogStatus();
                if ($scope.loged) {
                    // yidonglu
                    $scope.getCurrPlay('n');
                } else {
                    loginService.checkCookie();
                    if (loginService.getLogStatus()) {
                        // yidenglu
                        $scope.getCurrPlay('n');
                    } else {
                        // popup
                    }
                }
            } else {
                $scope.getCurrPlay('n');
            }
        });

        // initial
        $scope.initPlay = function() {
            $scope.playing = false;
            $scope.vol = 70;
            $scope.imguseful = false;
            $scope.currentTime = '';
            $scope.loged = false;

            $scope.channel = {
                'chlId': chlService.getChlId(),
                'chlName': chlService.getChlName()
            };
            $scope.lyric = {
                'name': '',
                'content': '',
                'valid': false,
                'withTimeStamp': false
            };
            $scope.getCurrPlay('n');
        };

        // new,skip,bye: n,s,b
        $scope.getCurrPlay = function(type) {
            $scope.playing = false;
            $scope.getPlaylist(songsService.getSong().sid, type, chlService.getChlId(), $scope.currentTime);
            $timeout(function(){
                $scope.getNextPlay('p');
            }, 3000);
        };

        // end: e
        $scope.endedSong = function() {
            $scope.playing = false;
            $scope.imguseful = false;

            if (!$scope.songNext) {
                $scope.getCurrPlay('n');
            } else {
                $scope.song = songsService.getSongNext();
                $scope.getLyric();

                $scope.playing = true;
                $scope.imguseful = true;

                songsService.getSongsRaw(songsService.getSong().sid, 'e', chlService.getChlId(), $scope.currentTime)
                    .then(function(data) {
                        window.console.log('song ended:', data);
                    });
                $timeout(function(){
                    $scope.getNextPlay('p');
                }, 3000);
            }
        };

        // playing, rate, unrate: p, r, u
        $scope.getNextPlay = function(type) {
            var pt = $scope.currentTime;
            songsService.getSongsRaw(songsService.getSong().sid, type, chlService.getChlId(), pt)
                .then(function(data) {
                    if (data.r === 0) {
                        songsService.setSongNext(data.song[0]);
                        $scope.songNext = songsService.getSongNext();

                    } else {  // 302 response
                        $timeout(function(){
                            $scope.getNextPlay('p');
                        }, 3000);
                        window.console.log('err:', data.err);
                    }
                }, function(reason) {
                    // 302 response
                    window.console.log('reason:', reason);
                });
        };

        // get songlist
        $scope.getPlaylist = function(sid, type, channel, pt) {
            songsService.getSongsRaw(sid, type, channel, pt)
                .then(function(data) {
                    if (data.r === 0) {
                        songsService.setSong(data.song[0]);
                        $scope.song = songsService.getSong();
                        $scope.getLyric();

                        $scope.playing = true;
                        $scope.imguseful = true;
                    } else if (data.r === 1) {
                        $scope.song = songsService.getSongNext();
                        $scope.getLyric();
                        $timeout(function(){
                            $scope.getNextPlay('p');
                        }, 3000);
                        window.console.log('err:', data.err);
                    }
                }, function(reason) {
                    // 302
                    window.console.log('reason:', reason);
                });
        };

        // get lyrics
        $scope.getLyric = function() {
            lyricsService.getLyrics(songsService.getSong().sid, songsService.getSong().ssid)
                .then(function(data) {
                    if (data.sid) {
                        $scope.lyric.name = data.name;
                        $scope.lyric.content = lyricsService.parseLyrics(data.lyric);
                        $scope.lyric.valid = $scope.lyric.content ? true : false;

                        if ('normal' === lyricsService.getLyricType()) {
                            // only text; normal
                            $scope.lyric.withTimeStamp = false;
                        } else {
                            // timestamp 
                            $scope.lyric.withTimeStamp = true;
                        }
                        window.console.log('request sid-ssid:', songsService.getSong().sid, '+', songsService.getSong().ssid);
                        window.console.log('song sid-ssid:', $scope.song.sid, '+', $scope.song.ssid);
                        window.console.log('lyric content:', $scope.lyric.content);
                        window.console.log('lyric raw:', data.lyric);
                    } else {
                        $scope.lyric.name = ''; //data.code;
                        $scope.lyric.content = ''; //data.msg;
                        $scope.lyric.valid = false;
                    }
                }, function(reason) {
                    $scope.lyric.name = '未发现歌词';
                    window.console.log('未发现歌词 reject:', reason);
                });
        };
    }]);
    
    // get song service
angular.module('musicboxApp')
    .service('songsService',['$http', '$q', '$cookieStore', 'appConstants', function($http, $q, $cookieStore, appConstants){
        var self = this;
        self.songinfo = {};
        self.songnext = {};

        this.setSong = function(song) {
            self.songinfo = song;
            $cookieStore.put('song', song);
        };

        this.getSong = function() {
            return (self.songinfo ? self.songinfo : $cookieStore.get('song'));
        };

        this.setSongNext = function(song) {
            self.songnext = song;
            $cookieStore.put('songnext', song);
        };

        this.getSongNext = function() {
            return (self.songnext ? self.songnext : $cookieStore.get('songnext'));
        };

        this.getSongsRaw = function(sid, type, channel, pt) {
            sid = sid || '';
            type = type || 'e';
            channel = channel || '0';
            pt = (type == 'p') ? '0.0' : (pt || '0.0');
            var pb = this.getSong().kbps || '128';
            var rd = this.getRandom();

            var url = 'http://douban.fm/j/mine/playlist?'  + '&type=' + type + '&sid=' + sid + '&pt=' + pt + '&channel=' + channel + '&pb=' + pb + '&from=mainsite&r=' + rd;
            window.console.log('new request, type:', type, ':', url);
            var deferred = $q.defer();
            var thePromise = $http.get(url, {cache: appConstants.useBrowserCache, responseType: 'json'});
            thePromise.success(function(result){
                deferred.resolve(result);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.getRandom = function() {
            var num = '1234567890abcdef', random = '';
            for (var i = 0; i < 10; i++) {
                random += num.charAt(Math.floor(Math.random() * 16));
            }
            return random;  
        };

    }]);
    
    // login service
angular.module('musicboxApp')
    .service('loginService', [function () {
        var self = this;
        self.loged = false;

        this.getLogStatus = function() {
            return self.loged;
        };

        this.checkCookie = function() {
            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'dbcl2'
            }, function(result) {
                if (result) {
                    chrome.cookies.set({
                        url: 'http://douban.fm',
                        name: 'dbcl2',
                        value: result.value
                    });
                    self.loged = true;
                } else {
                    self.loged = false;
                }
            });

            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'ck'
            }, function(result) {
                if (result) {
                    chrome.cookies.set({
                        url: 'http://douban.fm',
                        name: 'ck',
                        value: result.value
                    });
                }
            });
        };
    }]);

    // lyrics service
angular.module('musicboxApp')
    .service('lyricsService', ['$http', '$q', 'appConstants', function ($http, $q, appConstants) {
        var self = this;
        self.lyrictype = 'normal';

        this.getLyricType = function() {
            return self.lyrictype;
        };

        this.getLyrics = function(sid, ssid) {
            var sid1 = '1563351';
            var ssid1 = '80b3';
            var url = 'http://api.douban.com/v2/fm/lyric?'  + 'sid=' + sid1 + '&ssid=' + ssid1; // + '&apikey=' + '02646d3fb69a52ff072d47bf23cef8fd' + '&app_name=douban_fm_iphone_3.0&sdkVersion=1.9.0&did=d1d5754d8b077285fe85581feafabc82'; //appConstants.apikey + '&version=630&app_name=radio_android';
            window.console.log(url);
            var deferred = $q.defer();
            var thePromise = $http.get(url, {cache: appConstants.useBrowserCache, responseType: 'json'});
            thePromise.success(function(result){
                deferred.resolve(result);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        this.parseLyrics = function(lyr) {
            var lyrarr = lyr.split('\r\n');
            var regex = /^((?:\[[\d.:]+\])*)([^\[\]]*)$/;  // for both '[]' and no '[]'
            var lyrics = {};
            var nindex = 0;

            angular.forEach(lyrarr, function(value, key, array) {
                var result = value.match(regex);
                if (result && result[2]) {
                    if (result[1]) {
                        var timestamp = result[1].slice(1, -1).split('][');
                        angular.forEach(timestamp, function(v, k, a) {
                            var temp = v.split(':');
                            lyrics[Number(temp[0])*60 + temp[1]] = result[2];
                        });
                    } else {
                        lyrics[nindex] = result[2];
                        nindex ++;
                    }
                }
            });

            if (!nindex) {
                self.lyrictype = 'withTimeStamp';
            } else {
                self.lyrictype = 'normal';
            }

            return lyrics;

            /*
            for (var i = 0, result; i < lyr.length; i++) {
                result = lyr[i].match(regex);
                if (result[2]) {
                    var timestamp = result[1].slice(1, -1).split('][');
                    for (var j = 0, temp; j < timestamp.length; j++) {
                        temp = timestamp[j].split(':');
                        lyrics[Number(temp[0])*60 + temp[1]] = result[2];
                    }
                }
            }
            return lyrics;*/
        };
    }]);

    // interceptors config
angular.module('musicboxApp')
    .config(['$httpProvider', function ($httpProvider) {        
        $httpProvider.interceptors.push('songsServiceInterceptor');
    }]);
    
    // interceptors config
angular.module('musicboxApp')
    .factory('songsServiceInterceptor', ['$q', '$injector', function ($q, $injector) {
        var redirectInterceptor = {
            responseError: function(response) {
                if (response.status === 302) {
                    var songsService = $injector.get('songsService');
                    var $http = $injector.get('$http');
                    var deferred  = $q.defer();
                    window.console.log('interceptors response:', response);
                    //response.data.redirect;
                }
                window.console.log('interceptors response:', response);
                return $q.resolve(response);
            }
        };
    
        return redirectInterceptor;
    }]);
