/**
* Test your Angular.js controller functions here. Each function inside of each controller should have a test associated with it.
* Note: This does not test templates (or even have them available to the test mock). That is what the Selenium tests are for.
**/
var expect = chai.expect;
describe('scaffnode', function() {
    describe('scaffnode controllers', function() {
        beforeEach(module('scaffnode.controllers'));
        describe('HomeController', function() {
            it('should make sure the example model is empty',
                inject(function($rootScope, $controller) {
                    var scope = $rootScope.$new();
                    var ctrl = $controller("HomeController", {$scope: scope}); // Initalize the controller
                    expect(scope.exampleModel).to.have.property("name");
                    expect(scope.exampleModel.name).to.equal("");
                    expect(scope.exampleModel).to.have.property("email");
                    expect(scope.exampleModel.email).to.equal("");
                })
            );
            it('should have an exampleFunction() that sums 2 numbers',
                inject(function($rootScope, $controller) {
                    var scope = $rootScope.$new();
                    var ctrl = $controller("HomeController", {$scope: scope});  // Initalize the controller
                    expect(typeof scope.exampleFunction).to.equal("function");
                    expect(scope.exampleFunction(5, 5)).to.equal(10);
                    expect(scope.exampleFunction(0, 1)).to.equal(1);
                })
            );
        });
    });
});
