/**
 * @ngdoc function
 * @name musicboxApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the musicboxApp
 */
'use strict';
// login controller
angular.module('musicboxApp')
    .controller('LoginController', ['$scope', 'loginService', 'songsService', function($scope, loginService, songsService) {

        $scope.setting = {
            'ue': '',
            'logout': '',
        };

        // userinfo
        $scope.userinfo = {
            'uid': '',
            'title': '',
            'location': '',
            'signature': '',
            'icon': '',
            'site': '',
            'content': ''
        };

        $scope.isLoged = function() {
            $scope.status.signed = loginService.getLogStatus();
        };

        // close the popup 
        $scope.chlpopClose = function() {
            $scope.inform.notiflag = false;
            $scope.inform.chlpop = false;
        };
        $scope.likepopClose = function() {
            $scope.inform.notiflag = false;
            $scope.inform.likepop = false;
        };
        $scope.favpopClose = function() {
            $scope.inform.notiflag = false;
            $scope.inform.favpop = false;
        };
        $scope.loginpopClose = function() {
            $scope.inform.notiflag = false;
            $scope.inform.loginpop = false;
        };
        $scope.logoutpopClose = function() {
            $scope.inform.notiflag = false;
            $scope.inform.logoutpop = false;
        };

        // get user info 1.0
        // $scope.viewInfo = function() {
        //     $scope.status.signed = loginService.getLogStatus();
        //     $scope.userinfo = loginService.getUserinfo();
        //     $scope.playrecord();

        //     if ($scope.userinfo) {
        //         $scope.inform.userpop = true;
        //         $scope.$broadcast('updateChls', {
        //             'content': 'loged in'
        //         });
        //     } else {
        //         $scope.inform.notiflag = true;
        //         $scope.inform.loginpop = true;
        //         $scope.inform.chlpop = false;
        //         $scope.inform.likepop = false;
        //         $scope.inform.favpop = false;
        //         $scope.inform.logoutpop = false;
        //     }
        // };

        // get user info 2.0
        $scope.viewInfo = function() {
            $scope.status.signed = loginService.getLogStatus();
            var userId = loginService.getuid();
            $scope.playrecord(); // update personal record;

            if (userId) {
                var userinfo = {
                    'uid': '',
                    'title': '',
                    'location': '',
                    'signature': '',
                    'icon': '',
                    'site': '',
                    'content': ''
                };
                loginService.userinfoRequest(userId)
                    .then(function(xmlData) {
                        var xmlDoc = null;
                        try {
                            if (window.DOMParser) {
                                xmlDoc = (new DOMParser()).parseFromString(xmlData, 'text/xml');
                                // window.console.log('Created xmlDoc:', xmlDoc);
                            } else { // window.ActiveXObject
                                xmlDoc = new ActiveXObject('Msxml2.DOMDocument');
                                xmlDoc.async = 'false';
                                xmlDoc.loadXML(xmlData);
                            }
                        } catch (e) {
                            // window.console.log('Create xmlDoc failed');
                        }

                        // var xmlDoc = xmlData.responseXML;  // for XMLHttpRequest 

                        // var xmlDoc = document.implementation.createDocument('', '', null);  // for load .xml file
                        // xmlDoc.async = 'false';
                        // xmlDoc.load(xmlData);

                        userinfo.uid = xmlDoc.getElementsByTagName('uid')[0].firstChild.nodeValue;
                        userinfo.title = xmlDoc.getElementsByTagName('title')[0].firstChild.nodeValue;
                        userinfo.location = xmlDoc.getElementsByTagName('location')[0].firstChild.nodeValue;
                        userinfo.signature = xmlDoc.getElementsByTagName('signature')[0].firstChild.nodeValue;
                        userinfo.content = xmlDoc.getElementsByTagName('content')[0].firstChild.nodeValue;

                        var linkNodes = xmlDoc.getElementsByTagName('link');
                        angular.forEach(linkNodes, function(v) {
                            if (v.getAttribute('rel') === 'icon') {
                                userinfo.icon = v.getAttribute('href');
                            }
                            if (v.getAttribute('rel') === 'alternate') {
                                userinfo.site = v.getAttribute('href');
                            }
                        });
                        //  action after get the user data
                        $scope.userinfo = userinfo;
                        $scope.inform.userpop = true;
                        $scope.$emit('update-channels-from-login-controller', { // this msg will be broadcast by musicController;
                            'content': 'loged-in'
                        });

                    }, function() {
                        // window.console.log('userinfo request REJECTED:', reason);
                    });
            } else {
                $scope.inform.notiflag = true;
                $scope.inform.loginpop = true;
                $scope.inform.chlpop = false;
                $scope.inform.likepop = false;
                $scope.inform.favpop = false;
                $scope.inform.logoutpop = false;
            }
        };

        // user logout 
        $scope.userLogout = function() {
            // http://www.douban.com/accounts/logout?source=main&ck=CGaK
            // http://www.douban.com/accounts/logout?source=radio&ck=CGaK&no_login=y
            var ck = loginService.getck();
            if (ck) {
                // $scope.setting.logout = 'http://www.douban.com/accounts/logout?source=radio&ck=' + ck + 'no_login=y';
                $scope.setting.logout = 'http://www.douban.com/accounts/logout?source=main&ck=' + ck;
                loginService.removeCookie();
                $scope.status.signed = false;
                $scope.inform.notiflag = true;
                $scope.inform.logoutpop = true;
                $scope.inform.loginpop = false;
                $scope.inform.chlpop = false;
                $scope.inform.likepop = false;
                $scope.inform.favpop = false;
                $scope.status.loginFreshChls = false;  // for the next login channels update
            }
        };


        // play record 
        $scope.playrecord = function() {
            $scope.status.signed = loginService.getLogStatus();
            if ($scope.status.signed) {
                songsService.addReferer();
                $scope.getplayrecord('played');
                $scope.getplayrecord('liked');
                $scope.getplayrecord('banned');
            }
        };

        // handle play record
        $scope.getplayrecord = function(type) {
            var ck = loginService.getck();
            var bid = loginService.getbid();
            if (ck) {
                // http://douban.fm/j/play_record   & ck, spbid("::"+"bid") type[liked | banned | played]
                // http://douban.fm/j/play_record&ck=AtuV&spbid=%3A%3A HFkddzlnCBw&type=liked;  | banned | played]
                songsService.getPlayRecordRaw(ck, bid, type)
                    .then(function(data) {
                        if (data) {
                            switch (type) {
                                case 'played':
                                    $scope.record.played = data.total;
                                    break;
                                case 'liked':
                                    $scope.record.liked = data.total;
                                    break;
                                case 'banned':
                                    $scope.record.banned = data.total;
                                    break;
                            }
                        }
                        // window.console.log('type:', type, 'play record:', data);
                    }, function() {
                        // window.console.log('type:', type, 'REJECTED:', reason);
                    });
            }
        };

        // test area function
        $scope.transferdata = function() {
            var ck = loginService.getck();
            if (ck) {
                // http://douban.fm/j/transfer_data  & ck
                // {
                //     "r": 0,
                //     "transfer_info": {
                //         "liked": 0,
                //         "days": 0,
                //         "played": 0
                //     }
                // }
                songsService.getTransferData(ck)
                    .then(function() {
                        // window.console.log('Transfer_data:', data);
                    }, function() {
                        // window.console.log('Transfer_data REJECTED:', reason);
                    });
            }
        };
    }]);



