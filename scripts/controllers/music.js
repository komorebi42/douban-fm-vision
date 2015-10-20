/**
 * @ngdoc function
 * @name musicboxApp.controller:MusicController
 * @description
 * # MusicController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('MusicController', ['$scope', '$filter', 'songsService', 'lyricsService', 'chlService', 'loginService', 'expandService', 'appConstants', '$timeout', function ($scope, $filter, songsService, lyricsService, chlService, loginService, expandService, appConstants, $timeout) {
        //$scope.songUrl = 'musics/Like Sunday,Like Rain.mp3';  
        //'http://mr3.douban.com/201308250247/4a3de2e8016b5d659821ec76e6a2f35d/view/song/small/p1562725.mp3';
        //$scope.songs: album, picture, artist, url, title, length, sid, aid, albumtitle, like
        
        //$scope.authorize = appConstants.AUTH_HOST + appConstants.AUTHORIZE_URL + '?client_id=' + appConstants.apikey + '&redirect_uri=' + appConstants.REDIRECT_URL + '&response_type=token';

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
            'isLoading': false,
            'dataRetrievalError': false,
            'playing': false,
            'imguseful': false,
            'vol': songsService.getVolume() ? songsService.getVolume() : 80,
            'maxvol': 100,
            'curtime': '',
            'signed': loginService.getLogStatus(),
            'counts': 0,
            'hidepannel': false,
            'defaultdisk': false
        };
        $scope.song = {
            'url': '',
            'disk': '',
            'artist': '',
            'title': '',
            'picture': '',
            'like': false,
            'download':''
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
            'axisNo': 'images/cdplayer/axis-o@2x.png',
            'button': 'images/cdplayer/button@2x.png',
            'disk': 'images/cdplayer/disk@2x.png',
            'line': 'images/cdplayer/line@2x.png',
            'player': 'images/cdplayer/player@2x.png',
            'info': 'images/cdplayer/infosample.jpeg',
            'author': 'images/cdplayer/KYLE@2x.png'
        };
        $scope.setting = {
            'ue': '',
            'logout': '',
            'axis': true
        };

        $scope.isLoged = function() {
            $scope.status.signed = loginService.getLogStatus();
        };

        $scope.isTextFull = function(index) {
            // window.console.log('lyric.marq Arr.length:', $scope.lyric.marq.length, $scope.lyric.marq);
            angular.forEach($scope.lyric.marq, function(v, k, a) {
                if (index === v) {
                    return true;
                }
            });
            return false;
        };

        // get ui data
        $scope.showUI = function(song) {
            if ($scope.status.defaultdisk) {
                $scope.status.defaultdisk = false;
            } else {
                $scope.status.defaultdisk = $scope.getGoodLuck(5);
            }

            $scope.song = song ? {
                'sid': song.sid,
                'url': song.url,
                'disk': $scope.status.defaultdisk ? $scope.fixedUI.axisNo : (song.picture || $scope.fixedUI.disk),  // 5 persent to display default disk
                'artist': song.artist,
                'title': song.title,
                'picture': song.picture || $scope.fixedUI.info,
                'like': song.like,
                'download': song.title + '_' + song.artist + '.' + song.url.split('.')[song.url.split('.').length - 1]
            } : {
                'sid': '',
                'url': 'musics/Like Sunday,Like Rain.mp3',
                'disk': 'images/cdplayer/sample.jpg',
                'artist': 'Frank Whaley',
                'title': 'Like Sunday, Like Rain',
                'picture': 'images/cdplayer/infosample.jpeg',
                'like': false,
                'download': 'Like Sunday,Like Rain.mp3'
            };
            //$scope.fixedUI.axis = $scope.setting.axis ? $scope.fixedUI.axis : $scope.fixedUI.axisNo;
            $scope.fixedUI.axis = $scope.status.defaultdisk ? $scope.fixedUI.author : ($scope.setting.axis ? $scope.fixedUI.axis : $scope.fixedUI.axisNo);
            $scope.showLyric();
            // window.console.log('download name:', $scope.song.download);
        };

        // new,skip,bye: n->p, s->p, b->p, e->p, r, u //h= sid:[psbr] | sid:[psbr]，避免重复，长度限定20项
        $scope.playMusic = function(type) {
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
                    // window.console.log('---',type,'--- response:');
                } else {  
                    // window.console.log('NEXTArr TYPE:', type, 'data:', data);
                }
            }, function(reason) {
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
                // window.console.log('Lyrics Reject MSG:', reason.msg);
            });
        };

        // set default disk
        $scope.getGoodLuck = function(persent) {
            if (Number.isInteger(persent) && (persent >= 0 && persent <= 100)) {
                var random = Math.floor(Math.random() * 100);
                return random <= persent ? true : false;
            } else {
                return false;
            }
        };

        // userinfo
        $scope.userinfo = {
            'uid': '',
            'title': '',
            'location': '',
            'signature': '',
            'icon': '',
            'site': '',
            'content': ''
        };

        // get user info
        $scope.viewInfo = function() {
            $scope.status.signed = loginService.getLogStatus();
            $scope.userinfo = loginService.getUserinfo();
            $scope.playrecord();

            if ($scope.userinfo) {
                $scope.inform.userpop = true;
            } else {
                $scope.inform.notiflag = true;
                $scope.inform.loginpop = true;
            }
        };
        // user logout 
        $scope.userLogout = function() {
            // http://www.douban.com/accounts/logout?source=main&ck=CGaK
            // http://www.douban.com/accounts/logout?source=radio&ck=CGaK&no_login=y
            var ck = loginService.getck();
            if (ck) {
                // $scope.setting.logout = 'http://www.douban.com/accounts/logout?source=radio&ck=' + ck + 'no_login=y';
                $scope.setting.logout = 'http://www.douban.com/accounts/logout?source=main&ck=' + ck;
                loginService.removeCookie();
                $scope.inform.notiflag = true;
                $scope.inform.logoutpop = true;
            }
        };

        // play record 
        $scope.playrecord = function() {
            $scope.status.signed = loginService.getLogStatus();
            if ($scope.status.signed) {
                $scope.getplayrecord('played');
                $scope.getplayrecord('liked');
                $scope.getplayrecord('banned');
            }
        };

        // handle play record
        $scope.getplayrecord = function(type) {
            var ck = loginService.getck();
            var bid = loginService.getbid();
            if(ck) {
                // http://douban.fm/j/play_record   & ck, spbid("::"+"bid") type[liked | banned | played]
                // http://douban.fm/j/play_record&ck=AtuV&spbid=%3A%3A HFkddzlnCBw&type=liked;  | banned | played]
                songsService.getPlayRecordRaw(ck, bid, type)
                .then(function(data) {
                    if(data) {
                        switch(type) {
                            case 'played':
                                $scope.record.played = data.total;
                                break;
                            case 'liked':
                                $scope.record.liked = data.total;
                                break;
                            case 'banned':
                                $scope.record.banned = data.total;
                                break;
                        }
                    }
                    window.console.log('type:', type, 'play record:', data);
                }, function(reason) {
                    window.console.log('type:', type, 'REJECTED:', reason);
                });
            }
        };

        // test area function
        $scope.transferdata = function() {
            var ck = loginService.getck();
            if(ck) {
                // http://douban.fm/j/transfer_data  & ck
                // {
                //     "r": 0,
                //     "transfer_info": {
                //         "liked": 0,
                //         "days": 0,
                //         "played": 0
                //     }
                // }
                songsService.getTransferData(ck)
                .then(function(data) {
                    window.console.log('Transfer_data:', data);
                }, function(reason) {
                    window.console.log('Transfer_data REJECTED:', reason);
                });
            }
        };

    }]);

    // get song service
angular.module('musicboxApp')
    .service('songsService',['$http', '$q', '$cookieStore', 'chlService', 'appConstants', function($http, $q, $cookieStore, chlService, appConstants){
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
            window.console.log('SERVICE setSong-Arr: curPos', self.curPos, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
        };

        // return current and next play song
        this.getSongPlay = function() {
            if (self.arrLen && self.curPos <= self.arrLen - 1) {
                self.songinfo = self.songArr[self.curPos] ? self.songArr[self.curPos] : {};
                self.curPos = self.curPos + 1;
                window.console.log('SERVICE getSong-Play: curPos [i = i + 1]', self.curPos, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
                return self.songinfo;
            } else {
                self.curPos = 0;
                if (self.songArrNext) {
                    this.setSongArr(self.songArrNext);
                    self.songinfo = self.songArr[self.curPos] ? self.songArr[self.curPos] : {};
                    self.curPos = self.curPos + 1;
                    self.songArrNext = [];
                    window.console.log('SERVICE getSong-Play: curPos [i = 1]', self.curPos, 'arrLen', self.arrLen, 'songinfo:', self.songinfo);
                    return self.songinfo;
                }
                window.console.log('SERVICE getSong-Play: self.songArrNext === []');
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
            url = 'http://douban.fm/j/mine/playlist?'  + '&type=' + type + '&sid=' + sid + '&pt=' + pt + '&channel=' + channel + '&pb=' + pb + '&from=mainsite&r=' + rd;

            url = history ? url + '&h=' + history : url;

            var thePromise = $http.get(url, {cache: appConstants.useBrowserCache, responseType: 'json'});
            thePromise.success(function(result){
                deferred.resolve(result);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        // generate 10 random number|chars
        this.getRandom = function() {
            var num = '1234567890abcdef', random = '';
            for (var i = 0; i < 10; i++) {
                random += num.charAt(Math.floor(Math.random() * 16));
            }
            return random;  
        };

        // play record raw data
        this.getPlayRecordRaw = function(ck, bid, type) {
            var deferred = $q.defer();
            var url = 'http://douban.fm/j/play_record?ck=' + ck + '&spbid=%3A%3A' + bid + '&type=' + type;

            var thePromise = $http.get(url, {responseType: 'json'});
            thePromise.success(function(result){
                deferred.resolve(result);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };

        // transfer data
        this.getTransferData = function(ck) {
            var deferred = $q.defer();
            var url = 'http://douban.fm/j/transfer_data?ck=' + ck;

            var thePromise = $http.get(url, {responseType: 'json'});
            thePromise.success(function(result){
                deferred.resolve(result);
            }).error(function(response){
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

    }]);
    
    // login service
angular.module('musicboxApp')
    .service('loginService', ['$http', '$q', 'appConstants', function ($http, $q, appConstants) {
        var self = this;
        self.signed = false;
        self.userId = '';
        self.ue = '';
        self.ck = '';
        self.bid = '';
        self.userinfo = {
            'uid': '',
            'title': '',
            'location': '',
            'signature': '',
            'icon': '',
            'site': '',
            'content': ''
        };
        self.userinfoFlag = false;

        this.getUE = function() {
            this.checkUE();
            return self.ue;
        };

        this.getck = function() {
            return self.ck;
        };

        this.getbid = function() {
            return self.bid;
        };

        this.getLogStatus = function() {
            this.checkCookie();
            return self.signed;
        };

        this.checkFmCookie = function() {
            chrome.cookies.get({
                url: 'http://douban.fm',
                name: 'dbcl2'
            }, function(result) {
                if (result) {
                    self.userId = (result.value.split(':')[0]).slice(1);
                    if (self.userId) {
                        self.signed = true;
                        window.console.log('FM loged:', result.value);
                    } else {
                        self.signed = false;
                        // this.checkCookie();
                    }
                } else {
                    self.signed = false;
                    // this.checkCookie();
                }
            });

            chrome.cookies.get({
                url: 'http://douban.fm',
                name: 'ck'
            }, function(result) {
                if (result) {
                    self.ck = result.value.split('"')[1];
                } else {
                    // this.checkCookie();
                    window.console.log('ck is NOT FOUND:', result);
                }
            });

            chrome.cookies.get({
                url: 'http://douban.fm',
                name: 'bid'
            }, function(result) {
                if (result) {
                    self.bid = result.value.split('"')[1];
                } else {
                    window.console.log('bid is NOT FOUND:', result);
                }
            });
        };

        this.removeFmCookie = function() {
            chrome.cookies.set({
                url: 'http://douban.fm',
                name: 'dbcl2',
                value: ''
            }, function(result) {
                window.console.log('Removed FM cookies:', result);
            });

            chrome.cookies.set({
                url: 'http://douban.fm',
                name: 'ck',
                value: ''
            }, function(result) {
                window.console.log('Removed FM cookies:', result);
            });
        };

        this.removeCookie = function() {
            chrome.cookies.set({
                url: 'http://douban.com',
                name: 'dbcl2',
                value: ''
            }, function(result) {
                window.console.log('Removed cookies:', result);
            });

            chrome.cookies.set({
                url: 'http://douban.com',
                name: 'ck',
                value: ''
            }, function(result) {
                window.console.log('Removed cookies:', result);
            });
        };

        this.checkCookie = function() {
            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'dbcl2'
            }, function(result) {
                if (result) {
                    self.userId = (result.value.split(':')[0]).slice(1);
                    if (self.userId) {
                        chrome.cookies.set({
                            url: 'http://douban.fm',
                            name: 'dbcl2',
                            value: result.value
                        });
                        self.signed = true;
                        window.console.log('Douban loged:', result.value);
                    } else {
                        self.signed = false;
                    }
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
                    self.ck = result.value.split('"')[1];
                }
            });

            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'bid'
            }, function(result) {
                if (result) {
                    self.bid = result.value.split('"')[1];
                    if (!self.bid) {
                        window.console.log('bid is NOT FOUND:', result);
                    }
                    chrome.cookies.set({
                        url: 'http://douban.fm',
                        name: 'bid',
                        value: result.value
                    });
                }
            });
        };

        this.checkUE = function() {
            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'ue'
            }, function(result) {
                if (result) {
                    self.ue = result.value.split('"')[1];
                    // window.console.log('UE:', result.value);
                } else {
                    self.ue = '';
                }
            });
        };

        this.getUserinfo = function() {
            if (self.userId) {
                this.userinfoRequest(self.userId)
                .then(function(xmlData) {
                    var xmlDoc = null;
                    try {
                        if (window.DOMParser) {
                            xmlDoc = (new DOMParser()).parseFromString(xmlData, "text/xml");
                            // window.console.log('Created xmlDoc:', xmlDoc);
                        } else {  // window.ActiveXObject
                            xmlDoc = new ActiveXObject("Msxml2.DOMDocument");
                            xmlDoc.async = "false";
                            xmlDoc.loadXML(xmlData);
                        } 
                    } catch(e) {
                        // window.console.log('Create xmlDoc failed');
                    }

                    // var xmlDoc = xmlData.responseXML;  // for XMLHttpRequest 

                    // var xmlDoc = document.implementation.createDocument("", "", null);  // for load .xml file
                    // xmlDoc.async = "false";
                    // xmlDoc.load(xmlData);

                    self.userinfo.uid = xmlDoc.getElementsByTagName('uid')[0].firstChild.nodeValue;
                    self.userinfo.title = xmlDoc.getElementsByTagName('title')[0].firstChild.nodeValue;
                    self.userinfo.location = xmlDoc.getElementsByTagName('location')[0].firstChild.nodeValue;
                    self.userinfo.signature = xmlDoc.getElementsByTagName('signature')[0].firstChild.nodeValue;
                    self.userinfo.content = xmlDoc.getElementsByTagName('content')[0].firstChild.nodeValue;

                    var linkNodes = xmlDoc.getElementsByTagName('link');
                    angular.forEach(linkNodes, function(v, k, a) {
                        if (v.getAttribute('rel') === 'icon') {
                            self.userinfo.icon = v.getAttribute('href');
                        }
                        if (v.getAttribute('rel') === 'alternate') {
                            self.userinfo.site = v.getAttribute('href');
                        }
                    });
                }, function(reason) {
                    // window.console.log('userinfo request REJECTED:', reason);
                    return {};
                });
            }
            return self.userinfo;
        };

        this.userinfoRequest = function(userId) {
            var deferred = $q.defer();

            var url = 'http://api.douban.com/people/' + userId;
            var infoPromise = $http.get(url, {cache: appConstants.useBrowserCache});
            infoPromise.success(function(xmlData) {
                deferred.resolve(xmlData);
            }).error(function(reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
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
                // window.console.log('REQUEST LYRICS:', url);
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

    // expand or compress player
angular.module('musicboxApp')
    .service('expandService', [function () {
        var self = this;

        var service = {
            isexpand : false,

            setExpandStatus : function(status) {
                this.isexpand = status;
                // window.console.log('set expand :', this.isexpand);
            },

            getExpandStatus : function() {
                // window.console.log('get expand :', this.isexpand);
                return this.isexpand;
            }
        };

        return service;
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
