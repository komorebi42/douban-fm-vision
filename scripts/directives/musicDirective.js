/**
 * @ngdoc function
 * @name musicboxApp.directive:musicDirective
 * @description
 * # musicDirective
 * Directive of the musicboxApp
 */
'use strict';
    //  change play status
angular.module('musicboxApp')
    .directive('ngPlay', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement) {
                scope.toggle = true;
                iElement.bind('click', function() {
	                var audio = document.getElementById('musicAudio');
                    if (!scope.toggle) {
                    	scope.$applyAsync(function() {
                        	audio.play();
                            scope.playing = true;
                            scope.paused = false;
                            scope.toggle = !scope.toggle;
                    	});
                    } else {
                    	scope.$applyAsync(function() {
                    		audio.pause();
                            scope.playing = false;
                            scope.paused = true;
                            scope.toggle = !scope.toggle;
                    	});
                    }
                });

                // according playing status controll audio player
                scope.$watch(scope.playing, function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        var audio = document.getElementById('musicAudio');
                        if (!scope.playing) {
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
    // set random or loop
angular.module('musicboxApp')
    .directive('ngSingleLoop', [function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                scope.loop = false;
                iElement.bind('click', function() {
                    var audio = document.getElementById('musicAudio');
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
    // rate current song
angular.module('musicboxApp')
    .directive('ngLike', ['songsService', function (songsService) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
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
                });
            }
        };
    }]);
    // get currentTime
angular.module('musicboxApp')
    .directive('ngCurrentTime', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var audio = document.getElementById('musicAudio');
                iElement.bind('click', function() {
                    scope.$applyAsync(function() {                        
                        scope.currentTime = $filter('number')(audio.currentTime, 1);
                    });
                });
            }
        };
    }]);
    // volume controll
angular.module('musicboxApp')
    .directive('ngVolume', [function () {
        return {
            restrict: 'A',
            /*scope: {
                vol: '='
            },*/
            link: function (scope, iElement, iAttrs) {
                //scope.vol = 75;
                scope.$watch(scope.vol, function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        scope.$applyAsync(function() {
                            var audio = document.getElementById('musicAudio');
                            audio.volume = parseInt(newValue) / parseInt(iAttrs.max);
                            window.console.log(scope.vol);
                            window.console.log(newValue);
                            window.console.log(iAttrs.value);
                            window.console.log(audio.volume);
                        });
                    } else {
                        window.console.log(scope.vol);
                        window.console.log(iAttrs.value);
                    }
                }, true);                
            }
        };
    }]);
    //  check play ended
angular.module('musicboxApp')
    .directive('ngAutoEnded', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var audio = document.getElementById('musicAudio');

                iElement.bind('ended', function() {
                    scope.$applyAsync(function() {
                        scope.currentTime = $filter('number')(audio.currentTime, 1);
                        scope.playing = false;
                        scope.toggleflag = false;
                        scope.imguseful = false;
                        scope.endedSong();
                    });
                });
            }
        };
    }]);
    //  check play paused
angular.module('musicboxApp')
    .directive('ngAutoPaused', ['$filter', function ($filter) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var audio = document.getElementById('musicAudio');
                iElement.bind('waiting', function() {
                    scope.$applyAsync(function() {
                        scope.currentTime = $filter('number')(audio.currentTime, 1);
                        scope.paused = true;
                    });
                });
            }
        };
    }]);
    // show lyrics
angular.module('musicboxApp')
    .directive('ngLyrics', [function () {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                var audio = document.getElementById('musicAudio');
                iElement.bind('timeupdate', function() {
                    angular.forEach(scope.lyric.content, function(val, key, arr) {
                        if (audio.currentTime > val[0]) {
                            scope.lyric.show = val[1]; //css top: line height
                        }
                    });
                });
            }
        };
    }]);
    // show marquee
angular.module('musicboxApp')
    .directive('ngShowMarquee', ['$window', '$timeout', '$animate', function ($window, $timeout, $animate) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                $timeout(function() {
                    var textWidth = iElement.prop('scrollWidth');
                    var wrapWidth = iElement.parent().prop('scrollWidth');
                    //var offset = parseInt((wrapWidth + textWidth) / 2) + 'px';
                    
                    if (textWidth >= wrapWidth) {
                        scope.showmarquee = true;
                        //return true;
                    } else {
                        scope.showmarquee = false;
                        //return false;
                    }
                }, 5000);
            }
        };
    }]);