/**
 * @ngdoc function
 * @name musicboxApp.directive:audioDirective
 * @description
 * # audioDirective
 * Directive of the musicboxApp
 */
'use strict';
// expand or compress player
angular.module('musicboxApp')
    .directive('ngExpand', [function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                scope.$applyAsync(function() {
                    var player = angular.element(document.querySelector('#MusicBox'));
                    var pannel = angular.element(document.querySelector('#RightPannel'));
                    scope.$watch(iAttrs.isexpand, function(newValue, oldValue) {
                        if (newValue) {
                            player.animate({left: 665}, 3000);  //left: 50% of (2280px - 800px)=700
                            //pannel.animate({right: 830}, 3000);  //right: 50% of (2280px - 540px)
                        } else {
                            player.animate({left: 44}, 3000);  // left: 2% of 2280px
                            //pannel.animate({right: 132}, 3000);  // right: 6% of 2280px
                        }
                    }, true);
                });
            }
        };
    }]);
//  change play status, [bind on #cd-button] AudioController
angular.module('musicboxApp')
    .directive('ngPlug', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement) {
                scope.toggle = true;
                var audio = document.getElementById('musicAudio');
                iElement.bind('click', function() {
                    if (!scope.toggle) {
                        scope.$applyAsync(function() {
                            audio.play();
                            scope.status.playing = true;
                            scope.toggle = !scope.toggle;
                        });
                    } else {
                        scope.$applyAsync(function() {
                            audio.pause();
                            scope.status.playing = false;
                            scope.toggle = !scope.toggle;
                        });
                    }
                });
            }
        };
    }]);
//  check play status,  [bind on #musicAudio] AudioController
angular.module('musicboxApp')
    .directive('ngStatus', ['$filter', function($filter) {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                iElement.bind('loadstart', function() {
                    scope.$applyAsync(function() {
                        scope.paused = true;
                    });
                });
                iElement.bind('waiting', function() {
                    scope.$applyAsync(function() {
                        scope.paused = true;
                    });
                });
                iElement.bind('playing', function() {
                    scope.$applyAsync(function() {
                        scope.paused = false;
                    });
                });
                iElement.bind('ended', function() {
                    scope.$applyAsync(function() {
                        if (!scope.loop) {
                            scope.curtime = $filter('number')(iElement.currentTime, 1);
                            scope.playMusic('e');
                        }
                    });
                });

                // according playing status controll audio player
                var audio = document.getElementById('musicAudio');
                scope.$watch(iAttrs.playing, function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        if (newValue) {
                            scope.$applyAsync(function() {
                                audio.play();
                            });
                        } else {
                            scope.$applyAsync(function() {
                                audio.pause();
                            });
                        }
                    }
                }, true);
            }
        };
    }]);
// volume controll,  [bind on #musicAudio] AudioController
angular.module('musicboxApp')
    .directive('ngVolume', ['songsService', function(songsService) {
        return {
            restrict: 'A',
            scope: {
                volume: '=volume',
                maximum: '=maxVol'
            },
            link: function(scope, iElement, iAttrs) {
            	var audio = document.getElementById('musicAudio');
                scope.$watch('volume', function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        scope.$applyAsync(function() {
                            audio.volume = parseInt(newValue) / parseInt(scope.maximum);
                            audio.play();
                            songsService.setVolume(newValue);
                        });
                    } else {
                        // window.console.log('scope.volume:',scope.volume);
                        // window.console.log('audio.volume:',audio.volume*100);
                    }
                }, true);
            }
        };
    }]);
// play timeupdate,  [bind on #musicAudio]  AudioController
angular.module('musicboxApp')
    .directive('ngTimeupdate', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                var indexhl = 0;
                var deltatime = 0;
                var audio = document.getElementById('musicAudio');
                // var wrap = document.getElementById('lyrics-wrapper');
                // var lyricwrap = angular.element(wrap);

                iElement.bind('timeupdate', function() {
                    scope.status.curtime = audio.currentTime;

                    if (audio.currentTime === 1) {
                        scope.lyric.hlindex = 0;  // first line when start
                    }
                    scope.$applyAsync(function() {
                        if (scope.lyric.valid && scope.lyric.tsuseful) {
                            angular.forEach(scope.lyric.content, function(lyric, index, arr) {
                                if (audio.currentTime > lyric.ts) {
                                    indexhl = index;
                                    scope.lyric.showline = lyric.line;
                                    scope.showLyric.line1 = lyric.line;
                                    if (index < arr.length - 1) {
                                        deltatime = parseFloat(arr[index + 1].ts - lyric.ts).toFixed(2);
                                        scope.showLyric.line2 = arr[index + 1].line;
                                    } else {
                                        scope.showLyric.line1 = '';
                                        scope.showLyric.line2 = '- END -';
                                    }
                                }
                            });
                            scope.lyric.hlindex = indexhl;
                            scope.lyric.deltatime = deltatime;
                        } else {
                            scope.lyric.hlindex = -999;
                            scope.lyric.deltatime = 0;
                        }
                        // if (scope.lyric.valid && !scope.lyric.tsuseful) {  // user can't scroll the lyrics cuz timeupdate realtime
                        //     lyricwrap.animate({scrollTop: 180}, 3000);
                        // } else {
                        //     lyricwrap.animate({scrollTop: 0}, 1000);
                        // }
                    });
                });
            }
        };
    }]);
//  added music information link to Douban FM, function added at 2015-10-30, ver. 1.0.1.0
angular.module('musicboxApp')
    .directive('ngAlbum', [function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                iElement.bind('click', function() {
                    if (scope.song) {
                        var url = 'http://music.douban.com';
                        url += scope.song.album;
                        var l = (window.screen.width - 30 - 1280) / 2;
                        var t = (window.screen.height - 10 - 800) / 2;
                        window.open(url, '_blank', 'width=1280,height=800,left=' + l + ',top=' + t + ',toolbar=yes,menubar=yes,scrollbars=yes,resizable=yes,location=yes,status=yes');    
                    }
                });
            }
        };
    }]);
