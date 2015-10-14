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

        //$scope.songUrl = 'musics/Like Sunday,Like Rain.mp3';  
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
                $scope.status.signed = loginService.getLogStatus();
                if ($scope.status.signed) {
                    // yidonglu
                    $scope.getCurrPlay('n');
                } else {
                    // popup
                    $scope.inform.notiflag = true;
                    $scope.inform.chlpop = true;
                }
            } else {
                $scope.getCurrPlay('n');
            }
        });

        // initial scope
        $scope.status = {
            'playing': false,
            'imguseful': false,
            'vol': songsService.getVolume() ? songsService.getVolume() : 80,
            'maxvol': 100,
            'curtime': '',
            'signed': loginService.getLogStatus(),
            'counts': 0
        };
        $scope.songUI = {
            'url': '',
            'disk': '',
            'artist': '',
            'title': '',
            'picture': ''
        };
        $scope.channel = {
            'chlId': chlService.getChlId(),
            'chlName': chlService.getChlName()
        };
        $scope.lyric = {
            'name': '',
            'content': '',
            'valid': false,
            'withTS': false,
            'hlindex': 0,
            'showline': '',
            'deltatime': ''
        };
        $scope.inform = {
            'notiflag': false,
            'chlpop': false,
            'likepop': false
        };

        // initial play
        // $scope.initPlay = function() {
        //     $scope.playing = $scope.status.playing;
        //     $scope.imguseful = $scope.status.imguseful;
        //     $scope.vol = $scope.status.vol;
        //     $scope.paused = false;

        //     $scope.getCurrPlay('n');
        // };

        // get ui data
        $scope.setshowUI = function(song) {
            var songUI = {};
            if (song) {
                songUI = {
                    'url': song.url,
                    'disk': song.picture,
                    'artist': song.artist,
                    'title': song.title,
                    'picture': song.picture
                };
            } else {
                songUI = {
                    'url': 'musics/Like Sunday,Like Rain.mp3',
                    'disk': 'images/cdplayer/CDLikesunday.png',
                    'artist': 'Frank Whaley',
                    'title': 'Like Sunday, Like Rain',
                    'picture': ''
                };
            }
            $scope.songUI = songUI;
            $scope.status.playing = true;
        };

        // new,skip,bye: n->p, s->p, b->p
        $scope.getCurrPlay = function(type) {
            $scope.status.playing = false;
            $scope.getPlaylist(type, $scope.status.curtime);
            $timeout(function(){
                $scope.getNextPlay('p');
            }, 3000);
        };

        // end: e->p
        $scope.endedSong = function() {
            $scope.status.playing = false;
            $scope.status.imguseful = false;

            if (!$scope.songNext) {
                //$scope.getCurrPlay('n');
                $scope.getNextPlay('p');
            } else {
                $scope.setshowUI($scope.songNext);
                $scope.getLyric();

                $scope.status.playing = true;
                $scope.status.imguseful = true;
                
                songsService.getSongsRaw('e', $scope.status.curtime)
                    .then(function(data) {
                        window.console.log('STATUS: ended,', data);
                    });

                if (songsService.checkArrNext()) {
                    $scope.getNextPlay('p');
                }
                
                $scope.songNext = songsService.getSongPlay();
                window.console.log('ENDEDSONG fired getSongPlay()');
            }
        };

        // playing, rate, unrate: p, r, u
        $scope.getNextPlay = function(type) {
            var pt = $scope.status.curtime;

            songsService.getSongsRaw(type, pt)
            .then(function(data) {
                if (data && data.r === 0) {
                    if (type === 'p') {
                        songsService.setSongArrNext(data.song);
                        $scope.songNext = songsService.getSongPlay();
                    } else {
                        if (type === 'u') {
                            songsService.setSongArrNext([]);
                        }
                        songsService.setSongArr(data.song);
                        $scope.songNext = songsService.getSongPlay();
                    }
                    window.console.log('GETNEXTPLAY fired getSongPlay()');
                } else {  
                    // 302 response
                    window.console.log('PLAYSTATUS: NEXT t=p,r,u f1.data:', data);
                }
            }, function(reason) {
                // 302 response
                window.console.log('PLAYSTATUS: NEXT t=p,r,u f2.reject:', reason);
            });
        };

        // get songlist : n s b
        $scope.getPlaylist = function(type, pt) {
            songsService.getSongsRaw(type, pt).then(function(data) {
                if (data && data.r === 0) {
                    songsService.setSongArr(data.song);
                    $scope.song = songsService.getSongPlay();
                    window.console.log('GETPLAYLIST fired getSongPlay()');
                    $scope.setshowUI($scope.song);
                    $scope.getLyric();

                    $scope.status.playing = true;
                    $scope.status.imguseful = true;
                } else {
                    // $scope.song = songsService.getSongPlay(); // getSongNext()
                    // $scope.setshowUI($scope.song);
                    // $scope.getLyric();
                    window.console.log('PLAYSTATUS: CURR t=n,s,b f1.data:', data);
                }
            }, function(reason) {
                // 302
                window.console.log('PLAYSTATUS: CURR t=n,s,b f2.reject:', reason);
            });
        };

        // get lyrics
        $scope.getLyric = function() {
            lyricsService.getLyrics().then(function(data) {
                if (data && data.sid) {
                    $scope.lyric.name = data.name;
                    $scope.lyric.content = lyricsService.parseLyrics(data.lyric);
                    $scope.lyric.valid = (lyricsService.getLyricType() !== 'invalid') ? true : false;
                    // invalid, withTS, textonly
                    if ($scope.lyric.valid) {
                        if ('textonly' === lyricsService.getLyricType()) {
                        // only text; textonly
                            $scope.lyric.withTS = false;
                        } else {
                            // timestamp 
                            $scope.lyric.withTS = true;
                        }
                    }
                }
            }, function(reason) {
                $scope.lyric.valid = false;
                window.console.log('Lyrics Reject MSG:', reason.msg);
            });

        };
    }]);

    // get song service
