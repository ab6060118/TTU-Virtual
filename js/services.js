'use strict';

angular.module('services', [])

.constant('API_Endpoint', {
    API: '/virtualbox/endpoints/api.php',
    RDP: '/virtualbox/endpoints/rdp.php',
    IMAGE_API: 'api/image.php',
})

.constant('CONFIG', {
    'HOST': location.host,
})

.factory('Image', ['$http', '$q', 'Dashboard', 'API_Endpoint', function($http, $q, Dashboard, API) {
    var self = this;

    this.state = {
        images: {
            loading: false,
            loaded: false,
            uploading: false,
        }
    };

    this.data = {
        images: [],
    }

    this.getList = function(params) {
        self.state.images.loading = true;

        self.send('getList', params)
        .then(function(response) {
            self.data.images = response.data;
        })
        .finally(function() {
            self.state.images.loading = false;
            self.state.images.loaded = true;
        });
    };

    this.download = function(params) {
        self.send('download', params.basename)
        .then(function(response) {
        });
    };

    this.remove = function(params) {
        self.data.images[params.name].status = "deleting";
        self.send('remove', params)
        .then(function(response) {
            if (response.data.success) {
                delete self.data.images[params.name];
            }
            else {
                self.data.images[params.name].status = undefined;
            }
        });
    }

    this.upload = function(fd) {
        return $http.post(API.IMAGE_API, fd, {
                    headers: {'Content-Type': undefined },
                    transformRequest: angular.identity
                });
    }

    this.send = function(fn, params) {
        return $http({
            url: API.IMAGE_API,
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: fn,
                params: params
            })
        });
    };

    return this;
}])

.factory('Dashboard', ['$http', 'API_Endpoint', function($http, API) {
    var self = this;

    this.state = {
        Detail: {
            loading: false,
            loaded: false,
        },
        Memory: {
            loading: false,
            loaded: false,
        }
    }

    this.data = {
        Host: {},
        Memory: '',
        System: {},
    };

    this.getSystemProperties = function(fn, params, persist, defer) {
        return $http({
            url: API.API,
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: fn,
                params: params,
                persist: persist
            })
        })
        .then(function(response) {
            self.data.System = response.data.data.responseData;
            defer.resolve(true);
        })
    };

    this.getHostDetail = function(fn, params, persist) {
        self.state.Detail.loading = true;
        return $http({
            url: API.API,
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: fn,
                params: params,
                persist: persist
            })
        })
        .then(function(response) {
            self.data.Host = response.data.data.responseData;
            self.getHostMeminfo('hostGetMeminfo', null, null);
        })
        .finally(function() {
            self.state.Detail.loading = false;
            self.state.Detail.loaded = true;
        });
    };

    this.getHostMeminfo = function(fn, params, persist) {
        self.state.Memory.loading = true;
        return $http({
            url: API.API,
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: fn,
                params: params,
                persist: persist
            })
        })
        .then(function(response) {
            self.data.Memory = self.data.Host.memorySize-response.data.data.responseData;
        })
        .finally(function() {
            self.state.Memory.loading = false;
            self.state.Memory.loaded = true;
        });
    };

    return this;
}])

.factory('VM', ['$http', '$q', '$location', 'API_Endpoint', 'CONFIG', function($http, $q, $location, API, CONFIG) {
    var self = this;
    
    this.data = {
        VMs: {},
        Running: 0,
        VMtotal: 0,
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
            url: API.API,
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

                if(value.state == 'Running')
                    self.data.Running++;
                self.data.VMtotal++;

                arr.push(promise)
            });
            //console.log(self.data.VMs);
        })
        .finally(function() {
            $q.all(arr).then(function() {
                self.state.List.loaded = true;
                self.state.List.loading = false;
            });
            
        });
    };
    
    this.getDetail = function(fn, params, persist, state, defer) {
        return $http({
            method: 'POST',
            url: API.API,
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

            if(state == 'Running') {
                var runtimeDefer = $q.defer();
                var promise = runtimeDefer.promise;

                promise.then(function() {
                    defer.resolve('done');
                });

                self.getRuntimeData('machineGetRuntimeData', {'vm': response.data.data.responseData.id}, null, runtimeDefer);
            }

            if(undefined == promise) {
                defer.resolve('done');
            }
        });
    };

    this.remove = function(fn, params, persist) {
        return $http({
            method: 'POST',
            url: API.API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn: fn,
                params: params,
                persist: persist
            }),
        });
    };

    this.getRuntimeData = function(fn, params, persist, defer) {
        return $http({
            method: 'POST',
            url: API.API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn : fn,
                params : params,
                persist: persist
            }),
        })
        .then(function(response) {
            self.data.VMs[response.data.data.responseData.id].RDPPort = response.data.data.responseData.VRDEServerInfo ? response.data.data.responseData.VRDEServerInfo.port : undefined;
            defer.resolve('done');
        });
    }

    this.downloadRDP = function(id, port, name) {
        return API.RDP + '?host=' + CONFIG.HOST + '&port=' + port + '&id=' + id + '&vm=' + name;
    }
    
    this.powerUp = function(fn, params, persist) {
        return $http({
            method: 'POST',
            url: API.API,
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
            url: API.API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn : fn,
                params : params,
                persist : persist
            }),
        });
    };

    this.exportVM = function(fn, params, persist) {
        return $http({
            method: 'POST',
            url: API.API,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param({
                fn : fn,
                params : params,
                persist : persist
            }),
        });
    }
    
    this.progressGet = function(fn, params, persist) {
        return $http({
            method: 'POST',
            url: API.API,
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
    

    this.reset = function() {
        this.data = {
            VMs: {},
            Running: 0,
            VMtotal: 0,
        };
    }

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
            url: API.API,
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
            url: API.API,
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
            url: API.API,
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
