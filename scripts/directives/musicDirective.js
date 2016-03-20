/**
 * @ngdoc function
 * @name musicboxApp.directive:musicDirective
 * @description
 * # musicDirective
 * Directive of the musicboxApp
 */
'use strict';

// ng-music, [bind on content div]
angular.module('musicboxApp').directive('ngContent', [function () {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/music.html'
        // link: function (scope, iElement, iAttrs) {
        // }
    };
}]);

// set random or loop, [bind on loop button]
angular.module('musicboxApp').directive('ngLoop', [function() {
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
angular.module('musicboxApp').directive('ngRate', ['$timeout', 'loginService', function($timeout, loginService) {
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            iElement.bind('click', function() {
                scope.$applyAsync(function() {
                    if (scope.rate) {
                        scope.$applyAsync(function() {
                            scope.playMusic('r');

                            scope.status.signed = loginService.getLogStatus();
                            if (!scope.status.signed) {
                                if (scope.rate) {
                                    scope.inform.notiflag = true;
                                    scope.inform.likepop = true;
                                    scope.inform.loginpop = false;
                                    scope.inform.chlpop = false;
                                    scope.inform.favpop = false;
                                    scope.inform.logoutpop = false;
                                } else {
                                    console.log('rate:', scope.rate, ' rate changged');
                                }
                                console.log('rate:', scope.rate);
                            }
                            scope.song.like = true;
                        });
                    } else {
                            scope.playMusic('u');
                            scope.song.like = false;
                    }
                });
            });

            scope.$watch(iAttrs.ngLike, function(newValue, oldValue) {
                if (newValue) {
                    scope.$applyAsync(function() {
                        scope.rate = true;
                    });
                } else {
                    scope.$applyAsync(function() {
                        scope.rate = false;
                    });
                }
            });
        }
    };
}]);

// // login,  [bind on span li.login]
// angular.module('musicboxApp')
//     .directive('ngLogin', ['loginService', function (loginService) {
//         return {
//             restrict: 'A',
//             link: function (scope, iElement, iAttrs) {
//                 iElement.bind('click', function() {
//                     scope.status.signed = loginService.getLogStatus();
//                     if (scope.status.signed) {  // loged in
//                         // scope.inform.userpop ? scope.inform.userpop = false : scope.viewInfo();
//                         if (scope.inform.userpop) {
//                             scope.inform.userpop = false;
//                         } else {
//                             scope.viewInfo();
//                         }
//                     } else {
//                         if (scope.inform.loginpop) {
//                             scope.inform.notiflag = false;
//                             scope.inform.loginpop = false;
//                         } else {
//                             scope.inform.notiflag = true;
//                             scope.inform.loginpop = true;
//                             scope.inform.chlpop = false;
//                             scope.inform.likepop = false;
//                             scope.inform.favpop = false;
//                             scope.inform.logoutpop = false;
//                         }
//                     }
//                 });
//             }
//         };
//     }]);

// download music,  [bind on .download li]
angular.module('musicboxApp').directive('ngDlink', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttrs) {
            var dlink = angular.element(document.querySelector('#downloadlink'));

            dlink.on('click', function (e) {
                e.preventDefault();

                scope.$applyAsync(function() {
                    var url = scope.song.url,
                        title = (scope.song.title).replace(/\s+/g, '.'),  //  document.title.split('-')[0].trim()
                        artist = (scope.song.artist).replace(/\s+/g, '.'),
                        re_ext = /.+\/.+(\.mp[34]).*/,
                        ext = (re_ext.exec(url))[1],  // ext = (iAttrs.ngHref.split('.'))[iAttrs.ngHref.split('.').length - 1] || ".mp3";

                        re = /.+\/.+_(.+k)(_1v)?.+/,
                        bps = (re.exec(url))[1],
                        filename;

                    if (bps) {
                        filename = title + '-' + artist + '[' + bps + ']' + ext;
                    } else {
                        filename = title + '-' + artist + ext;
                    }
                    chrome.runtime.sendMessage({"url": url, "filename": filename});

                    // console.log("filename:", filename,'url:', url,'bps:', bps,'ext:', ext);
                    // // save file
                    // var link = document.createElement('a');
                    //     link.href = url;
                    //     link.download = filename;
                    //
                    // var ev = new Event('click', {'bubbles': false, 'cancelable': false});
                    // link.dispatchEvent(ev);
                    
                });
            });
        }
    };
}]);

// show progress live,  [bind on #progress div]
angular.module('musicboxApp').directive('ngProgress', [function () {
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
angular.module('musicboxApp').directive('ngLyrics', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttrs) {
            var offset = 0;
            var wrap = document.getElementById('lyrics-wrapper');
            var lyricwrap = angular.element(wrap);

            scope.$watch(iAttrs.ngHlindex, function(newValue, oldValue) {
                $timeout(function() {
                    if (newValue === -999) {
                        scope.$applyAsync(function() {
                            lyricwrap.animate({scrollTop: 0}, 200);
                        });
                    }
                    if (newValue != oldValue) {
                        scope.$applyAsync(function() {
                            offset = (newValue * (40));
                            lyricwrap.animate({scrollTop: offset}, 200);
                        });
                    } else {
                        scope.$applyAsync(function() {
                            // if (!scope.lyric.tsuseful) {
                            //     lyricwrap.animate({scrollTop: 180}, 2000);
                            // } else {
                                lyricwrap.animate({scrollTop: 0}, 1000);
                            // }
                        });
                    }
                }, 300);
            }, true);
        }
    };
}]);
// show image in the middle,  [bind on #lyrics-image img]  //ng-imageleft value="song.title"
angular.module('musicboxApp').directive('ngImageleft', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function (scope, iElement, iAttrs) {
            scope.$watch(iAttrs.value, function() {
                $timeout(resetPos(), 300);
                function resetPos() {
                    var offset =  (iElement.height() - iElement.width()) / 2;
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
angular.module('musicboxApp').directive('ngLyricMarquee', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            var textWidth = iElement.prop('scrollWidth');
            var wrapWidth = angular.element(document.querySelector('#lyrics-live')).width();
            $timeout(function() {
                scope.$watch(iAttrs.marqline, function(newValue, oldValue) {
                    scope.$applyAsync(function() {
                        if (newValue != oldValue) {
                            if (textWidth >= wrapWidth) {
                                scope.lyric.marq.push(iAttrs.marqline);
                            }
                        }
                    });
                });
            }, 50);
        }
    };
}]);

// show marquee,  [bind on SongNamePannel span]
angular.module('musicboxApp').directive('ngShowMarquee', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, iElement, iAttrs) {
            scope.$watch(iAttrs.value, function(newValue, oldValue) {
                $timeout(function() {
                    if (scope.song.title || scope.song.artist) {
                        var textWidth = iElement.prop('scrollWidth');
                        var wrapWidth = iElement.parent().width();
                        scope.showmarquee = textWidth >= (wrapWidth - 100);
                    }
                }, 300);
            }, true);
        }
    };
}]);