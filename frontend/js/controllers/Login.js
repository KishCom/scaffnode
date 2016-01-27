angular.module('scaffnode.controllers').
controller('LoginController', ['$scope', '$timeout', 'Restangular', '$location', '$rootScope', function($scope, $timeout, Restangular, $location, $rootScope) {
    // Get the logged in user if provided by the backend:
    $scope.User = window.User;
    window.scrollTo(0,0);
    if (window.User !== false){
        $location.path('/home');
    }
    // Restangular https://github.com/mgonto/restangular
    var usersModelEndpoint = Restangular.all('users');
    $scope.userModel = {
        email: "",
        password: ""
    };
    $scope.serverValidation = {
        email: "",
        password: ""
    };

    $scope.login = function($event){
        $event.preventDefault();
        //reset any server errors, very rare there should be any server errors unless someone is trying to do something malicious.
        $scope.serverValidation = {
            email: "",
            password: ""
        };

        usersModelEndpoint
        .all("login")
        .post($scope.userModel)
        .then(function(data) {
            window.User = data.User;
            $scope.User = data.User;
            window.scrollTo(0,0);
            //$location.path("/home");
            window.location.reload();
        }, function(data) {
            if (data.data.error){
                var errors = data.data.errors;

                // console.error('errors::', errors);
                // console.error('message::', data.data.message);

                $scope.serverValidation.critical = data.data.message; // TO DO

                if(_.has(errors, "email")){
                    $scope.serverValidation.email = errors.email.message;
                }
                if(_.has(errors, "password")){
                    $scope.serverValidation.password = errors.password.message;
                }
                if(_.has(errors, "critical")){
                    $scope.serverValidation.critical = "There was an error logging in. Try again later.";
                }
            }
            //console.log('serverValidation::', $scope.serverValidation);
        });
    };
}]);