// login service
angular.module('musicboxApp')
    .service('loginService', ['$http', '$q', 'appConstants', function($http, $q, appConstants) {
        var self = this;
        self.signed = false;
        self.userId = '';
        self.ue = '';
        self.ck = '';
        self.bid = '';
        self.userinfo = {
            'uid': '',
            'title': '',
            'location': '',
            'signature': '',
            'icon': '',
            'site': '',
            'content': ''
        };
        self.userinfoFlag = false;
        // doubanLoginUrl: 'https://www.douban.com/accounts/login', // http://www.douban.com/j/app/login',
        // doubanChannelUrl: 'http://www.douban.com/j/app/radio/channels',
        // doubanSongUrl: 'http://www.douban.com/j/app/radio/people',
        // doubanLyricUrl: 'http://api.douban.com/v2/fm/lyric',
        // API_HOST : 'https://api.douban.com',
        // AUTH_HOST : 'https://www.douban.com',
        // AUTHORIZE_URL : '/service/auth2/auth',
        // apikey: '0cef7c30ee4d518f26ce7492cae7f4ad',
        // secret: '2844390f63ef84af'
        // self.authorize = appConstants.AUTH_HOST + appConstants.AUTHORIZE_URL + '?client_id=' + appConstants.apikey + '&redirect_uri=' + appConstants.REDIRECT_URL + '&response_type=token';
        if (!chrome.cookies) {
            chrome.cookies = chrome.experimental.cookies;
        }

        this.getUE = function() {
            this.checkUE();
            return self.ue;
        };

        this.getck = function() {
            return self.ck;
        };

        this.getbid = function() {
            return self.bid;
        };

        this.getuid = function() {
            return self.userId;
        };

        this.getLogStatus = function() {
            this.checkCookie();
            return self.signed;
            // this,requestCookie();
            // var port = chrome.runtime.connect({name: "FMinNewVision"});
            // port.postMessage({title: 'cookie'});
            // port.onMessage.addListener(function(msg) {
            //     if (msg.response === 'cookie') {
            //         self.fmCookie = msg.value;
            //     }
            // });

            // return self.fmCookie.signed;
        };
        self.fmCookie = {
            'signed': false,
            'userId': '',
            'ck': '',
            'bid': ''
        };

        this.requestCookie = function() {
            var port = chrome.runtime.connect({
                name: 'FMinNewVision'
            });
            port.postMessage({
                title: 'cookie'
            });
            port.onMessage.addListener(function(msg) {
                if (msg.response === 'cookie') {
                    self.fmCookie = msg.value;
                }
            });
        };

        // this.checkFmCookie = function() {
        //     chrome.cookies.get({
        //         url: 'http://douban.fm',
        //         name: 'dbcl2'
        //     }, function(result) {
        //         if (result) {
        //             self.userId = (result.value.split(':')[0]).slice(1);
        //             if (self.userId) {
        //                 self.signed = true;
        //                 window.console.log('FM loged:', result.value);
        //             } else {
        //                 self.signed = false;
        //                 // this.checkCookie();
        //             }
        //         } else {
        //             self.signed = false;
        //             // this.checkCookie();
        //         }
        //     });

        //     chrome.cookies.get({
        //         url: 'http://douban.fm',
        //         name: 'ck'
        //     }, function(result) {
        //         if (result) {
        //             self.ck = result.value.split('"')[1];
        //         } else {
        //             // this.checkCookie();
        //             window.console.log('ck is NOT FOUND:', result);
        //         }
        //     });

        //     chrome.cookies.get({
        //         url: 'http://douban.fm',
        //         name: 'bid'
        //     }, function(result) {
        //         if (result) {
        //             self.bid = result.value.split('"')[1];
        //         } else {
        //             window.console.log('bid is NOT FOUND:', result);
        //         }
        //     });
        // };

        // this.removeFmCookie = function() {
        //     chrome.cookies.set({
        //         url: 'http://douban.fm',
        //         name: 'dbcl2',
        //         value: ''
        //     }, function(result) {
        //         window.console.log('Removed FM cookies:', result);
        //     });

        //     chrome.cookies.set({
        //         url: 'http://douban.fm',
        //         name: 'ck',
        //         value: ''
        //     }, function(result) {
        //         window.console.log('Removed FM cookies:', result);
        //     });
        // };

        this.removeCookie = function() {
            chrome.cookies.set({
                url: 'http://douban.com',
                name: 'dbcl2',
                value: ''
            }, function() {
                // window.console.log('Removed cookies:', result);
            });

            chrome.cookies.set({
                url: 'http://douban.com',
                name: 'ck',
                value: ''
            }, function() {
                // window.console.log('Removed cookies:', result);
            });
        };

        this.checkCookie = function() {
            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'dbcl2'
            }, function(result) {
                if (result) {
                    self.userId = (result.value.split(':')[0]).slice(1);
                    if (self.userId) {
                        chrome.cookies.set({
                            url: 'http://douban.fm',
                            name: 'dbcl2',
                            value: result.value
                        });
                        self.signed = true;
                        // window.console.log('DoubanFM already loged, please enjoy your music!');
                        // window.console.log('Douban loged:', result.value);
                    } else {
                        self.signed = false;
                    }
                } else {
                    self.signed = false;
                }
            });

            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'ck'
            }, function(result) {
                if (result) {
                    chrome.cookies.set({
                        url: 'http://douban.fm',
                        name: 'ck',
                        value: result.value
                    });
                    self.ck = result.value.split('"')[1];
                }
            });

            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'bid'
            }, function(result) {
                if (result) {
                    self.bid = result.value.split('"')[1];
                    if (!self.bid) {
                        // window.console.log('bid is NOT FOUND:', result);
                    }
                    chrome.cookies.set({
                        url: 'http://douban.fm',
                        name: 'bid',
                        value: result.value
                    });
                }
            });
        };

        this.checkUE = function() {
            chrome.cookies.get({
                url: 'http://douban.com',
                name: 'ue'
            }, function(result) {
                if (result) {
                    self.ue = result.value.split('"')[1];
                    // window.console.log('UE:', result.value);
                } else {
                    self.ue = '';
                }
            });
        };

        // get userinfo v1.0,
        // 
        // this.getUserinfo = function() {
        //     if (self.userId) {
        //         this.userinfoRequest(self.userId)
        //             .then(function(xmlData) {
        //                 var xmlDoc = null;
        //                 try {
        //                     if (window.DOMParser) {
        //                         xmlDoc = (new DOMParser()).parseFromString(xmlData, 'text/xml');
        //                         // window.console.log('Created xmlDoc:', xmlDoc);
        //                     } else { // window.ActiveXObject
        //                         xmlDoc = new ActiveXObject('Msxml2.DOMDocument');
        //                         xmlDoc.async = 'false';
        //                         xmlDoc.loadXML(xmlData);
        //                     }
        //                 } catch (e) {
        //                     // window.console.log('Create xmlDoc failed');
        //                 }

        //                 // var xmlDoc = xmlData.responseXML;  // for XMLHttpRequest 

        //                 // var xmlDoc = document.implementation.createDocument('', '', null);  // for load .xml file
        //                 // xmlDoc.async = 'false';
        //                 // xmlDoc.load(xmlData);

        //                 self.userinfo.uid = xmlDoc.getElementsByTagName('uid')[0].firstChild.nodeValue;
        //                 self.userinfo.title = xmlDoc.getElementsByTagName('title')[0].firstChild.nodeValue;
        //                 self.userinfo.location = xmlDoc.getElementsByTagName('location')[0].firstChild.nodeValue;
        //                 self.userinfo.signature = xmlDoc.getElementsByTagName('signature')[0].firstChild.nodeValue;
        //                 self.userinfo.content = xmlDoc.getElementsByTagName('content')[0].firstChild.nodeValue;

        //                 var linkNodes = xmlDoc.getElementsByTagName('link');
        //                 angular.forEach(linkNodes, function(v) {
        //                     if (v.getAttribute('rel') === 'icon') {
        //                         self.userinfo.icon = v.getAttribute('href');
        //                     }
        //                     if (v.getAttribute('rel') === 'alternate') {
        //                         self.userinfo.site = v.getAttribute('href');
        //                     }
        //                 });
        //             }, function() {
        //                 // window.console.log('userinfo request REJECTED:', reason);
        //                 return {};
        //             });
        //     }
        //     return self.userinfo;
        // };

        this.userinfoRequest = function(userId) {
            var deferred = $q.defer();

            var url = 'http://api.douban.com/people/' + userId;
            var infoPromise = $http.get(url, {
                cache: appConstants.useBrowserCache
            });
            infoPromise.success(function(xmlData) {
                deferred.resolve(xmlData);
            }).error(function(reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        };

    }]);

