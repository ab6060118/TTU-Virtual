'use strict';

angular.module('controllers', [])
.controller('DashboardCtrl', ['$scope', function($scope) {
}])
.controller('VMListCtrl', ['$scope', function($scope, $route, VM) {
    $scope.templates = [{"name" : "vm-create-form", "url" : "view/vm-create-form.html"}];

    $scope.template = $scope.templates[0];
    console.log($scope.template);

    $scope.$on('$routeChangeSuccess', function() {
        $('.ui.dropdown').dropdown();
    });

}])
.controller('ImageListCtrl', ['$scope', function($scope) {
}]);
