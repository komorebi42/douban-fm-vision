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
            $scope.channel.chlId = chlService.getChlId();
            $scope.channel.chlName = chlService.getChlName();

            if ($scope.channel.chlId <= 0) {
                $scope.status.signed = loginService.getLogStatus();
                if ($scope.status.signed) {
                    // yidonglu
                    $scope.playMusic('n');
                } else {
                    // popup
                    $scope.inform.notiflag = true;
                    $scope.inform.chlpop = true;
                }
            } else {
                $scope.playMusic('n');
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
        $scope.song = {
            'url': '',
            'disk': '',
            'artist': '',
            'title': '',
            'picture': '',
            'like': false
        };
        $scope.channel = {
            'chlId': chlService.getChlId(),
            'chlName': chlService.getChlName()
        };
        $scope.lyric = {
            'name': '',
            'content': '',
            'valid': false,
            'tsuseful': false,
            'hlindex': 0,
            'showline': '',
            'deltatime': ''
        };
        $scope.lyricFull = [];
        $scope.inform = {
            'notiflag': false,
            'chlpop': false,
            'likepop': false
        };
        $scope.fixedUI = {
            'axis': 'images/cdplayer/axis@2x.png',
            'axisNo': 'images/cdplayer/axis-o@2x.png',
            'button': 'images/cdplayer/button@2x.png',
            'disk': 'images/cdplayer/disk@2x.png',
            'line': 'images/cdplayer/line@2x.png',
            'player': 'images/cdplayer/player@2x.png',
            'info': ''
        };
        $scope.setting = {
            'axis': true
        };
        $scope.isTextFull = function(index) {
            angular.forEach($scope.lyricFull, function(v, k, a) {
                if (index === value) {
                    return true;
                }
            });
            return false;
        };

        // get ui data
        $scope.showUI = function(song) {
            $scope.song = song ? {
                'url': song.url,
                'disk': song.picture || $scope.fixedUI.disk,
                'artist': song.artist,
                'title': song.title,
                'picture': song.picture || $scope.fixedUI.info,
                'like': song.like
            } : {
                'url': 'musics/Like Sunday,Like Rain.mp3',
                'disk': 'images/cdplayer/sample.jpg',
                'artist': 'Frank Whaley',
                'title': 'Like Sunday, Like Rain',
                'picture': 'images/cdplayer/infosample.jpeg',
                'like': false
            };
            $scope.showLyric();
            $scope.fixedUI.axis = $scope.setting.axis ? $scope.fixedUI.axis : $scope.fixedUI.axisNo;
        };

        // new,skip,bye: n->p, s->p, b->p, e->p
        $scope.playMusic = function(type) {
            $scope.status.playing = false;
            $scope.status.imguseful = false;
            $scope.lyric.valid = false;

            window.console.log('play-Music, type:',type);
            if (type === 'e') {
                $scope.showUI($scope.nextSong);
            }
            $scope.getSongArr(type);

            $timeout(function() {
                $scope.getSongArr('p');
            }, 3000);
        };

        // set next song
        $scope.getNextSong = function() {
            $scope.nextSong = songsService.getSongPlay();
            if (songsService.isArrNextEmpty()) {
                $scope.getSongArr('p');
            }
            if (!$scope.nextSong) {
                $scope.nextSong = songsService.getSongPlay();
            }
        };

        // get Song Array; type: n,s,b,p,r,u,e; 
        $scope.getSongArr = function(type) {
            songsService.getSongsRaw(type, $scope.status.curtime)
            .then(function(data) {
                if (data && data.r === 0) {
                    switch(type) {
                        case 'n':
                        case 's':
                        case 'b':
                            songsService.setSongArr(data.song);
                            $scope.getNextSong();
                            $scope.showUI($scope.nextSong);
                            $scope.status.playing = true;
                            $scope.status.imguseful = true;
                            break;
                        case 'e':
                            $scope.getNextSong();
                            $scope.status.playing = true;
                            $scope.status.imguseful = true;
                            break;
                        case 'p':
                        case 'r':
                        case 'u':
                            songsService.setSongArrNext(data.song);
                            $scope.getNextSong();
                            break;
                    }
                    window.console.log('---',type,'--- response:');
                } else {  
                    window.console.log('NEXTArr TYPE:', type, 'data:', data);
                }
            }, function(reason) {
                window.console.log('NEXTArr REJECTED TYPE:', type, 'reject:', reason);
            });
        };

        // get lyrics
        $scope.showLyric = function() {
            lyricsService.getLyrics()
            .then(function(data) {
                if (data && data.sid) {
                    $scope.lyric = {
                        'name': data.name,
                        'content': lyricsService.parseLyrics(data.lyric),
                        'valid': (lyricsService.getLyricType() !== 'invalid') ? true : false,
                        'tsuseful': (lyricsService.getLyricType() === 'tsuseful') ? true : false,
                        'hlindex': 0,
                        'showline': '',
                        'deltatime': ''
                    };
                }
            }, function(reason) {
                $scope.lyric.valid = false;
                $scope.lyric.tsuseful = false;
                $scope.lyric.hlindex = 0;
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

        // reset songArr
        this.setSongArr = function(arr) {
            if (arr) {
                self.songArr = arr;
                self.arrLen = arr.length;
                self.curPos = 0;
            }
            window.console.log('SERVICE set-SongArr: curPos', self.curPos, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
        };

        this.getSongPlay = function() {
            if (self.arrLen && self.curPos <= self.arrLen - 1) {
                self.songinfo = self.songArr[self.curPos] ? self.songArr[self.curPos] : {};
                self.curPos ++;
                window.console.log('SERVICE get-SongPlay Arr, curPos', self.curPos-1, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
                return self.songinfo;
            } else {
                self.curPos = 0;
                if (self.songArrNext) {
                    this.setSongArr(self.songArrNext);
                    self.songinfo = self.songArr[self.curPos] ? self.songArr[self.curPos] : {};
                    self.curPos ++;
                    window.console.log('SERVICE Arr[0]===[], Arr[0]=Arr[1], curPos', self.curPos-1, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
                    return self.songinfo;
                }
                window.console.log('Array[0]===[]');
                return {};
            }
        };

        this.setSongArrNext = function(arr) {
            self.songArrNext = arr;
        };

        this.isArrNextEmpty = function() {
            return (!self.songArrNext ? true : false);
        };

        this.getSong = function() {
            return self.songinfo;
        };

        this.getSongsRaw = function(type, pt) {
            type = type || 'n';
            pt = (type == 'p') ? '0.0' : (pt || '0.0');

            var sid = self.songinfo.sid || '';
            var channel = chlService.getChlId();
            var pb = self.songinfo.ssid || '128';
            var rd = this.getRandom();
            var deferred = $q.defer();
            var url = '';

            type = (!sid && (type !== 'n')) ? 'n' : type;
            url = 'http://douban.fm/j/mine/playlist?'  + '&type=' + type + '&sid=' + sid + '&pt=' + pt + '&channel=' + channel + '&pb=' + pb + '&from=mainsite&r=' + rd;

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
            }, function(reason) {
                return 78;
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
        self.lyrictype = 'textonly';  // invalid, tsuseful, textonly

        this.getLyricType = function() {
            return self.lyrictype;
        };

        this.getLyrics = function() {
            var sid = songsService.getSong().sid;
            var ssid = songsService.getSong().ssid;
            var deferred = $q.defer();

            if (sid && ssid) {
                var url = 'http://api.douban.com/v2/fm/lyric?'  + 'sid=' + sid + '&ssid=' + ssid; // + '&apikey=' + '02646d3fb69a52ff072d47bf23cef8fd' + '&app_name=douban_fm_iphone_3.0&sdkVersion=1.9.0&did=d1d5754d8b077285fe85581feafabc82'; //appConstants.apikey + '&version=630&app_name=radio_android';
                window.console.log('REQUEST LYRICS:', url);
                var thePromise = $http.get(url, {cache: appConstants.useBrowserCache, responseType: 'json'});
                thePromise.success(function(result){
                        deferred.resolve(result);
                    }).error(function(response){
                        deferred.reject(response);
                    });
            }
            return deferred.promise;
        };

        this.parseLyrics = function(lyr) {
            var lyrarr = lyr.split('\r\n');
            // var lyrarr = lyr.match(/([^\\]*)(?:\\r\\n)+$/);
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
                            if (group[8]) {
                                lyricsArr.push({'ts' : -1, 'line' : group[8]});
                            }
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
                self.lyrictype = 'tsuseful';
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

//     // interceptors config
// angular.module('musicboxApp')
//     .config(['$httpProvider', function ($httpProvider) {        
//         $httpProvider.interceptors.push('songsServiceInterceptor');
//     }]);
    
//     // interceptors config
// angular.module('musicboxApp')
//     .factory('songsServiceInterceptor', ['$q', '$injector', function ($q, $injector) {
//         var redirectInterceptor = {
//             responseError: function(response) {
//                 if (response.status === 302) {
//                     var songsService = $injector.get('songsService');
//                     var $http = $injector.get('$http');
//                     var deferred  = $q.defer();
//                     window.console.log('interceptors response:', response);
//                     //response.data.redirect;
//                 }
//                 window.console.log('interceptors response:', response);
//                 return $q.resolve(response);
//             }
//         };
    
//         return redirectInterceptor;
//     }]);
