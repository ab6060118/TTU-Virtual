'use strict';

angular.module('controllers', [])
.controller('DashboardCtrl', function($scope, VM, Dashboard) {
    $scope.VM;
})
.controller('VMListCtrl', ['$scope', '$route', '$interval', '$q', 'VM', function($scope, $route, $interval, $q, VM) {
    $scope.VM = VM;
    $scope.VM.stateReset();
    
    $scope.VM.getList('vboxGetMachines', null, null);
    
    $scope.state = {
        creating: false,
    };

    $scope.templates = [{"name" : "vm-create-form", "url" : "view/vm-create-form.html"}];

    $scope.template = $scope.templates[0];

    $scope.doSomething = function() {
        $('.ui.dropdown').dropdown();
    };
    
    $scope.powerUp = function(id) {
        $scope.VM.data.VMs[id].state = 'Starting';

        $scope.VM.powerUp('machineSetState', {"vm":id, "state":"powerUp"}, null)
        .then(function(response) {
            response = response.data.data;
            var timer = $interval(function() {
                $scope.VM.progressGet('progressGet', response.responseData, response.persist)
                .then(function(response) {
                    if(response.data.data.responseData.info.completed) {
                        $scope.VM.data.VMs[id].state = 'Running';
                        $interval.cancel(timer);

                        var runtimeDefer = $q.defer();
                        var promise = runtimeDefer.promise;

                        $scope.VM.getRuntimeData('machineGetRuntimeData', {'vm': id}, null, runtimeDefer);
                    }
                });
            }, 1500);
        });
    };

    $scope.powerDown = function(id) {
        $scope.VM.data.VMs[id].RDPPort = undefined;
        $scope.VM.data.VMs[id].state = 'Closing';
        $scope.VM.powerDown('machineSetState', {"vm":id, "state":"powerDown"}, null)
        .then(function(response) {
            response = response.data.data;
            var timer = $interval(function() {
                $scope.VM.progressGet('progressGet', response.responseData, response.persist)
                .then(function(response) {
                    if(response.data.data.responseData.info.completed) {
                        $scope.VM.data.VMs[id].state = 'PoweredOff';
                        $interval.cancel(timer);
                    }
                });
            }, 1500);
        });
    };

    $scope.downloadRDP = function(id, port, name) {
        return $scope.VM.downloadRDP(id, port, name);
    }

    $scope.$on('cancelCreating', function() {
        $scope.state.creating = false;
    });
    
    $scope.reset = function() {
    };
    
    $scope.init = function() {
        $scope.reset();
    };
    
    $scope.init();
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
}])

.controller('LoginCtrl', ['$scope', '$rootScope', 'Auth', function($scope, $rootScope, Auth) {
    $scope.auth = Auth;

    $scope.login = function(userInfo) {
        $scope.auth.login('login', userInfo, null, $scope);
    }

    $scope.logout = function() {
        Auth.logout();
    }

    $scope.reset = function() {
        $scope.userInfo = {
            u: '',
            p: '',
        };

        $scope.errorMsg = undefined;
    };

    $scope.init = function() {
        $scope.reset();
    }

    $scope.init();
}])

.controller('LogoutCtrl', function(Auth) {
    Auth.logout();
});
