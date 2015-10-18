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
    .directive('ngLike', ['$timeout', function($timeout) {
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
                    if (!scope.status.signed && !scope.rate) {
                        scope.inform.notiflag = true;
                        scope.inform.likepop = true;
                    }
                });

                scope.$watch(iAttrs.ngLike, function(newValue, oldValue) {
                    $timeout(function() {
                        scope.rate = newValue;
                    }, 2000);
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

// download music,  [bind on .download li]
angular.module('musicboxApp')
    .directive('ngDlink', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var dlink = angular.element(document.querySelector('#downloadlink'));
                scope.$watch(iAttrs.ngHref, function(newValue, oldValue) {
                    $timeout(function() {
                        scope.$applyAsync(function() {
                            dlink.attr('download', scope.song.title + ' - ' + scope.song.artist + '.' + (iAttrs.ngHref.split('.'))[iAttrs.ngHref.split('.').length - 1]);
                        });
                    }, 2000);
                });
            }
        };
    }]);

// show progress live,  [bind on #progress div]
angular.module('musicboxApp')
    .directive('ngProgress', [function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var audio = document.getElementById('musicAudio');
                var progress = angular.element(document.querySelector('.progress'));
                var played = angular.element(document.querySelector('#played'));
                var cursor = angular.element(document.querySelector('#cursor'));
                var total = progress.width() - cursor.width();
                var start = cursor.width();
                
                scope.$watch(iAttrs.ngTime, function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        if (audio.duration) {
                            var offset = total * parseFloat(newValue / audio.duration).toFixed(2);
                            var playedoffset = offset + start;
                            played.animate({width: playedoffset},0);
                            cursor.animate({left: offset}, 0);
                        } else {
                            played.width(0);
                            cursor.css('left', 0);
                        }
                    } else {
                        played.width(0);
                        cursor.css('left', 0);
                    }
                });
            }
        };
    }]);

// show lyrics live,  [bind on #lyrics-wraper div]
angular.module('musicboxApp')
    .directive('ngLyrics', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var offset = 0;
                var wrap = document.getElementById('lyrics-wrapper');
                var lyricwrap = angular.element(wrap);

                scope.$watch(iAttrs.ngHlindex, function(newValue, oldValue) {
                    $timeout(function() {
                        if (newValue != oldValue) {
                            scope.$applyAsync(function() {
                                offset = (newValue * (40));
                                lyricwrap.animate({scrollTop: offset}, 2000);
                            });
                        } else {
                            scope.$applyAsync(function() {
                                if (!scope.lyric.tsuseful) {
                                    lyricwrap.animate({scrollTop: 180}, 5000);
                                } else {
                                    lyricwrap.animate({scrollTop: 0}, 1000);
                                }
                            });
                        }
                    }, 2000);
                }, true);
            }
        };
    }]);
// show image in the middle,  [bind on #lyrics-image img]  //ng-imageleft value="song.title"
angular.module('musicboxApp')
    .directive('ngImageleft', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                scope.$watch(iAttrs.value, function() {
                    $timeout(resetPos(), 2000);
                    function resetPos() {
                        var offset =  (iElement.height() - iElement.width()) / 2;
                        window.console.log('image width:', iElement.width());
                        window.console.log('image height:', iElement.height());
                        window.console.log('image offset:', offset);
                        if (iElement.width()) {
                            iElement.css('left', offset);
                            iElement.css('visibility', 'visible');
                        } else {
                            iElement.css('left', 0);
                            iElement.css('visibility', 'visible');
                        }
                    }
                });
            }
        };
    }]);

// show marquee,  [bind on #lyric-line li]
angular.module('musicboxApp')
    .directive('ngLyricMarquee', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                var textWidth = iElement.prop('scrollWidth');
                var wrapWidth = angular.element(document.querySelector('#lyrics-live')).width();
                $timeout(function() {
                    scope.$watch(iAttrs.marqline, function(newValue, oldValue) {
                        if (newValue != oldValue) {
                            if (textWidth >= wrapWidth) {
                                scope.lyric.marq.push(iAttrs.marqline);
                            }
                        }
                    });
                }, 2000);
            }
        };
    }]);
// show marquee,  [bind on SongNamePannel span]
angular.module('musicboxApp')
    .directive('ngShowMarquee', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                scope.$watch(iAttrs.value, function(newValue, oldValue) {
                    $timeout(function() {
                        if (scope.song.title || scope.song.artist) {
                            var textWidth = iElement.prop('scrollWidth');
                            var wrapWidth = iElement.parent().width();
                            // window.console.log('show marquee:', textWidth, wrapWidth);
                            //  var offset = parseInt((wrapWidth + textWidth) / 2) + 'px';

                            if (textWidth >= (wrapWidth - 50)) {
                                scope.showmarquee = true;
                                window.console.log('show marquee: true');
                            } else {
                                scope.showmarquee = false;
                                window.console.log('show marquee: false');
                            }
                        }
                    }, 2000);
                }, true);
            }
        };
    }]);
