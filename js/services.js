'use strict';

angular.module('services', [])
.constant('API_Endpoint', '/virtualbox/endpoints/api.php')
.factory('VM', ['$http', 'API_Endpoint', function($http, API) {
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
                self.getDetail("machineGetDetails", {"vm" : value.id}, null, value.state);
            });
        })
        .finally(function() {
            self.state.List.loaded = true;
            self.state.List.loading = false;
        });
    };
    
    this.getDetail = function(fn, params, persist, state) {
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
}]);
