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
                scope.rate = songsService.getSong().like;
                iElement.bind('click', function() {
                    if (!scope.rate) {
                        scope.$applyAsync(function() {
                            scope.getNextPlay('r');
                        });
                    } else {
                        scope.$applyAsync(function() {
                            scope.getNextPlay('u');
                        });
                    }
                    if (!scope.status.signed) {
                        scope.inform.notiflag = true;
                        scope.inform.likepop = true;
                    }
                });
            }
        };
    }]);
// audio current time,  [bind on like bye skip button]
angular.module('musicboxApp')
    .directive('ngTime', [function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var audio = document.getElementById('musicAudio');
                iElement.bind('click', function() {
                    scope.status.curtime = audio.currentTime;
                });
            }
        };
    }]);
// show marquee,  [bind on SongNamePannel span]
angular.module('musicboxApp')
    .directive('ngShowMarquee', ['$window', '$timeout', '$animate', function($window, $timeout, $animate) {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                $timeout(function() {
                    var textWidth = iElement.prop('scrollWidth');
                    var wrapWidth = iElement.parent().prop('scrollWidth');
                    //var offset = parseInt((wrapWidth + textWidth) / 2) + 'px';
                    if (textWidth >= wrapWidth) {
                        scope.showmarquee = true;
                    } else {
                        scope.showmarquee = false;
                    }
                }, 5000);
            }
        };
    }]);
// show marquee,  [bind on #lyric-line li]
angular.module('musicboxApp')
    .directive('ngLyricMarquee', ['$window', '$timeout', '$animate', function($window, $timeout, $animate) {
        return {
            restrict: 'A',
            link: function(scope, iElement, iAttrs) {
                $timeout(function() {
                    var textWidth = iElement.prop('scrollWidth');
                    var wrapWidth = iElement.parent().prop('scrollWidth');
                    //var offset = parseInt((wrapWidth + textWidth) / 2) + 'px';
                    if (textWidth >= wrapWidth) {
                        scope.showmarquee2 = true;
                    } else {
                        scope.showmarquee2 = false;
                    }
                }, 5000);
            }
        };
    }]);
