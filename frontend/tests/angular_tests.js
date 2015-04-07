describe('scaffnode', function() {
    describe('scaffnode controllers', function() {
        beforeEach(module('controllers'));
        describe('HomeController', function() {
            it('should make sure the example model is empty',
                inject(function($rootScope, $controller) {
                var scope = $rootScope.$new();
                var ctrl = $controller("HomeController", {$scope: scope });
                expect(scope.exampleModel.name).toBe("");
            }));
        });
    });
});