angular.module('musicboxApp')
    .service('songsService',['$http', '$q', '$cookieStore', 'chlService', 'appConstants', function($http, $q, $cookieStore, chlService, appConstants){
        var self = this;
        self.songArr = [];
        self.songArrNext = [];
        self.arrLen = 0;
        self.curPos = 0;
        self.songinfo = {};
        self.sid = '';
        self.ssid = '';

        this.setSongArr = function(arr) {
            if (arr) {
                self.songArr = arr;
                self.arrLen = arr.length;
                self.curPos = 0;
                if (arr[0]) {
                    self.songinfo = arr[0];
                }
            } 
            // if (arr[0]) {            
            //     $cookieStore.put('song', arr[0]);
            // }
            window.console.log('FUNCTION SETSONGARR: arrLen - ', self.arrLen, ' curPos - ', self.curPos);
        };

        this.getSongPlay = function() {
            if (self.curPos <= self.arrLen - 1) {
                if (self.songArr[self.curPos]) {
                    self.songinfo =  self.songArr[self.curPos]; // ? self.songArr[self.curPos] : $cookieStore.get('song');
                }
                self.curPos ++;
                window.console.log('FUNCTION Song self.curPos:', self.curPos - 1, 'self.arrLen', self.arrLen);
                window.console.log('FUNCTION Song self.curPos:', self.curPos - 1, self.songinfo);
                return self.songinfo;
            } else {
                self.curPos = 0;
                if (self.songArrNext) {
                    this.setSongArr(self.songArrNext);
                    self.curPos ++;
                    window.console.log('FUNCTION SongNEXT Length:', self.songArrNext.length);
                    window.console.log('FUNCTION SongNEXT:', self.songArrNext);
                    self.songArrNext = [];
                    return self.songinfo;
                } 
                return {};
            }
        };

        this.setSongArrNext = function(arr) {
            self.songArrNext = arr;
        };

        this.checkArrNext = function() {
            return (self.songArrNext ? true : false);
        };

        this.getSong = function() {
            return self.songinfo;
        };

        this.getsid = function() {
            return self.songinfo.sid;
        };

        this.getssid = function() {
            return self.songinfo.ssid;
        };

        this.getSongsRaw = function(type, pt) {
            type = type || 'p';
            pt = (type == 'p') ? '0.0' : (pt || '0.0');

            var sid = self.songinfo.sid || '';
            var channel = chlService.getChlId() || '155';
            var pb = self.songinfo.ssid || '128';
            var rd = this.getRandom();
            var deferred = $q.defer();
            var url = '';

            if (!sid && (type !== 'n')) {
                type = 'n';
            }

            url = 'http://douban.fm/j/mine/playlist?'  + '&type=' + type + '&sid=' + sid + '&pt=' + pt + '&channel=' + channel + '&pb=' + pb + '&from=mainsite&r=' + rd;
            window.console.log('REQUEST SONG: TYPE-', type, ' url-', url);

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

        this.setVolume = function(vol) {
            if (typeof vol === 'number') {
                $cookieStore.set({
                    name: 'vol',
                    value: vol
                });
            }
        };

        this.getVolume = function() {
            $cookieStore.get({
                name: 'vol'
            }, function(result) {
                if (result) {
                    return result.value;
                } else {
                    return 79;
                }
            });
        };

    }]);
    
    // login service
angular.module('musicboxApp')
    .service('loginService', [function () {
        var self = this;
        self.signed = false;

        this.getLogStatus = function() {
            this.checkCookie();
            return self.signed;
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
                    self.signed = true;
                } else {
                    self.signed = false;
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
    .service('lyricsService', ['$http', '$q', 'songsService', 'appConstants', function ($http, $q, songsService, appConstants) {
        var self = this;
        self.lyrictype = 'textonly';  // invalid, withTS, textonly

        this.getLyricType = function() {
            return self.lyrictype;
        };

        this.getLyrics = function() {
            var urlsid = songsService.getsid();
            var urlssid = songsService.getssid();
            //var sid1 = '1563351';
            //var ssid1 = '80b3';
            var deferred = $q.defer();

            if (urlsid && urlssid) {
                var url = 'http://api.douban.com/v2/fm/lyric?'  + 'sid=' + urlsid + '&ssid=' + urlssid; // + '&apikey=' + '02646d3fb69a52ff072d47bf23cef8fd' + '&app_name=douban_fm_iphone_3.0&sdkVersion=1.9.0&did=d1d5754d8b077285fe85581feafabc82'; //appConstants.apikey + '&version=630&app_name=radio_android';
                window.console.log('REQUEST LYRICS:', url);
                var thePromise = $http.get(url, {cache: appConstants.useBrowserCache, responseType: 'json'});
                thePromise.success(function(result){
                        deferred.resolve(result);
                    }).error(function(response){
                        deferred.reject(response);
                    });
                return deferred.promise;
            } else {
                return deferred.reject({'msg': 'NOT FOUND sid or ssid'});
            }
        };

        this.parseLyrics = function(lyr) {
            var lyrarr = lyr.split('\r\n');
            //var regexbasic = /^((?:\[[\d.:-]+\])*)([^\[\]]*)$/;  // for both with '[]' and without '[]'
            //  result[1]: [02:33.22][04:33.22]    ((?:\[[\d.:-]+\])*)
            //  result[2]: content     ([^\[\]]*)
            //var regex = /^((?:\[[\d.:-]+\])*)(?:\[offset:(-?\d+)?\])?((?:\[[\d.:-]+\])*)([^\[\]]*)$/;  // add offset
            var regexfull = /^((?:\[[\d.:-]+\])*)(?:\[offset:(-?\d+)?\])?((?:\[[\d.:-]+\])*)(?:\[ti:(\S*\s*)\])?(?:\[ar:(\S*\s*)\])?(?:\[al:(\S*\s*)\])?(?:\[by:(\S*\s*)\])?([^\[\]]*)$/;  // add title artist album by-who
            //  g1: [02:33.22][04:33.22]     ((?:\[[\d.:-]+\])*)
            //  g2: -500    [offset: -500]      (?:\[offset:(-?\d+)?\])?
            //  g3: [03:23.11][04:33.22]      ((?:\[[\d.:-]+\])*)
            //  g4: title  [ti: artist]        (?:\[ti:(\S*\s*)\])?
            //  g5: artist  [ar: artist]        (?:\[ar:(\S*\s*)\])?
            //  g6: album  [al: album]        (?:\[al:(\S*\s*)\])?
            //  g7: writer  [by: writer]        (?:\[by:(\S*\s*)\])?
            //  g8: content     ([^\[\]]*)
            var offset = 0;
            var lyricsArr = [];
            var tstype = 0;
            var linetempObj = {};
            var isEmpty = lyr.match(/^\s*$/);

            if (isEmpty) {
                self.lyrictype = 'invalid';
                return lyricsArr;
            }
            angular.forEach(lyrarr, function(value, key, arr) {
                var group = value.match(regexfull);
                if (group) {
                    // find offset command
                    if (group[2]) {
                        offset = group[2];
                        if (group[1]) {  
                            // add timestamp with offset
                            var timestamp1 = group[1].slice(1, -1).split('][');                        
                            angular.forEach(timestamp1, function(v, k, a) {
                                var temp = v.split(':');
                                lyricsArr.push({'ts' : parseFloat(Number(temp[0])*60 + parseFloat(temp[1]) + parseInt(offset)/1000).toFixed(2), 'line' : group[8]});
                            });
                            tstype ++;
                        } else if (group[3]) {
                                // add timestamp without offset
                                var timestamp2 = group[3].slice(1, -1).split('][');                        
                                angular.forEach(timestamp2, function(v, k, a) {
                                    var temp = v.split(':');
                                    lyricsArr.push({'ts' : parseFloat(Number(temp[0])*60 + parseFloat(temp[1])).toFixed(2), 'line' : group[8]});
                                });
                                tstype ++;
                            }
                    } else {
                        if (group[1]) {
                            // offset not found
                            var timestamp = group[1].slice(1, -1).split('][');                        
                                angular.forEach(timestamp, function(v, k, a) {
                                    var temp = v.split(':');
                                    lyricsArr.push({'ts' : parseFloat(Number(temp[0])*60 + parseFloat(temp[1]) + parseInt(offset)/1000).toFixed(2), 'line' : group[8]});
                                });
                                tstype ++;
                        } else {
                            lyricsArr.push({'ts' : -1, 'line' : group[8]});
                        }
                    }
                    // add title to lyrics
                    if (group[4]) {
                        lyricsArr.push({'ts' : -4, 'line' : group[4]});
                    }
                    // add artist to lyrics
                    if (group[5]) {
                        lyricsArr.push({'ts' : -3, 'line' : group[5]});
                    }
                    // add album to lyrics
                    if (group[6]) {
                        lyricsArr.push({'ts' : -3, 'line' : group[6]});
                    }
                    // add writer to lyrics
                    if (group[7]) {
                        lyricsArr.push({'ts' : -2, 'line' : group[7]});
                    }
                }
            });
        
            // angular.forEach(lyrarr, function(value, key, array) {
            //     var result = value.match(regexbasic);
            //     if (result) {
            //         if (result[1]) {
            //             var timestamp = result[1].slice(1, -1).split('][');
            //             angular.forEach(timestamp, function(v, k, a) {
            //                 var temp = v.split(':');
            //                 lyricsArr.push({'ts' : parseFloat(Number(temp[0])*60 + parseFloat(temp[1])).toFixed(2), 'line' : result[2]});
            //             });
            //             tstype ++;
            //         } else {
            //             lyricsArr.push({'ts' : -1, 'line' : result[2]});
            //         }
            //     }
            // });

            if (tstype > 2) {
                self.lyrictype = 'withTS';
                tstype = 0;
                for (var i = lyricsArr.length - 1; i > 0; i--) {
                    for (var j = 0; j < i; j++) {
                        var diff = parseInt(lyricsArr[j].ts) > parseInt(lyricsArr[j+1].ts);
                            if (diff) {
                                linetempObj = lyricsArr[j];
                                lyricsArr[j] = lyricsArr[j+1];
                                lyricsArr[j+1] = linetempObj;
                            }
                    }
                }
            } else {
                self.lyrictype = 'textonly';
                tstype = 0;
            }
            return lyricsArr;
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
