/**
 * @ngdoc function
 * @name musicboxApp.directive:audioDirective
 * @description
 * # audioDirective
 * Directive of the musicboxApp
 */
'use strict';
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
            // scope: {
            // 	playing: '@'
            // },
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
                            scope.status.playing = false;
                            scope.imguseful = false;
                            scope.endedSong();
                        }
                    });
                });

                // according playing status controll audio player
                var audio = document.getElementById('musicAudio');
                scope.$watch('playing', function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        if (!newValue) {
                            scope.$applyAsync(function() {
                                audio.pause();
                            });
                        } else {
                            scope.$applyAsync(function() {
                                audio.play();
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
            // scope: {
            //     volume: '='
            // },
            link: function(scope, iElement, iAttrs) {
            	var audio = document.getElementById('musicAudio');
                scope.$watch('volume', function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        scope.$applyAsync(function() {
                            audio.volume = parseInt(newValue) / parseInt(iAttrs.max);
                            audio.play();
                            songsService.setVolume(newValue);
                            window.console.log('newValue:',newValue);
                            window.console.log('audio.volume:',audio.volume);
                            window.console.log('scope.volume:',volume);
                        });
                    } else {
                        window.console.log('scope.volume:',volume);
                        window.console.log('audio.volume:',audio.volume);
                    }
                }, true);
            }
        };
    }]);
// show lyrics,  [bind on #musicAudio] AudioController
angular.module('musicboxApp')
    .directive('ngLyrics', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                var indexhl = 0;
                var indexck = 0;
                var deltatime = 0;
                var offset = '';
                var testnum = 0;
                var audio = document.getElementById('musicAudio');
                var wrap = document.getElementById('lyrics-wrapper');
                var live = document.getElementById('lyrics-live');
                var lyricwrap = angular.element(wrap);
                var lyriclive = angular.element(live);
                // var scrollTo = function(container, target, offset){
                //     var ele = angular.element(target);
                //     angular.element(container).animate({scrollTop: offset}, "slow");
                // };
                iElement.bind('timeupdate', function() {
                    scope.$applyAsync(function() {
                        if (scope.lyric.valid && scope.lyric.withTS) {
                            angular.forEach(scope.lyric.content, function(lyric, index, arr) {
                                if (audio.currentTime > lyric.ts) {
                                    indexhl = index;
                                    scope.lyric.showline = lyric.line;
                                    if (index < arr.length - 1) {
                                        deltatime = Math.round(parseFloat(arr[index + 1].ts - lyric.ts) * 100) / 100;
                                    } else {
                                        indexck = 0;
                                    }
                                }
                            });
                            scope.lyric.hlindex = indexhl;
                            scope.lyric.deltatime = deltatime;
                            if (indexhl && indexhl != indexck) {
                                window.console.log('TEST NUM:', testnum);
                                testnum++;
                                indexck = indexhl;
                                offset = (indexhl * (40)) + 'px';
                                //lyriclive.animate({scrollTop: offset}, "slow");
                                //lyriclive.scrollTop = offset;
                                //lyriclive.scrollTop(offset);
                                lyriclive.animate({scrollTop: offset}, "slow");
                                //lyriclive.scrollTop = offset;
                                //lyriclive.scrollTop(offset);
                            }
                        } else if (scope.lyric.valid && !scope.lyric.withTS) {
                        	//scope.lyric.textonly = true;
                        	// var total = audio.duration;
                        	// var lyricLength = scope.lyric.content.length;
                        	// var timeoffset = parseFloat(total/lyricLength).toFixed(2);
                        	// var timeupdate = timeoffset;
                        	// angular.forEach(scope.lyric.content, function(lyric, index, arr) {
                        	// 	if (audio.currentTime > timeupdate) {
                        	// 		indexhl = index;
                        	// 		scope.lyric.showline = lyric.line;
                        	// 		timeupdate += timeoffset;
                        	// 	}
                        	// });
                        }
                    });
                });
            }
        };
    }]);