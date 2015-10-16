/**
 * @ngdoc function
 * @name musicboxApp.directive:musicDirective
 * @description
 * # musicDirective
 * Directive of the musicboxApp
 */
'use strict';
// set random or loop, [bind on loop button]
angular.module('musicboxApp')
    .directive('ngLoop', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                scope.loop = false;
                var audio = document.getElementById('musicAudio');
                iElement.bind('click', function() {
                    if (!scope.loop) {
                        scope.$applyAsync(function() {
                            audio.loop = true;
                        });
                    } else {
                        scope.$applyAsync(function() {
                            audio.loop = false;
                        });
                    }
                });
            }
        };
    }]);
// rate current song,  [bind on like button]
angular.module('musicboxApp')
    .directive('ngLike', ['songsService', function(songsService) {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                iElement.bind('click', function() {
                    if (scope.rate === 1) {
                        scope.$applyAsync(function() {
                            scope.playMusic('r');
                        });
                    } else {
                        scope.$applyAsync(function() {
                            scope.playMusic('u');
                        });
                    }
                    if (!scope.status.signed) {
                        scope.inform.notiflag = true;
                        scope.inform.likepop = true;
                    }
                });

                scope.$watch(iAttrs.ngLike, function(newValue, oldValue) {
                    scope.rate = newValue;
                }, true);
            }
        };
    }]);
// audio current time,  [bind on like bye skip button]
// angular.module('musicboxApp')
//     .directive('ngTime', [function () {
//         return {
//             restrict: 'A',
//             link: function (scope, iElement, iAttrs) {
//                 var audio = document.getElementById('musicAudio');
//                 iElement.bind('click', function() {
//                     scope.status.curtime = audio.currentTime;
//                 });
//             }
//         };
//     }]);

// show progress live,  [bind on #progress div]
angular.module('musicboxApp')
    .directive('ngProgress', [function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var audio = document.getElementById('musicAudio');
                var progress = angular.element(document.querySelector('.progress'));
                //var played = angular.element(document.querySelector('#played'));
                var cursor = angular.element(document.querySelector('#cursor'));
                var total = progress.width() - cursor.width();
                var startoffset = cursor.width() / 2;

                scope.$watch(iAttrs.ngTime, function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        if (audio.duration) {
                            var offset = parseFloat(total * parseFloat(newValue / audio.duration).toFixed(2)).toFixed(2);
                            iElement.animate({width: (offset + startoffset)}, 0);
                            cursor.animate({left: (offset - startoffset)}, 0);
                        } else {
                            iElement.width(0);
                            cursor.css('left', 0);
                        }
                    } else {
                        iElement.width(0);
                        cursor.css('left', 0);
                    }
                });
            }
        };
    }]);

// show lyrics live,  [bind on #lyrics-wraper div]
angular.module('musicboxApp')
    .directive('ngLyrics', [function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var offset = 0;
                var audio = document.getElementById('musicAudio');
                var wrap = document.getElementById('lyrics-wrapper');
                var lyricwrap = angular.element(wrap);

                scope.$watch(iAttrs.ngHlindex, function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        scope.$applyAsync(function() {
                            offset = (newValue * (40));
                            lyricwrap.animate({scrollTop: offset}, 100);
                        });
                    } else {
                        if (scope.lyric.valid) {
                            //scope.lyric.tsuseful ? lyricwrap.animate({scrollTop: 0}, 100) : lyricwrap.animate({scrollTop: 180}, 100);
                            if (scope.lyric.tsuseful) {
                                lyricwrap.animate({scrollTop: 0}, 100);
                            } else {
                                lyricwrap.animate({scrollTop: 180}, 100);
                            }
                        }
                    }
                }, true);
            }
        };
    }]);
// show marquee,  [bind on #lyric-line li]
angular.module('musicboxApp')
    .directive('ngLyricMarquee', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                var textWidth = iElement.prop('scrollWidth');
                var wrapWidth = angular.element(document.querySelector('#lyrics-live')).prop('width');

                scope.$watch(iAttrs.ngLyricMarquee, function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        if (textWidth >= wrapWidth) {
                            scope.lyricFull.push(iAttrs.ngLyricMarquee);
                        }
                    }
                });
            }
        };
    }]);
// show marquee,  [bind on SongNamePannel span]
angular.module('musicboxApp')
    .directive('ngShowMarquee', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                if (scope.song.title || scope.song.artist) {
                    var textWidth = iElement.prop('scrollWidth');
                    var wrapWidth = iElement.parent().prop('scrollWidth');
                    var offset = parseInt((wrapWidth + textWidth) / 2) + 'px';

                    if (textWidth >= (wrapWidth - 50)) {
                        scope.showmarquee = true;
                    } else {
                        scope.showmarquee = false;
                    }
                }
            }
        };
    }]);
