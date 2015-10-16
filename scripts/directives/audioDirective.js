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
                        window.console.log('scope.volume:',scope.volume);
                        window.console.log('audio.volume:',audio.volume*100);
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

                iElement.bind('timeupdate', function() {
                    scope.status.curtime = audio.currentTime;

                    scope.$applyAsync(function() {
                        if (scope.lyric.valid && scope.lyric.tsuseful) {
                            angular.forEach(scope.lyric.content, function(lyric, index, arr) {
                                if (audio.currentTime > lyric.ts) {
                                    indexhl = index;
                                    scope.lyric.showline = lyric.line;
                                    if (index < arr.length - 1) {
                                        deltatime = parseFloat(arr[index + 1].ts - lyric.ts).toFixed(2);
                                    }
                                }
                            });
                            scope.lyric.hlindex = indexhl;
                            scope.lyric.deltatime = deltatime;
                        }
                    });
                });
            }
        };
    }]);