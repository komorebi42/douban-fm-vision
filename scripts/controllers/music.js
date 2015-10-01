/**
 * @ngdoc function
 * @name musicboxApp.controller:MusicController
 * @description
 * # MusicController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('MusicController', ['$scope', 'getSongsService', 'playMusicService', 'chlService', 'appConstants', function ($scope, getSongsService, playMusicService, chlService, appConstants) {
        var self = this;
        $scope.pull = 0;
        $scope.songUrl = 'musics/Like Sunday,Like Rain.mp3';  //'http://mr3.douban.com/201308250247/4a3de2e8016b5d659821ec76e6a2f35d/view/song/small/p1562725.mp3';
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
        //
        //b,n,p: 都是返回新的播放列表
        //h= sid:[psbr] | sid:[psbr]，避免重复，长度限定20项
        //type= [bnsur],benpsur
        
        $scope.logInfo = {'user_id':'','token':'','expire':''};
        $scope.songParam = {'type': 'n', 'sid': '', 'cid': '9', 'h': ''};
        //fm= r:random math.random(), rest: sid|sid,未播放的曲目, status: p for playing, du: duration unmove,
        //short: esur, type=e &status=p &uid=4556698 &sid=963365
        //long: bnp, &sid= &h= &channel=1 &type=n
        
        $scope.toggle = function() {
            $scope.playing = !$scope.playing;
            $scope.plug = true;
            if ($scope.plug === true) {
                $scope.plug = !$scope.plug;
            } else {
                $scope.plug = true;
            }
        };

        $scope.cd = {
            defaultCD: 'images/cdplayer/CDdefault.png',
        };

        // 选择频道
        $scope.$on('chlSelected', function(event, chl) {
            $scope.getPlayList.getplaylist('', 'n', chl);
        });

        $scope.getPlayList = {
            getplaylist: function(sid, type, channel) {
                getSongsService.getSongs.play_list(sid, type, channel)
                        .then(function(data) {
                            $scope.songList = data.song;
                            $scope.song = $scope.songList[0];
                            $scope.channel = {
                                "chlId": chlService.getChlId() ,
                                "chlName": chlService.getChlName()
                            };
                            //playMusicService.setUrl($scope.song.url);  //url
                            document.getElementById("musicAudio").src = $scope.song.url;
                            if ($scope.song.picture == null) {
                                document.getElementById("diskimg").src = $scope.cd.defaultCD;
                            } else {
                                document.getElementById("diskimg").src = $scope.song.picture;
                            }
                        });
                    }
        };

        $scope.getPlayList.getplaylist('', 'n', '155');

        //$scope.songs: picture, artist, url, title, length, sid, aid, albumtitle, like
        $scope.songs = {
                "r": 0,
                "is_show_quick_start": 0,
                "song": [{
                    "status": 0,
                    "picture": "http:\/\/img3.douban.com\/lpic\/s4713483.jpg",
                    "alert_msg": "",
                    "albumtitle": "Avril Live Acoustic",
                    "singers": [{
                        "related_site_id": 0,
                        "is_site_artist": false,
                        "id": "5120",
                        "name": "Avril Lavigne"
                    }],
                    "file_ext": "mp3",
                    "like": "0",
                    "album": "\/subject\/2134063\/",
                    "ver": 0,
                    "ssid": "a8c0",
                    "title": "He Wasn't (Live Acoustic Version)",
                    "url": "http:\/\/mr7.doubanio.com\/3f51d64442007445562d89c8dda50ff5\/0\/fm\/song\/p885_128k.mp3",
                    "artist": "Avril Lavigne",
                    "subtype": "",
                    "length": 199,
                    "sid": "885",
                    "aid": "2134063",
                    "sha256": "e42ca791904173e9048225ba01ed73418d92b7c3ac0d7ffc470808805d754f27",
                    "kbps": "128"
                }]
            };
        //调用之前先给songParam填值;
        $scope.loadSongs = function(){
            $scope.isLoading = true;
            /*
            getSongsService.getSongs($scope.logInfo, $scope.songParam)
            .then(
                function(data) {
                    $scope.songs = data.song;
                    $scope.isLoading = false;
                },
                function(){
                    $scope.dataRetrievalError = true;
                    $scope.isLoading = false;
                }
            );
*/
        };

    }])
    .service('getSongsService',['$http', '$q', '$cacheFactory', 'appConstants', function($http, $q, $cacheFactory, appConstants){
        var self = this;
        self.SongsListCache = $cacheFactory('SongsList');
        //$scope.loginfo = {'user_id':'','token':'','expire':''};
        //$scope.songParam = {'sid': '', 'h': '', 'channel': '', 'type': ''};
        //sid: song id , h: history, channel: cid, type: b,e,n,p,s,r,u,
        //var h = songParam.h;
        //var aid = songParam.aid;
        //short: esur, type=e &status=p &uid=4556698 &sid=963365
        //long: bnp, &sid= &h= &channel=1 &type=n

        //http://www.douban.com/j/app/radio/people?app_name=radio_desktop_win&version=100  urlencode编码
        //&user_id=&expire=&token=  认证  '&user_id=' + uid + '&token=' + token + '&expire=' + expire;
        //
        //long report: 垃圾桶(bye)+新频道或开始(new)+曲目为空(playing)
        //short report: 手自动下一曲(s,e)+是否喜欢(r,u);
        //
        //
        
            //if (type === 'b' || type === 'n' || type === 'p') { 
              //  url = url + '&type=' + type + '&sid=' + sid + '&channel=' + cid + '&h=' + h;
            //} else { 
              //  url = url + '&type=' + type + '&sid=' + sid;     
            //}
            
        // 频道选取 
        /*
        $scope.$watch('choosedChl.selectedChl', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                window.console.log('choosedChl.selectChl:' + newVal);
                $scope.apply(this.getSongs.play_list('','n',newVal));
            } else {
                window.console.log('first init');
            }
        });*/

        this.getSongs = {
            play_list: function(sid, type, channel) {
                sid = sid || '';
                type = type || 'e';
                channel = channel || '0';
                var app_name = app_name || 'radio_android';
                var version = version || '630';

                var url = 'http://douban.fm/j/mine/playlist?' + '&sid=' + sid + '&type=' + type + '&channel=' + channel;// + '&app_name=' + app_name + '&version=' + version;  //client=client 认证
                //return this.getSongs.get(url);
                //http://douban.fm/j/mine/playlist?type=n&sid=&pt=0.0&channel=0&from=mainsite&r=c7bc353d05
                window.console.log(url);
                var deferred = $q.defer();
                var thePromise = $http.get(url, {cache: appConstants.useBrowserCache, responseType: 'json'});
                thePromise.success(function(result){
                    deferred.resolve(result);
                }).error(function(response){
                    deferred.reject(response);
                });
                return deferred.promise;
            },

            get: function(url) {
                
            }
            
        };
    }])
    .service('updateSong', ['$http','$scope', '$log', function($http, $scope, $log) {
        $scope.getSongList = function(Type){
            $http({
                method: 'get',
                url: 'http://www.douban.com/j/app/radio/people?app_name=radio_desktop_win&version=100',
                //headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: {
                    'app_name': 'radio_desktop_win',
                    'version': 100,
                    'type': Type,  //类型
                    'sid': $scope.songId,  //需要处理的歌曲
                    'channel': $scope.channel_id  //用户选择的频道
                }
            }).success(function(data){
                $scope.songsList = data.song;
                $log.debug('get songs successed. by http');
            });
        };
    }])
    .filter('trustUrl', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    })
    .service('playMusicService', function() {
        var self = this;
        self.url = '';

        this.setUrl = function(val) {
            return this.url = val;
        };

        this.playMusic = function() {
            var audio = document.getElementById('musicAudio');
            audio.src = this.url;
            //audio.src = 'http://mr3.douban.com/201308250247/4a3de2e8016b5d659821ec76e6a2f35d/view/song/small/p1562725.mp3';
            //http://api.soundcloud.com/tracks/204082098/stream?client_id=17a992358db64d99e492326797fff3e8
            audio.controls = true;
            audio.autoplay = false;
            audio.crossOrigin = 'anonymous';
            audio.play();
            var context = new window.AudioContext() || new window.webkitAudioContext();

            window.addEventListener('load', function(e) {
              var source = context.createMediaElementSource(audio);
              source.connect(context.destination);  
            }, false);
        };  
    });