// login,  [bind on span li.login]
angular.module('musicboxApp')
    .directive('ngLogin', ['loginService', function(loginService) {
        return {
            restrict: 'A',
            link: function(scope, iElement) {
                iElement.bind('click', function() {
                    scope.status.signed = loginService.getLogStatus();
                    if (scope.status.signed) { // loged in
                        // scope.inform.userpop ? scope.inform.userpop = false : scope.viewInfo();
                        if (scope.inform.userpop) {
                            scope.inform.notiflag = false;
                            scope.inform.userpop = false;
                            scope.inform.chlpop = false;
                            scope.inform.likepop = false;
                            scope.inform.favpop = false;
                            scope.inform.logoutpop = false;
                        } else {
                            if (!scope.status.loginFreshChls) {
                                scope.viewInfo();
                            } else {
                                scope.inform.userpop = true;  // no more repeat request for the userinfo. leave me alone.
                            }
                        }
                    } else {
                        if (scope.inform.loginpop) {
                            scope.inform.notiflag = false;
                            scope.inform.loginpop = false;
                        } else {
                            scope.inform.notiflag = true;
                            scope.inform.loginpop = true;
                            scope.inform.chlpop = false;
                            scope.inform.likepop = false;
                            scope.inform.favpop = false;
                            scope.inform.logoutpop = false;
                        }
                    }
                });
            }
        };
    }]);

