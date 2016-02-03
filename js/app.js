'use strict';

angular.module('app', ['controllers'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/dashboard', {
            tmmplate: 'view/dashboard.html',
            controller: 'DashboardCtrl'
        })
        .when('/VMs',{
            template: 'view/vm-list.html',
            controller: 'VMListCtrl'
        })
        .when('/images', {
            template: 'view/image-list.html',
            controller: 'ImageListCtrl'
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
}]);
