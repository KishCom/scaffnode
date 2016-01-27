angular.module('scaffnode.controllers').
controller('SignupController', ['$scope', '$timeout', 'Restangular', '$location', '$rootScope', function($scope, $timeout, Restangular, $location, $rootScope) {
    // Get the logged in user if provided by the backend:
    $scope.User = window.User;
    window.scrollTo(0,0);
    if (window.User !== false){
        $location.path('/home');
    }

    // Restangular https://github.com/mgonto/restangular
    var usersModelEndpoint = Restangular.all('users');
    $scope.userModel = {
        name: "",
        email: "",
        password: ""
    };

    $scope.serverValidation = {
        name: "",
        email: "",
        password: "",
        critical: ""
    };

    $scope.signup = function($event){
        $event.preventDefault();
        //console.log('signup');

        //reset any server errors, very rare there should be any server errors unless someone is trying to do something malicious.
        $scope.serverValidation = {
            name: "",
            email: "",
            password: "",
            critical: ""
        };

        usersModelEndpoint
        .all("signup")
        .post($scope.userModel)
        .then(function(data) {
            window.User = data.content;
            window.location.reload();
        }, function(data) {
            if (data.data.error){
                if (data.data.message){
                    $scope.serverValidation.critical = data.data.message;
                    return;
                }
                var errors = data.data.errors;
                console.log(errors);
                if(_.has(errors, "name")){
                    $scope.serverValidation.name = errors.name.message;
                }
                if(_.has(errors, "email")){
                    $scope.serverValidation.email = errors.email.message;
                }
                if(_.has(errors, "password")){
                    $scope.serverValidation.password = errors.password.message;
                }
                if(_.has(errors, "critical")){
                    $scope.serverValidation.critical = "There was an error saving. Try again later.";
                }
            }
            console.log($scope.serverValidation);
        });
    };
    $scope.setWidgetId = function(widgetId) {
        $scope.widgetId = widgetId;
    };
    $scope.setResponse = function(response){
        $scope.userModel.recaptcha_response_field = response;
    };
}]);