// Share to douban
angular.module('musicboxApp')
    .directive('ngShareDouban', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement) {
                iElement.bind('click', function() {
                    var d = document,
                        e = encodeURIComponent,
                        s1 = window.getSelection,
                        s2 = d.getSelection,
                        s3 = d.selection,
                        s = s1 ? s1() : s2 ? s2() : s3 ? s3.createRange().text : '',
                        l = (window.screen.width - 30 - 770) / 2,
                        t = (window.screen.height - 10 - 466) / 2,
                        r = 'http://www.douban.com/recommend/?url=' + e(d.location.href) + '&title=' + e(d.title) + '&sel=' + e(s) + '&v=1',
                        x = function() {
                            if (!window.open(r, 'douban', 'toolbar=0,resizable=1,scrollbars=yes,status=1,width=770,height=466,left=' + l + ',top=' + t)) location.href = r + '&r=1';
                        };
                    x();
                });
            }
        };

    }]);

// Share to weibo
angular.module('musicboxApp')
    .directive('ngShareWeibo', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement) {
                iElement.bind('click', function() {
                    var d = document,
                        e = encodeURIComponent;
                    var l = (window.screen.width - 30 - 635) / 2;
                    var t = (window.screen.height - 10 - 360) / 2;
                    var weibo = function() {
                        window.open('http://v.t.sina.com.cn/share/share.php?title=' + e(d.title) + '&url=' + e(d.location.href) + '&source=bookmark', '_blank', 'width=635,height=360,left=' + l + ',top=' + t);
                    };
                    weibo();
                });
            }
        };

    }]);
