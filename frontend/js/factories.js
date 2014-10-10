angular.module('scaffnode.factories', [])
.factory('someFactory', ['$http', '$rootScope', function($http, $rootScope){
    var factory = {};
    factory.somefunction = function(){
        return true;
    };
    return factory;
}]);