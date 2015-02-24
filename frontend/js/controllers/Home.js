angular.module('scaffnode.controllers').
controller('HomeController', ['$scope', '$timeout', 'Restangular', function($scope, $timeout, Restangular) {
    var scaffnodeModelEndpoint = Restangular.all('model');
    $scope.scaffnode_model = {
        name: "",
        content: ""
    };

    // Get all the data to show here -- the server leaves this for us (see frontend/templates/angular.html)
    // However if we wanted to get updated ones:
    // $scope.all_scaffnode_model = scaffnodeModelEndpoint.getList().$object;
    // Which would query the server with a GET request to /model
    $scope.all_scaffnode_model = window.all_scaffnode_model;

    $scope.addnew = function(){
        // You'd do some client-side validation here...
        scaffnodeModelEndpoint
        .post($scope.scaffnode_model)
        .then(function(data) {
            console.log("Object saved OK", data);
            $("#status").html("Saved!");
            $scope.all_scaffnode_model.push(data.content);
            $timeout(function(){
                $("#status").html("");
                $scope.scaffnode_model = {
                    name: "",
                    content: ""
                };
            }, 5000);
        }, function() {
            $("#status").html("There was an error saving. Try again later.");
        });
    };

    $scope.edit = function(mongoID){
        console.log("Gunna edit",mongoID);
    };
}]);