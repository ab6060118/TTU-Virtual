'use strict';

angular.module('controllers', [])
.controller('DashboardCtrl', ['$scope', function($scope) {
}])
.controller('VMListCtrl', ['$scope', function($scope, $route, VM) {
    $scope.state = {
        creating: false,
    };

    $scope.templates = [{"name" : "vm-create-form", "url" : "view/vm-create-form.html"}];

    $scope.template = $scope.templates[0];

    $scope.$on('$routeChangeSuccess', function() {
        $('.ui.dropdown').dropdown();
    });

    $scope.$on('cancelCreating', function() {
        $scope.state.creating = false;
    });
}])
.controller('VMCreateFormCtrl', ['$scope', function($scope) {
    $scope.cancel = function(){
        $scope.$emit('cancelCreating');
        $scope.reset();
    }
    
    $scope.reset = function() {
        $scope.data = {};
        $scope.data.name = undefined;
        $scope.data.core = undefined;
        $scope.data.memory = undefined;
        $scope.data.template = undefined;
    }

    $scope.init = function() {
        $scope.reset();
    }

    $scope.init();
}])
.controller('ImageListCtrl', ['$scope', function($scope) {
}]);
