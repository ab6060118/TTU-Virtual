'use strict';

angular.module('controllers', [])
.controller('DashboardCtrl', ['$scope', 'VM', 'Dashboard', function($scope, VM, Dashboard) {
    $scope.VM = VM;
    $scope.Dashboard = Dashboard;
    $scope.VM.reset();

    $scope.Dashboard.getHostDetail('hostGetDetails', null, null);
    $scope.VM.getList('vboxGetMachines', null, null);
}])

.controller('VMListCtrl', ['$scope', '$route', '$interval', '$q', 'VM', function($scope, $route, $interval, $q, VM) {
    $scope.VM = VM;
    $scope.VM.stateReset();
    $scope.VM.reset();
    
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
                $scope.VM.data.VMs[id].state = 'Starting';
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
                $scope.VM.data.VMs[id].state = 'Closing';
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

    $scope.exportVM = function(id, name) {
        var format = 'ovf-1.0';
        var filename = 'home/user1/.config/VirtualBox/' + name + '_' + Date.now() + '.ova';
        var vms = {};
        vms[id] = {};
        vms[id]["id"] = id;
        vms[id]["name"] = name;
        vms[id]["product"] = "";
        vms[id]["product-url"] = "";
        vms[id]["vendor"] = "";
        vms[id]["vendor-url"] = "";
        vms[id]["version"] = "";
        vms[id]["description"] = "";
        vms[id]["license"] = "";

        $scope.VM.data.VMs[id].state = 'Exporting';

        $scope.VM.exportVM('applianceExport', {"format": format,
                                            "file": filename,
                                            "vms": vms,
                                            "manifest": false,
                                            "overwrite": 1}, null)
        .then(function(response) {
            response = response.data.data;
            window.onbeforeunload = function(event) {
                return 'Image is exporting !!, please don\'t reload the page.';
            };
            var timer = $interval(function() {
                $scope.VM.data.VMs[id].state = 'Exporting';
                $scope.VM.progressGet('progressGet', response.responseData, response.persist)
                .then(function(response) {
                    $scope.VM.data.VMs[id].state = 'Exporting';
                    if(response.data.data.responseData.info.completed) {
                        window.onbeforeunload = null;
                        $scope.VM.data.VMs[id].state = 'PoweredOff';
                        $interval.cancel(timer);
                    }
                });
            }, 1500);
        });
    };

    $scope.downloadRDP = function(id, port, name) {
        return $scope.VM.downloadRDP(id, port, name);
    };

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
