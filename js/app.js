'use strict';

angular.module('app', ['ngRoute', 'controllers', 'services'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/dashboard', {
            templateUrl: 'view/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .when('/vms',{
            templateUrl: 'view/vm-list.html',
            controller: 'VMListCtrl'
        })
        .when('/image', {
            templateUrl: 'view/image-list.html',
            controller: 'ImageListCtrl'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
}]);
