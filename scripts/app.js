/**
 * @ngdoc overview
 * @name musicboxApp
 * @description
 * # musicboxApp
 * Main module of the application.
 */
'use strict';
angular.module('musicboxApp', [
        'ngAnimate',
        'ngCookies',
        'ngRoute',
        'ngResource'
    ])
    .constant('appConstants',{
        doubanLoginUrl: 'http://www.douban.com/j/app/login',
        doubanChannelUrl: 'http://www.douban.com/j/app/radio/channels',
        doubanSongUrl: 'http://www.douban.com/j/app/radio/people',
        cacheExpiryPeriodMs: 10000,
        useBrowserCache: false,
        API_HOST : 'https://api.douban.com',
        AUTH_HOST : 'https://www.douban.com',
        REDIRECT_URL : 'https://douban.fm',
        apikey: '0cef7c30ee4d518f26ce7492cae7f4ad',
        secret: '2844390f63ef84af'
    })
    .config(function ($httpProvider) {
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
        //$httpProvider.defaults.headers.common['withCredentials'] = true;
        //$httpProvider.defaults.useXDomain = true;

        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    })
    .config(['$routeProvider', '$logProvider', function ($routeProvider, $logProvider) {

        $logProvider.debugEnabled(true);

        $routeProvider
            .when('/', {
                templateUrl: 'views/music.html',
                controller: 'MusicController',
                controllerAs: 'music'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);/*
    .config(['OAuthProvider', 'appConstants', function(OAuthProvider, appConstants){
        OAuthProvider.configure({
            baseUrl: appConstants.API_HOST,
            clientId: appConstants.apikey,
            clientSecret: appConstants.secret,
            grantPath: appConstants.AUTH_HOST + '/service/auth2/token'
        });
    }]);*//*
    .run(['$rootScope', '$window', 'OAuth', function($rootScope, $window, OAuth) {
        $rootScope.$on('oauth:error', function(event, rejection) {
            // Ignore `invalid_grant` error - should be catched on `LoginController`.
            if ('invalid_grant' === rejection.data.error) {
                return;
            }

            // Refresh token when a `invalid_token` error occurs.
            if ('invalid_token' === rejection.data.error) {
                return OAuth..getRefreshToken();
            }

            //Redirect
            return $window.location.href = '/';
        });
        
        $http.jsonp('http://www.douban.com/j/app/radio/channels?app_name=radio_desktop_win&version=100&callback=JSON_CALLBACK',
             {responseType:'json'})
        .success(function(data){
            console.log('Channels get success!');
            $rootScope.Channels = data.channels;
            console.log(data);
            console.log($rootScope.channels);
        }).error(function(e){
            console.log('Getting Channels error.'+e);
            });
    }]);*/


