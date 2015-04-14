/**
  * Angular.js based frontend for scaffnode
**/
var scaffnode = angular.module('scaffnode',
                             ['ngRoute',
                              'ngAnimate',
                              'ngCookies',
                              'angularMoment',
                              'scaffnode.controllers',
                              'scaffnode.directives',
                              'scaffnode.factories'
                             ]);

// We use Swig templates on the backend, {{ variable }} notation is incompatible use [[ variable ]] instead!
scaffnode.config(['$interpolateProvider', function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);

scaffnode.config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(false);
}]);

scaffnode.run(['$rootScope', function($rootScope, tagFactory) {
    $rootScope.example = "Try to keep it clean in here...";
}]);


/**
  * Frontend Routes!
**/
scaffnode.config(['$routeProvider', function ($routeProvider) {
$routeProvider.when('/home',  {templateUrl: 'home.html', controller: "HomeController"})
                  //.when('/signup', {templateUrl: 'signup.html', controller: "LoginAndSignUp"})
                  .otherwise( {redirectTo: '/home'} );
}]);


/**
  * Initalize anything not integrated into Angular
**/
$(document).ready(function(){

});
