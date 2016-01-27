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

    // Add a response intereceptor. scaffnode API responses are wrapped beside some meta-data
    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        // Our generic model just puts data from the db in a "content" array property, but for the semantics of your API you'll want to change that to something more relevant.
        /*var extractedData;
        // Intercept getList operations
        if (operation === "getList") {
            // and handle the data and meta data
            extractedData = data.data.data;
            extractedData.meta = data.data.meta;
        }
        if (url starts with /api/users)
            return data.users

        if (url starts with /api/tags)
            return data.tags
        */
        return data.content ? data.content : data;
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
                  .when('/signup', {templateUrl: 'signup.html', controller: "SignupController"})
                  .when('/login', {templateUrl: 'login.html', controller: "LoginController"})
                  .otherwise( {redirectTo: '/signup'} );
}]);


/**
  * Initalize anything not integrated into Angular
**/
$(document).ready(function(){

});
