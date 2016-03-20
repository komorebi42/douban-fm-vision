/**
 * @ngdoc function
 * @name musicboxApp.controller:MusicController
 * @description
 * # MusicController
 * Controller of the musicboxApp
 */
'use strict';

angular.module('musicboxApp').controller('MusicController', ['$scope', '$filter', 'songsService', 'lyricsService', 'chlService', 'loginService', 'userSettingService', 'notifyService', 'resizeImgService', '$timeout', function($scope, $filter, songsService, lyricsService, chlService, loginService, userSettingService, notifyService, resizeImgService, $timeout) {
    // test zone
    $scope.backToNormal = function(event) {
        if (event.which === 27) {
            window.console.log('KeyEvent:', event);
            $scope.systemSetting.expanded = false;
        }
    };

    //$scope.songUrl = 'musics/Like Sunday,Like Rain.mp3';  
    //'http://mr3.douban.com/201308250247/4a3de2e8016b5d659821ec76e6a2f35d/view/song/small/p1562725.mp3';
    //$scope.songs: album, picture, artist, url, title, length, sid, aid, albumtitle, like

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
    $scope.$on('chlSelected', function() {
        $scope.channel.chlId = chlService.getChlId();
        $scope.channel.chlName = chlService.getChlName();

        if ($scope.channel.chlId <= 0) {
            $scope.status.signed = loginService.getLogStatus();
            if ($scope.status.signed) {
                // loged in
                $scope.playMusic('n');
            } else {
                // popup
                $scope.inform.notiflag = true;
                $scope.inform.chlpop = true;
                $scope.inform.loginpop = false;
                $scope.inform.likepop = false;
                $scope.inform.favpop = false;
                $scope.inform.logoutpop = false;
            }
        } else {
            $scope.playMusic('n');
        }
    });

    // update channels  from login.js viewInfo();
    $scope.$on('update-channels-from-login-controller', function(e,msg) {
        if (!$scope.status.loginFreshChls) {  // already freshed, pls do not try again.
            if (msg.content === 'loged-in') {
                $scope.$broadcast('update-channels-from-music-controller', msg);
            }
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
        'counts': 0,
        'axis': 'images/cdplayer/axis@2x.png',  // for display
        'defaultdisk': false,
        'pictureforAxis': '',
        'axisNone': userSettingService.getAxisSetting() ? userSettingService.getAxisSetting() : false,
        'notifyNone': userSettingService.getNotifySetting() ? userSettingService.getNotifySetting() : false
    };
    $scope.song = {
        'album': '',  // variety added at 2015-10-30, ver. 1.0.1.0
        'albumtitle': '',  // variety added at 2015-10-30, ver. 1.0.1.0
        'sid': '',
        'url': '',
        'disk': '',
        'artist': '',
        'title': '',
        'title_by_artist': '',
        'filename': '',
        'picture': '',
        'like': false,
        'download': ''
    };
    $scope.record = {
        'played': '',
        'liked': '',
        'banned': ''
    };
    $scope.history = []; //h= sid:[psbr] | sid:[psbr]，避免重复，长度限定20项
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
        'deltatime': '',
        'marq': []
    };
    $scope.showLyric = {
        'line1': '',
        'line2': ''
    };
    $scope.inform = {
        'notiflag': false,
        'chlpop': false,
        'likepop': false,
        'favpop': false,
        'loginpop': false,
        'logoutpop': false,
        'userpop': false
    };
    $scope.fixedUI = {
        'axis': 'images/cdplayer/axis@2x.png',
        'axisNone': 'images/cdplayer/axis-o@2x.png',
        'button': 'images/cdplayer/button@2x.png',
        'disk': 'images/cdplayer/disk@2x.png',
        'line': 'images/cdplayer/line@2x.png',
        'player': 'images/cdplayer/player@2x.png',
        'info': 'images/cdplayer/infosample.jpg',
        'author': 'images/cdplayer/KYLE@2x.png',
        'popicon': 'images/favicon_256.png'
    };

    $scope.isTextFull = function(index) {
        // window.console.log('lyric.marq Arr.length:', $scope.lyric.marq.length, $scope.lyric.marq);
        angular.forEach($scope.lyric.marq, function(v) {
            if (index === v) {
                return true;
            }
        });
        return false;
    };

    // user axis none setting
    // $scope.$watch($scope.userSetting.axisNone, function(newValue) {
    //     $scope.$applyAsync(function() {
    //         if (newValue) {
    //             if ($scope.status.defaultdisk) {
    //                 $scope.song.disk = $scope.status.pictureforAxis;  // need to changge author disk from the axis layer
    //             }
    //             $scope.status.axis = $scope.fixedUI.axisNone;
    //         }
    //     });
    // });
    //
    //
    // user axis none setting
    // $scope.$broadcast('axis-not-display', $scope.userSetting.axisNone);
    $scope.$on('axis-not-display', function(e, msg) {
        if (msg) {
            if ($scope.status.defaultdisk) {
                $scope.song.disk = $scope.status.pictureforAxis;  // need to changge author disk from the axis layer
            }
            $scope.status.axis = $scope.fixedUI.axisNone;
        } else {
            $scope.status.axis = $scope.fixedUI.axis;
        }
    });

    // do not display notification
    // $scope.$broadcast('notification-not-display', $scope.userSetting.notifyNone);
    $scope.$on('notification-not-display', function(e, msg) {
        $scope.status.notifyNone = msg ? true : false;
    });

    // user enter setting mode
    // $scope.$broadcast('SettingMode', $scope.systemSetting.hidedpannel);
    $scope.$on('SettingMode', function(e, msg) {
        if (msg) {
            $scope.slideshow = true;
        } else {
            $timeout(function() {
                $scope.slideshow = false;
            }, 3000);
        }
    });

    // get ui data
    $scope.showUI = function(song) {
        if ($scope.status.defaultdisk) {
            $scope.status.defaultdisk = false;
        } else {
            // $scope.status.defaultdisk = $scope.getGoodLuck(6 - $scope.userSetting.goodluck);
            $scope.status.defaultdisk = false;
            $scope.status.pictureforAxis = song.picture;
        }

        // up to: 1.0.0.3
        // $scope.song = song ? {
        //     'album': song.album,
        //     'albumtitle': song.albumtitle,
        //     'sid': song.sid,
        //     'url': song.url,
        //     'disk': $scope.status.defaultdisk ? $scope.fixedUI.axisNone : (song.picture || $scope.fixedUI.disk), // 5 persent to display default disk
        //     'artist': song.artist,
        //     'title': song.title,
        //     'picture': song.picture || $scope.fixedUI.info,
        //     'like': song.like,
        //     'download': song.title + '_' + song.artist + '.' // + song.url.split('.')[song.url.split('.').length - 1]
        // } : {
        //     'album': '',
        //     'albumtitle': '',
        //     'sid': '',
        //     'url': '',  //  'musics/Like Sunday,Like Rain.mp3',
        //     'disk': 'images/cdplayer/sample.jpg',
        //     'artist': 'Frank Whaley',
        //     'title': 'Like Sunday, Like Rain',
        //     'picture': 'images/cdplayer/infosample.jpg',
        //     'like': false,
        //     'download': ''  //  'Like Sunday,Like Rain.mp3'
        // };

        // changed at ver. 1.0.1, no more default settings
        if (song && !song.hasOwnProperty('adtype')) {  // adtype, monitor_url
            $scope.song = {
                'album': song.album,
                'albumtitle': song.albumtitle,
                'sid': song.sid,
                'url': song.url,
                'disk': $scope.status.defaultdisk ? $scope.fixedUI.axisNone : (song.picture || $scope.fixedUI.disk), // 5 persent to display default disk
                'artist': song.artist,
                'title': song.title,
                'title_by_artist': song.title + ' - ' + song.artist,
                'filename': song.title + '_' + song.artist + '.mp4',
                'picture': song.picture || $scope.fixedUI.info,
                'like': song.like,
                'download': song.title + '_by_' + song.artist + '.' // + song.url.split('.')[song.url.split('.').length - 1]
            };
            // change page title
            $scope.$emit('mainController.songsTitleChanged', {song: song.title, artist: song.artist});
        } else {
            if (song.hasOwnProperty('adtype')) {
                console.log('ad data:', song);
            }
            // change page title default
            $scope.$emit('mainController.songsTitleChanged');
            
            $scope.getNextSong();
            $scope.showUI($scope.nextSong);
        }

        //$scope.status.axis = ($scope.userSetting.axisNone && $scope.status.axisNone) ? $scope.fixedUI.axisNone : $scope.fixedUI.axis;
        $scope.status.axis = $scope.status.defaultdisk ? $scope.fixedUI.author : (($scope.userSetting.axisNone && $scope.status.axisNone) ? $scope.fixedUI.axisNone : $scope.fixedUI.axis);
        $scope.showLyric.line1 = '';
        $scope.showLyric.line2 = '';
        $scope.lyric.hlindex = 0;
        $scope.showLyric();

        if (!$scope.status.notifyNone) {
            var title = $scope.song.title || 'New Song';
            var opt = {
                // type: 'image',
                // title: $scope.song.title || 'New Song',
                // message: $scope.song.artist || 'Various Artists',
                // iconUrl: $scope.fixedUI.popicon,
                // imageUrl: $scope.song.picture || 'images/cdplayer/sample.jpg',

                body: $scope.song.artist || 'Various Artists',
                icon: $scope.song.picture
            };
            notifyService.showNotification(title, opt);
        }
        // window.console.log('download name:', $scope.song.download);
    };

    // new,skip,bye: n->p, s->p, b->p, e->p, r, u //h= sid:[psbr] | sid:[psbr]，避免重复，长度限定20项
    $scope.playMusic = function(type) {
        $scope.song.like = false;
        
        if (type !== 'n' && type !== 'u') {
            var history = $scope.song.sid + ':' + type;
            if ($scope.history.length > 20) {
                $scope.history.shift();
            }
            $scope.history.push(history);
        }

        if (type !== 'r' && type !== 'u') {
            $scope.status.playing = false;
            $scope.status.imguseful = false;
            $scope.lyric.valid = false;
            $scope.lyric.hlindex = 0;
        }

        // window.console.log('play-Music, type:',type);
        if (type === 'e') {
            $scope.showUI($scope.nextSong);
        }

        if (type !== 'p') {
            // if (type === 'e' && !songsService.isArrNextEmpty()) {  // songs will end after arr's played
            //     $scope.getSongArr(type);
            // } else {
            $scope.getSongArr(type);

            $timeout(function() {
                $scope.getSongArr('p', $scope.history.join(' | '));
            }, 500);
            // }
        } else {
            $scope.getSongArr('p', $scope.history.join(' | '));
        }

        // type === 'p' ? $scope.getSongArr(type, $scope.history.join(' | ')) : $scope.getSongArr(type);
    };

    // set next song
    $scope.getNextSong = function() {
        $scope.nextSong = songsService.getSongPlay();
        if (songsService.isArrNextEmpty()) {
            $scope.getSongArr('p');
            window.console.log('NEXT ARRAY IS EMPTY !!!');
        }
        if (!$scope.nextSong) {
            $scope.nextSong = songsService.getSongPlay();
            window.console.log('NEXT SONG IS EMPTY !!!');
        }
    };

    // get Song Array; type: n,s,b,p,r,u,e; 
    $scope.getSongArr = function(type, history) {
        songsService.getSongsRaw(type, history, $scope.status.curtime)
            .then(function(data) {
                if (data && data.r === 0) {
                    switch (type) {
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
                    // window.console.log('---',type,'--- response:');
                } else {
                    // window.console.log('NEXTArr TYPE:', type, 'data:', data);
                }
            }, function() {
                // window.console.log('NEXTArr REJECTED TYPE:', type, 'reject:', reason);
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
                        'valid': (lyricsService.getLyricType() !== 'invalid'),
                        'tsuseful': (lyricsService.getLyricType() === 'tsuseful'),
                        'hlindex': 0,
                        'showline': '',
                        'deltatime': ''
                    };
                }
            }, function() {
                $scope.lyric.valid = false;
                $scope.lyric.tsuseful = false;
                $scope.lyric.hlindex = 0;
                // window.console.log('Lyrics Reject MSG:', reason.msg);
            });
    };

    // set default disk
    $scope.getGoodLuck = function(persent) {
        if (Number.isInteger(persent) && (persent >= 0 && persent <= 100)) {
            var random = Math.floor(Math.random() * 100);
            return random <= persent;
        } else {
            return false;
        }
    };

}]);


