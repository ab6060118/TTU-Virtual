'use strict';

angular.module('controllers', [])
.controller('DashboardCtrl', ['$scope', function($scope) {
}])
.controller('VMListCtrl', ['$scope', function($scope, $route, VM) {
    $scope.$on('$routeChangeSuccess', function() {
        $('.ui.dropdown').dropdown();
    });
}])
.controller('ImageListCtrl', ['$scope', function($scope) {
}]);
