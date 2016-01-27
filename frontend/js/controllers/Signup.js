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
        postalcode: "",
        password: "",
        agreedToTerms: "",
        recaptcha_response_field: ""
    };

    $scope.serverValidation = {
        name: "",
        email: "",
        postalcode: "",
        password: "",
        optedIn: "",
        recaptcha: "",
        critical: ""
    };

    $scope.signup = function($event){
        $event.preventDefault();
        //console.log('signup');

        //reset any server errors, very rare there should be any server errors unless someone is trying to do something malicious.
        $scope.serverValidation = {
            name: "",
            email: "",
            postalcode: "",
            password: "",
            optedIn: "",
            recaptcha_response_field: "",
            critical: ""
        };

        usersModelEndpoint
        .all("signup")
        .post($scope.userModel)
        .then(function(data) {
            window.User = data.content;
            $location.path('/home');
            // $scope.bindPixelHTML = $sce.trustAsHtml('<script type="text/javascript">/* <![CDATA[ */var google_conversion_id = 964659112;var google_conversion_language = "en";var google_conversion_format = "3";var google_conversion_color = "ffffff";var google_conversion_label = "EMEsCOC6vloQqI_-ywM";var google_remarketing_only = false;/* ]]> */</script><script type="text/javascript" src="//www.googleadservices.com/pagead/conversion.js"></script><noscript><div style="display:inline;"><img height="1" width="1" style="border-style:none;" alt="" src="//www.googleadservices.com/pagead/conversion/964659112/?label=EMEsCOC6vloQqI_-ywM&amp;guid=ON&amp;script=0"/></div></noscript>');
        }, function(data) {

            if (data.data.error){
                var errors = data.data.errors;
                console.log(errors);
                if(_.has(errors, "name")){
                    $scope.serverValidation.name = errors.name.message;
                }
                if(_.has(errors, "email")){
                    $scope.serverValidation.email = errors.email.message;
                }
                if(_.has(errors, "postalcode")){
                    $scope.serverValidation.postalcode = errors.postalcode.message;
                }
                if(_.has(errors, "password")){
                    $scope.serverValidation.password = errors.password.message;
                }
                if(_.has(errors, "optedIn")){
                    $scope.serverValidation.optedIn = errors.optedIn.message;
                }
                if(_.has(errors, "recaptcha")){
                    $scope.serverValidation.recaptcha = errors.recaptcha.message;
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