// get song service
angular.module('musicboxApp').service('songsService', ['$http', '$q', '$cookieStore', 'chlService', 'appConstants', function($http, $q, $cookieStore, chlService, appConstants) {
    // for test

    // setting
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
        // window.console.log('SERVICE setSong-Arr: curPos', self.curPos, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
    };

    // return current and next play song
    this.getSongPlay = function() {
        if (self.arrLen && self.curPos <= self.arrLen - 1) {
            self.songinfo = self.songArr[self.curPos] ? self.songArr[self.curPos] : {};
            self.curPos = self.curPos + 1;
            // window.console.log('SERVICE getSong-Play: curPos [i = i + 1]', self.curPos, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
            return self.songinfo;
        } else {
            self.curPos = 0;
            if (self.songArrNext) {
                this.setSongArr(self.songArrNext);
                self.songinfo = self.songArr[self.curPos] ? self.songArr[self.curPos] : {};
                self.curPos = self.curPos + 1;
                self.songArrNext = [];
                // window.console.log('SERVICE getSong-Play: curPos [i = 1]', self.curPos, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
                return self.songinfo;
            }
            // window.console.log('SERVICE getSong-Play: self.songArrNext === []');
            return {};
        }
    };

    this.setSongArrNext = function(arr) {
        self.songArrNext = arr;
    };

    this.isArrNextEmpty = function() {
        return !self.songArrNext;
    };

    this.getSong = function() {
        return self.songinfo;
    };

    // get raw song info
    this.getSongsRaw = function(type, history, pt) {
        type = type || 'n';
        pt = (type == 'p') ? '0.0' : (pt || '0.0');

        var sid = self.songinfo.sid || '';
        var channel = chlService.getChlId();
        var pb = self.songinfo.ssid || '128';
        var rd = this.getRandom();
        var deferred = $q.defer();
        var url = '';

        type = (!sid && (type !== 'n')) ? 'n' : type;
        url = 'http://douban.fm/j/mine/playlist?' + '&type=' + type + '&sid=' + sid + '&pt=' + pt + '&channel=' + channel + '&pb=' + pb + '&from=mainsite&r=' + rd;

        url = history ? url + '&h=' + history : url;

        var thePromise = $http.get(url, {
            cache: appConstants.useBrowserCache,
            responseType: 'json'
        });
        thePromise.success(function(result) {
            deferred.resolve(result);
        }).error(function(response) {
            deferred.reject(response);
        });
        return deferred.promise;
    };

    // generate 10 random number|chars
    this.getRandom = function() {
        var num = '1234567890abcdef',
            random = '';
        for (var i = 0; i < 10; i++) {
            random += num.charAt(Math.floor(Math.random() * 16));
        }
        return random;
    };

    // play record raw data
    this.getPlayRecordRaw = function(ck, bid, type) {
        var deferred = $q.defer();
        var url = 'http://douban.fm/j/play_record?ck=' + ck + '&spbid=%3A%3A' + bid + '&type=' + type;

        var thePromise = $http.get(url, {
            responseType: 'json'
        });
        thePromise.success(function(result) {
            deferred.resolve(result);
        }).error(function(response) {
            deferred.reject(response);
        });
        return deferred.promise;
    };

    // transfer data
    this.getTransferData = function(ck) {
        var deferred = $q.defer();
        var url = 'http://douban.fm/j/transfer_data?ck=' + ck;

        var thePromise = $http.get(url, {
            responseType: 'json'
        });
        thePromise.success(function(result) {
            deferred.resolve(result);
        }).error(function(response) {
            deferred.reject(response);
        });
        return deferred.promise;
    };

    // save volume for the next use
    this.setVolume = function(vol) {
        $cookieStore.put('vol', vol);
    };

    // get volume
    this.getVolume = function() {
        return $cookieStore.get('vol');
    };

    // add request referer
    this.addReferer = function() {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            function(details) {
                if (details.type === 'xmlhttprequest') {
                    var exists = false;
                    for (var i = 0; i < details.requestHeaders.length; ++i) {
                        if (details.requestHeaders[i].name === 'Referer') {
                            exists = true;
                            details.requestHeaders[i].value = 'http://www.douban.fm';
                            break;
                        }
                    }

                    if (!exists) {
                        details.requestHeaders.push({
                            name: 'Referer',
                            value: 'http://www.douban.fm'
                        });
                    }

                    return {
                        requestHeaders: details.requestHeaders
                    };
                }
            }, {
                urls: ['http://douban.fm/*']
            }, // http://douban.fm/j/play_record
            ['blocking', 'requestHeaders']
        );
    };

}]);


