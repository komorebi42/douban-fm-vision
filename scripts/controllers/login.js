/**
 * @ngdoc function
 * @name musicboxApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the musicboxApp
 */
'use strict';
angular.module('musicboxApp')
    .controller('LoginController', ['$scope', '$http', '$cookieStore', '$q', function($scope, $http, $cookieStore, $q) {
        $scope.user = {
            'email': '',
            'password': '',
            'remember': '',  //on, off
        }; //email,password,remember
        $scope.loginfo = {'user_id':'','token':'','expire':''};  //取得的信息,user_id, token, expire, user_name, email
        $scope.loginerr = '';

        $scope.logintest1 = function(){
            var deferred = $q.defer();
            var aPromise;
            aPromise = $http.get('https://www.douban.com/service/auth2/auth?client_id=0cef7c30ee4d518f26ce7492cae7f4ad&redirect_uri=http://douban.fm&response_type=token');
            aPromise.success(function(data) {
                console.log(data);
                deferred.resolve(data);
            }).error(function(result){
                console.log(result);
                deferred.reject(result);
            });
            return deferred.promise;
        };

        $scope.Login = function(){
            $http({
                method: 'post',
                url: 'http://www.douban.com/j/app/login',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: $http.param({
                    'app_name': 'radio_desktop_win',
                    'version': 100,
                    'email': $scope.user.email,
                    'password': $scope.user.password,
                    'remember': $scope.user.remember
                })
            }).success(function(data){
                if (data.r === 1) {
                    $scope.loginerr = data.err;
                    console.log(data.err);
                } else if(data.r ===0){
                    $scope.loginfo.user_id = data.user_id;
                    $scope.loginfo.token = data.token;
                    $scope.loginfo.expire = data.expire;
                    $scope.loginfo.user_name = data.user_name;
                    $scope.loginfo.email = data.email;

                    $cookieStore.put('LoginMsg', {
                        'user_id': data.user_id,
                        'token': data.token,
                        'expire': data.expire,
                        'user_name': data.user_name,
                        'email': data.email,
                        'domain': '.douban.com',
                        'path': '/'
                    });
                    //可以保存登录信息，实现下次免登录
                }
            });
        };
        /*
         $http.post(' http://www.douban.com/j/app/login', {
         'app_name': 'radio_desktop_win',
         'version': 100,
         'email': $scope.email,
         'password': $scope.password
         }.success(function(data, textStatus, xhr) {
         //optional stuff to do after success
         user = data;
         })); */
            var loginfoTest = {
                'user_id': '<user_id>',
                'err': 'ok',
                'token': '<token_string>',
                'expire': '<expire_time_in_millisecond>',
                'r': 0,
                'user_name': '音乐人',
                'email': '<user_account>'
            };

    }]);


