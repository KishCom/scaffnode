/**
  * Angular.js based frontend
**/
var scaffnode = angular.module('scaffnode',
                             ['ngRoute',
                              'ngAnimate',
                              'ngCookies',
                              'angularMoment',
                              'restangular',
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

scaffnode.config(['RestangularProvider', function (RestangularProvider) {
    // Use the MongoDB `_id` instead of the default 'id'
    RestangularProvider.setRestangularFields({
        id: "_id"
    });
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