// Share to facebook
angular.module('musicboxApp')
    .directive('ngShareFacebook', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement) {
                iElement.bind('click', function() {
                    var url = 'http://www.facebook.com/sharer/sharer.php?';
                    url += 'u=' + encodeURIComponent(document.location.href); 
                    url += '&t=' + encodeURIComponent(document.title);
                    var l = (window.screen.width - 30 - 755) / 2;
                    var t = (window.screen.height - 10 - 466) / 2;
                    window.open(url, '_blank', 'width=755,height=466,left=' + l + ',top=' + t + ',toolbar=no,menubar=no,scrollbars=no,resizable=1,location=no,status=0');
                });
            }
        };

    }]);
// Share to twitter
angular.module('musicboxApp')
    .directive('ngShareTwitter', [function() {
        return {
            restrict: 'A',
            link: function(scope, iElement) {
                iElement.bind('click', function() {
                    var url = 'http://twitter.com/intent/tweet?';
                    url += 'url=' + encodeURIComponent(document.location.href);
                    url += '&text=' + encodeURIComponent(document.title);
                    var l = (window.screen.width - 30 - 755) / 2;
                    var t = (window.screen.height - 10 - 204) / 2;
                    window.open(url, '_blank', 'width=755,height=204,left=' + l + ',top=' + t + ',toolbar=no,menubar=no,scrollbars=no,resizable=1,location=no,status=0');
                });
            }
        };

    }]);
