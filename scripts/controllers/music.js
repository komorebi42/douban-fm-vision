/**
 * @ngdoc function
 * @name musicboxApp.controller:MusicController
 * @description
 * # MusicController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('MusicController', ['$scope', 'getSongsService', 'playMusicService', function ($scope, getSongsService, playMusicService) {
        $scope.pull = 0;
        $scope.songUrl = 'musics/Like Sunday,Like Rain.mp3';  //'http://mr3.douban.com/201308250247/4a3de2e8016b5d659821ec76e6a2f35d/view/song/small/p1562725.mp3';
        //$scope.songs: album, picture, artist, url, title, length, sid, aid, albumtitle, like
        
        $scope.setPull = function() {
            /* Act on the event */
            $scope.pull = 1;
        };

        $scope.isPull = function(pull) {
            $scope.$apply(playMusicService.playMusic());
            return ($scope.pull === pull);
        };

        $scope.pullBack = function() {

        };

        $scope.playMusic = function () {
        };

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
    
        //$scope.songs: album, picture, artist, url, title, length, sid, aid, albumtitle, like
        $scope.songs = [{
                'album': '/subject/5952615/',
                'picture': 'http://img3.douban.com/mpic/s4616653.jpg',
                'ssid': 'e1b2',
                'artist': 'Bruno Mars / B.o.B',
                'url': 'http://mr3.douban.com/201308250247/4a3de2e8016b5d659821ec76e6a2f35d/view/song/small/p1562725.mp3',
                'company': 'EMI',
                'title': 'Nothing On You',
                'rating_avg': 4.04017,
                'length': 267,
                'subtype': '',
                'public_time': '2011',
                'sid': '1562725',
                'aid': '5952615',
                'sha256': '2422b6fa22611a7858060fd9c238e679626b3173bb0d161258b4175d69f17473',
                'kbps': '64',
                'albumtitle': '2011 Grammy Nominees',
                'like': 1
            }];
        //调用之前先给songParam填值;
        $scope.loadSongs = function(){
            $scope.isLoading = true;

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
        };

    }])
    .service('getSongsService',['$http', '$q', '$cacheFactory', 'appConstants', function($http, $q, $cacheFactory, appConstants){
        var self = this;
        self.SongsListCache = $cacheFactory('SongsList');

        this.getSongs = function(logInfo, songParam){
            //$scope.loginfo = {'user_id':'','token':'','expire':''};
            //$scope.songParam = {'sid': '', 'h': '', 'channel': '', 'type': ''};
            var uid = logInfo.user_id;
            var token = logInfo.token;
            var expire = logInfo.expire;
            //sid: song id , h: history, channel: cid, type: b,e,n,p,s,r,u,
            var sid = songParam.sid;
            var cid = songParam.cid;
            var type = songParam.type;
            var h = songParam.h;
            //var aid = songParam.aid;
            //short: esur, type=e &status=p &uid=4556698 &sid=963365
            //long: bnp, &sid= &h= &channel=1 &type=n

            //http://www.douban.com/j/app/radio/people?app_name=radio_desktop_win&version=100  urlencode编码
            //&user_id=&expire=&token=
            var url0 = appConstants.doubanSongUrl + '?app_name=radio_desktop_win&version=100';
            var url = '';
            if (uid !== '') {
                url = url0 + '&user_id=' + uid + '&token=' + token + '&expire=' + expire;
            }
            //long report: 垃圾桶(bye)+新频道或开始(new)+曲目为空(playing)
            //short report: 手自动下一曲(s,e)+是否喜欢(r,u);
            if (type === 'b' || type === 'n' || type === 'p') { 
                url = url + '&type=' + type + '&sid=' + sid + '&channel=' + cid + '&h=' + h;
            } else { 
                url = url + '&type=' + type + '&sid=' + sid;     
            }
            console.log(url);

            var deferred = $q.defer();
            var thePromise = $http.get(url, {cache: appConstants.useBrowserCache});
            thePromise.success(function(result){
                deferred.resolve(result);
            }).error(function(response){
                deferred.reject(response);
            });
            return deferred.promise;
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
        //var self = this;
/*
        this.playMusic = function() {
            var audio = new Audio();
            audio.src = 'http://api.soundcloud.com/tracks/204082098/stream?client_id=17a992358db64d99e492326797fff3e8';
            //audio.src = 'http://mr3.douban.com/201308250247/4a3de2e8016b5d659821ec76e6a2f35d/view/song/small/p1562725.mp3';
            audio.controls = true;
            audio.autoplay = false;
            audio.crossOrigin = 'anonymous';
            document.getElementById('album').appendChild(audio);

            var context = new window.AudioContext() || new window.webkitAudioContext();

            window.addEventListener('load', function(e) {
              var source = context.createMediaElementSource(audio);
              source.connect(context.destination);  
            }, false);
        };     */   
    });