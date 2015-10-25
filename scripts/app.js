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
        cacheExpiryPeriodMs: 10000,
        useBrowserCache: true,
    })
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
        //$httpProvider.interceptors.push('myinterceptor');
    }])
    .config(['$compileProvider', function($compileProvider) {
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data|blob|chrome-extension):/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data|blob):/);
    }])
    .filter('trustUrl', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    });

// run 
// angular.module('musicboxApp')
//     .run([function () {
//         chrome.browserAction.onClicked.addListener(function(tab) {
//             var manager_url = chrome.extension.getURL('../index.html');
//             focusOrCreateTab(manager_url);
//         });

//         function focusOrCreateTab(url) {
//             chrome.windows.getAll({
//                 'populate': true
//             }, function(windows) {
//                 var existing_tab = null;
//                 for (var i in windows) {
//                     var tabs = windows[i].tabs;
//                     for (var j in tabs) {
//                         var tab = tabs[j];
//                         if (tab.url == url) {
//                             existing_tab = tab;
//                             break;
//                         }
//                     }
//                 }
//                 if (existing_tab) {
//                     chrome.tabs.update(existing_tab.id, {
//                         'selected': true
//                     });
//                 } else {
//                     chrome.tabs.create({
//                         'url': url,
//                         'selected': true
//                     });
//                 }
//             });
//         }
//     }]);
    // .config(['$routeProvider', '$logProvider', function ($routeProvider, $logProvider) {

    //     $logProvider.debugEnabled(true);

    //     $routeProvider
    //         .when('/', {
    //             templateUrl: 'views/music.html',  //ng-href="#/"
    //             controller: 'MusicController',
    //             controllerAs: 'music'
    //         })
    //         .when('/option', {
    //             templateUrl: 'views/option.html',  //ng-href="#/option"
    //             controller: 'OptionController'
    //         })
    //         .otherwise({
    //             redirectTo: '/'
    //         });
    // }])