angular.module('scaffnode.controllers').
controller('HomeController', ['$scope', '$timeout', function($scope, $timeout) {
    $scope.exampleModel = {
        name: "",
        email: ""
    };

    // Example function used to illustrate testing Angular controllers
    $scope.exampleFunction = function(sumA, sumB){
        return sumA + sumB;
    };
}]);
