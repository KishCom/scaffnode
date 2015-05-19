angular.module('scaffnode.controllers').
controller('HomeController', ['$scope', '$timeout', 'Restangular', function($scope, $timeout, Restangular) {
    // Restangular https://github.com/mgonto/restangular
    var scaffnodeModelEndpoint = Restangular.all('model');
    $scope.scaffnode_model = {
        name: "",
        content: ""
    };

    // this variable just toggles the new/edit forms
    $scope.editingMode = false;

    // Get all the data to show here -- the server leaves this for us on the window object (see frontend/templates/angular.html)
    $scope.all_scaffnode_model = window.all_scaffnode_model;
    // However maybe we wanted to get updated ones right away:
    // Don't forget to checkout RestangularProvider.addResponseInterceptor in frontend/app.js
    $scope.all_scaffnode_model = scaffnodeModelEndpoint.getList().$object;

    $scope.addnew = function(){
        // You'd do some client-side validation here...
        scaffnodeModelEndpoint
        .post($scope.scaffnode_model)
        .then(function(data) {
            console.log("Object saved OK", data);
            $("#status").html("Saved!");
            // we'll re-pull the list from the server but in the meantime let's pop the content onto the local object
            $scope.all_scaffnode_model.push(data.content);
            // when this resolves the model will automatically update
            $scope.all_scaffnode_model = scaffnodeModelEndpoint.getList().$object;
            // Clear the status message after 5 seconds
            $timeout(function(){
                $("#status").html("");
            }, 5000);
            // Reset the scaffnode_model model object to be empty
            $scope.scaffnode_model = {
                name: "",
                content: ""
            };
        }, function(data) {
            $("#status").html("There was an error saving. Try again later.");
        });
    };

    // This actually just flips the form into "edit mode", the actual submission of data happens in doEdit() below.
    $scope.edit = function(mongoID){
        $scope.editingMode = true;
        var found = false;
        for (var i = 0, len = $scope.all_scaffnode_model.length; i < len; i++){
            if ($scope.all_scaffnode_model[i]._id === mongoID){
                found = true;
                $scope.scaffnode_model.name = $scope.all_scaffnode_model[i].name;
                $scope.scaffnode_model.content = $scope.all_scaffnode_model[i].content;
                $scope.scaffnode_model.scaffnodeId = $scope.all_scaffnode_model[i]._id;
                break;
            }
        }
        if (found){
            $timeout(function() { $("#editname").focus(); }, 250);
        }
    };

    $scope.doEdit = function(mongoID){
        // Again; you'd do some client-side validation here...
        scaffnodeModelEndpoint
        .one("update")
        .post(null, $scope.scaffnode_model)
        .then(function(data) {
            console.log("Object updated OK", data);
            $("#status").html("Updated!");
            // Fancy lodash footwork updates the all_scaffnode_model object to remove the just-updated content
            $scope.all_scaffnode_model = _.without($scope.all_scaffnode_model, _.findWhere($scope.all_scaffnode_model, {_id: data.content._id}));
            // Readd the updated content to the all_scaffnode_model object
            $scope.all_scaffnode_model.push(data.content);
            $scope.all_scaffnode_model = scaffnodeModelEndpoint.getList().$object;
            $scope.editingMode = false;
            // Clear the status message after 5 seconds
            $timeout(function(){
                $("#status").html("");
            }, 5000);
            // Reset the scaffnode_model model object to be empty
            $scope.scaffnode_model = {
                name: "",
                content: ""
            };
        }, function(data) {
            $("#status").html("There was an error saving. Try again later.");
        });
    };

    $scope.remove = function(mongoID){
        scaffnodeModelEndpoint
        .one("remove")
        .post(null, {"scaffnodeId": mongoID})
        .then(function(data){
            if (data.error === false){
                // Fancy underscore footwork updates the all_scaffnode_model object to remove the just-deleted content
                $scope.all_scaffnode_model = _.without($scope.all_scaffnode_model, _.findWhere($scope.all_scaffnode_model, {_id: data._id}));
            }
        },function(data){
            $("#status").html("There was an error removing. Try again later.");
        });
    };

    // Example function sums two numbers -- for testing example purposes (see frontend/tests/angular_tests.js)
    $scope.exampleFunction = function(a, b){
        a = parseInt(a);
        if (isNaN(a)){
            a = 0;
        }
        b = parseInt(b);
        if (isNaN(b)){
            b = 0;
        }
        return parseInt(a) + parseInt(b);
    };
}]);
