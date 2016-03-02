'use strict';

angular.module('app', ['ngRoute', 'controllers', 'services', 'directives'])

.constant('PUBLIC_PAGES', ['/login'])

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
        .when('/login', {
            templateUrl: 'view/login.html',
            controller: 'LoginCtrl',
        })
        .when('/logout', {
            templateUrl: 'view/login.html',
            controller: 'LogoutCtrl',
        })
        .otherwise({
            redirectTo: '/dashboard'
        });
}])

.run(function($rootScope, $location, $q, Auth, PUBLIC_PAGES) {
    $rootScope.$on('$routeChangeStart', function() {
        var defer = $q.defer();
        var promise = defer.promise;
        Auth.getSession(defer);
        promise.then(function() {
            if(PUBLIC_PAGES.indexOf($location.path()) == -1 && !Auth.isLogined() ) {
                $location.path('/login');
            }
        });
    });
});
