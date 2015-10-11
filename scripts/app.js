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
        'ngResource',
        'ngRoute'
    ])
    .constant('appConstants',{
        doubanLoginUrl: 'http://www.douban.com/j/app/login',
        doubanChannelUrl: 'http://www.douban.com/j/app/radio/channels',
        doubanSongUrl: 'http://www.douban.com/j/app/radio/people',
        doubanLyricUrl: 'http://api.douban.com/v2/fm/lyric',
        cacheExpiryPeriodMs: 10000,
        useBrowserCache: false,
        API_HOST : 'https://api.douban.com',
        AUTH_HOST : 'https://www.douban.com',
        REDIRECT_URL : 'https://vinkerz.github.io',
        AUTHORIZE_URL : '/service/auth2/auth',
        apikey: '0cef7c30ee4d518f26ce7492cae7f4ad',
        secret: '2844390f63ef84af'
    })
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
        //$httpProvider.interceptors.push('myinterceptor');
    }])
    .config(['$compileProvider', function($compileProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data|blob):/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data|blob):/);
    }])
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
    }])
    .filter('trustUrl', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    });