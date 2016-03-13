/**
 * @ngdoc function
 * @name musicboxApp.directive:musicDirective
 * @description
 * # musicDirective
 * Directive of the musicboxApp
 */
'use strict';
// ng-music, [bind on content div]
angular.module('musicboxApp')
    .directive('ngContent', [function () {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'views/music.html',
            // link: function (scope, iElement, iAttrs) {
            // }
        };
    }]);

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
    .directive('ngRate', ['$timeout', 'loginService','$http', function($timeout, loginService, $http) {
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
                                        window.console.log('rate:', scope.rate, ' rate changged');
                                    }
                                    window.console.log('rate:', scope.rate);
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
                        var filename = scope.song.title + ' - ' + scope.song.artist + '.' + (iAttrs.ngHref.split('.'))[iAttrs.ngHref.split('.').length - 1];
                        console.log('file:', filename);
                        // console.log('filename:', scope.song.filename);

                        // window.downloadFile.isChrome || window.downloadFile.isSafari
                        var link = document.createElement('a');
                        link.href = scope.song.url;
                        link.download = filename;

                        // chrome.runtime.sendMessage({"url": scope.song.url, "file": filename});

                        if (document.createEvent) {
                            var e = document.createEvent('MouseEvents');
                            e.initEvent('click', true, true);
                            link.dispatchEvent(e);
                            return true;
                        } else {
                            return false;  // cancel navigation
                        }
                    });
                });
            }
        };
    }]);

// chrome.extension.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         // console.log("onMessage: " + document.title.split('-')[0].trim() + ":" + request.url);
//         // set_download_url(request.url);

//         var dlink = $('#downloadlink');
//         var title = $('#SongNamePannel');

//         var filename = title.innerHtml + '.mp4';
//         console.log('file:', filename);
//         console.log('url:', request.url);
//         console.log('download:', request.download);
//         chrome.runtime.sendMessage({"url": request.url, "file": filename});

//         if (request.download) {
//             dlink[0].click();
//         }
//     }
// );

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
angular.module('musicboxApp')
    .directive('ngImageleft', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function (scope, iElement, iAttrs) {
                scope.$watch(iAttrs.value, function() {
                    $timeout(resetPos(), 300);
                    function resetPos() {
                        var offset =  (iElement.height() - iElement.width()) / 2;
                        // window.console.log('image width:', iElement.width());
                        // window.console.log('image height:', iElement.height());
                        // window.console.log('image offset:', offset);
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

                            if (textWidth >= (wrapWidth - 100)) {
                                scope.showmarquee = true;
                                // window.console.log('show marquee: true');
                            } else {
                                scope.showmarquee = false;
                                // window.console.log('show marquee: false');
                            }
                        }
                    }, 300);
                }, true);
            }
        };
    }]);
