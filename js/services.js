'use strict';

angular.module('services', [])

.constant('API_Endpoint', '/virtualbox/endpoints/api.php')

.factory('VM', ['$http', '$q', 'API_Endpoint', function($http, $q, API) {
    var self = this;
    
    this.data = {
        VMs: {},
    };
    
    this.state = {
        List: {
            loading: false,
            loaded: false,
        },
        Detail: {
            loading: false,
            loaded: false,
        }
    };
    
    this.getList = function(fn, params, persist) {
        self.state.List.loading = true;
        var arr = [];
        return $http({
            method: 'POST',
            url: API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: fn,
                params: params,
                persist: persist
            }),
        })
        .then(function(response) {
            angular.forEach(response.data.data.responseData, function(value, key) {
                var job = $q.defer();
                var promise = job.promise;
                self.getDetail("machineGetDetails", {"vm" : value.id}, null, value.state, job);
                arr.push(promise)
            });
        })
        .finally(function() {
            $q.all(arr).then(function() {
                self.state.List.loaded = true;
                self.state.List.loading = false;
            });
            
        });
    };
    
    this.getDetail = function(fn, params, persist, state, job) {
        return $http({
            method: 'POST',
            url: API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn : fn,
                params : params,
                persist: persist
            }),
        })
        .then(function(response) {
            response.data.data.responseData.state = state;
            self.data.VMs[response.data.data.responseData.id] = response.data.data.responseData;
            job.resolve('done');
        });
    };
    
    this.powerUp = function(fn, params, persist) {
        return $http({
            method: 'POST',
            url: API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn : fn,
                params : params,
                persist : persist
            }),
        });
    };
    
    this.powerDown = function(fn, params, persist) {
        return $http({
            method: 'POST',
            url: API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn : fn,
                params : params,
                persist : persist
            }),
        });
    };
    
    this.progressGet = function(fn, params, persist) {
        return $http({
            method: 'POST',
            url: API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: fn,
                params: params,
                persist: persist
            })
        });
    };
    
    this.getObjLength = function(obj) {
        return Object.keys(obj).length;
    }
    
    this.stateReset = function() {
        self.state.List.loading = false;
        self.state.List.loaded = false;
        
        self.data.VMs = {};
    };
    
    return this;
}])

.factory('Auth', ['$rootScope', '$http', '$location', 'API_Endpoint', function($rootScope, $http, $location,API) {
    self = this;

    $rootScope.isLogined = false;

    this.state = {
        login: {
            loging: false,
            logined: false,
        }
    };

    this.login = function(fn, params, persist, scope) {
        this.state.login.loging = true;
        return $http({
            method: 'POST',
            url: API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: fn,
                params: params,
                persist: persist
            })
        })
        .then(function(response) {
            if(response.data.data.responseData.hasOwnProperty('valid') && response.data.data.responseData.valid) {
                $rootScope.isLogined = true;
                $location.path('/dashboard');
            }
            else {
                scope.errorMsg = 'Invalid username or password.';
            }
        })
        .finally(function() {
            this.state.login.loging = false;
        });
    };

    this.getSession = function(defer) {
        return $http({
            method: 'POST',
            url: API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: 'getSession',
                params: null,
                persist: null
            })
        })
        .then(function(response) {
            if(response.data.data.responseData.hasOwnProperty('valid') && response.data.data.responseData.valid) {
                $rootScope.isLogined = true;
            }
            else {
                $rootScope.isLogined = false;
            }
            defer.resolve(true);
        });
    }

    this.logout = function() {
        return $http({
            method: 'POST',
            url: API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: 'logout',
                params: null,
                persist: null
            })
        })
        .then(function(response) {
            $rootScope.isLogined = false;
            $location.path('/login');
        });
    }

    this.isLogined = function() {
        return $rootScope.isLogined;
    };

    return this;
}]);