// lyrics service
angular.module('musicboxApp').service('lyricsService', ['$http', '$q', 'songsService', 'appConstants', function($http, $q, songsService, appConstants) {
    var self = this;
    self.lyrictype = 'textonly'; // invalid, tsuseful, textonly

    this.getLyricType = function() {
        return self.lyrictype;
    };

    this.getLyrics = function() {
        var sid = songsService.getSong().sid;
        var ssid = songsService.getSong().ssid;
        var deferred = $q.defer();

        if (sid && ssid) {
            var url = 'http://api.douban.com/v2/fm/lyric?' + 'sid=' + sid + '&ssid=' + ssid; // + '&apikey=' + '02646d3fb69a52ff072d47bf23cef8fd' + '&app_name=douban_fm_iphone_3.0&sdkVersion=1.9.0&did=d1d5754d8b077285fe85581feafabc82'; //appConstants.apikey + '&version=630&app_name=radio_android';
            // window.console.log('REQUEST LYRICS:', url);
            var thePromise = $http.get(url, {
                cache: appConstants.useBrowserCache,
                responseType: 'json'
            });
            thePromise.success(function(result) {
                deferred.resolve(result);
            }).error(function(response) {
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
        var regexfull = /^((?:\[[\d.:-]+\])*)(?:\[offset:(-?\d+)?\])?((?:\[[\d.:-]+\])*)(?:\[ti:(\S*\s*)\])?(?:\[ar:(\S*\s*)\])?(?:\[al:(\S*\s*)\])?(?:\[by:(\S*\s*)\])?([^\[\]]*)$/; // add title artist album by-who
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
        angular.forEach(lyrarr, function(value) {
            var group = value.match(regexfull);
            if (group) {
                // find offset command
                if (group[2]) {
                    offset = group[2];
                    if (group[1]) {
                        // add timestamp with offset
                        var timestamp1 = group[1].slice(1, -1).split('][');
                        angular.forEach(timestamp1, function(v) {
                            var temp = v.split(':');
                            lyricsArr.push({
                                'ts': parseFloat(Number(temp[0]) * 60 + parseFloat(temp[1]) + parseInt(offset) / 1000).toFixed(2),
                                'line': group[8]
                            });
                        });
                        tstype++;
                    } else if (group[3]) {
                        // add timestamp without offset
                        var timestamp2 = group[3].slice(1, -1).split('][');
                        angular.forEach(timestamp2, function(v) {
                            var temp = v.split(':');
                            lyricsArr.push({
                                'ts': parseFloat(Number(temp[0]) * 60 + parseFloat(temp[1])).toFixed(2),
                                'line': group[8]
                            });
                        });
                        tstype++;
                    } else {
                        window.console.log('[offset:]', group[2], group[8], group); // only [offset:\d+]
                    }
                } else {
                    if (group[1]) {
                        // offset not found
                        var timestamp = group[1].slice(1, -1).split('][');
                        angular.forEach(timestamp, function(v) {
                            var temp = v.split(':');
                            lyricsArr.push({
                                'ts': parseFloat(Number(temp[0]) * 60 + parseFloat(temp[1]) + parseInt(offset) / 1000).toFixed(2),
                                'line': group[8]
                            });
                        });
                        tstype++;
                    } else {
                        if (group[8]) {
                            lyricsArr.push({
                                'ts': -1,
                                'line': group[8]
                            });
                        }
                    }
                }
                // add title to lyrics
                if (group[4]) {
                    lyricsArr.push({
                        'ts': -4,
                        'line': group[4]
                    });
                }
                // add artist to lyrics
                if (group[5]) {
                    lyricsArr.push({
                        'ts': -3,
                        'line': group[5]
                    });
                }
                // add album to lyrics
                if (group[6]) {
                    lyricsArr.push({
                        'ts': -3,
                        'line': group[6]
                    });
                }
                // add writer to lyrics
                if (group[7]) {
                    lyricsArr.push({
                        'ts': -2,
                        'line': group[7]
                    });
                }
            }
        });
        
        // lyrics get 1.0;
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
                    var diff = parseInt(lyricsArr[j].ts) > parseInt(lyricsArr[j + 1].ts);
                    if (diff) {
                        linetempObj = lyricsArr[j];
                        lyricsArr[j] = lyricsArr[j + 1];
                        lyricsArr[j + 1] = linetempObj;
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

// notification service
angular.module('musicboxApp').service('notifyService', [function() {
    var vm = this;
    
    // show notification
    var Notification = window.Notification || window.mozNotification || window.webkitNotification;
    this.showNotification = function(title, opt) {
        if (!('Notification' in window)) {
            window.console.log('Update your browser up-to-date and enjoy the special notification');
        } else if (Notification.permission === 'granted') {
            this.doShowNotification(title, opt);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(permission) {
                if (permission === 'granted') {
                    vm.doShowNotification(title, opt);
                }
            });
        }
    };

    // show notification: do the real work
    this.doShowNotification = function(title, opt) {
        // var popImgUrl = $scope.song.picture;
        // var iconimg = resizeImgService.resizeImage(popImgUrl, 48, 48);  // img: $scope.fixedUI.popicon
        // var options = {
        //     // type: "basic",  // only for chrome notification, type=image, imageUrl 
        //     body: $scope.song.artist,
        //     icon: $scope.fixedUI.popicon
        // };
        // window.console.log('Nofitication:', options);
        var newSongNotify = new Notification(title, opt);
        setTimeout(newSongNotify.close.bind(newSongNotify), 5000);
        // 
        // only for chrome notification to use the image type notification
        // chrome.notifications.create(opt, function() {});  // changed on 1.0.1.3, enable on 1.0.1.2
            // $timeout(chrome.notifications.clear(function(){}), 8000);
        // });
    };

}]);


// image resize service
angular.module('musicboxApp').service('resizeImgService', [function() {
    this.resizeImage = function(imgSrc, Tagwidth, Tagheight) {
        var imageS = new Image();
        imageS.src = imgSrc;
        var imageO = new Image();

        if (imageS.width > 0 && imageS.height > 0) {
            if (imageS.width > Tagwidth) {
                imageO.width = Tagwidth;
                imageO.height = (imageS.height + Tagwidth) / imageS.width;
                if (imageO.height > Tagheight) {
                    imageO.height = Tagheight;
                    imageO.width = (imageS.width + Tagheight) / imageS.height;
                }
            } else if (imageS.height > Tagheight) {
                imageO.height = Tagheight;
                imageO.width = (imageS.width + Tagheight) / imageS.height;
                if (imageS.width > Tagwidth) {
                    imageO.width = Tagwidth;
                    imageO.height = (imageS.height + Tagwidth) / imageS.width;
                }
            } else {
                imageO.width = imageS.width;
                imageO.height = imageS.height;
            }
        }
        return imageO;
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
