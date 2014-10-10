angular.module('scaffnode.controllers').
controller('HomeController', ['$scope', '$timeout', function($scope, $timeout) {
    $scope.exampleModel = {
        name: "",
        email: ""
    };
}]);