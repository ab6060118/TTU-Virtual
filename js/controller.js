'use strict';

angular.module('controllers', [])
.controller('DashboardCtrl', ['$scope', 'VM', 'Dashboard', function($scope, VM, Dashboard) {
    $scope.VM = VM;
    $scope.Dashboard = Dashboard;
    $scope.VM.reset();

    $scope.Dashboard.getHostDetail('hostGetDetails', null, null);
    $scope.VM.getList('vboxGetMachines', null, null);
}])

.controller('VMListCtrl', ['$scope', '$route', '$interval', '$q', '$timeout', '$mdDialog','VM', 'Dashboard', function($scope, $route, $interval, $q, $timeout, $mdDialog, VM, Dashboard) {
    $scope.VM = VM;
    $scope.Dashboard = Dashboard;
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

    $scope.remove = function(ev, id, name) {
        var confirm = $mdDialog.confirm({hasBackdrop:false})
                  .textContent('All of the banks have agreed to forgive you your debts.')
                  .ariaLabel('Lucky day')
                  .targetEvent(ev)
                  .ok('Yes!')
                  .cancel('No!');

        $mdDialog.show(confirm).then(function() {
            $scope.VM.data.VMs[id].state = 'Removing';
            $scope.VM.remove('machineRemove', {"vm":id, "delete":"1"}, null)
            .then(function(response) {
                response = response.data.data;
                var timer = $interval(function() {
                    $scope.VM.data.VMs[id].state = 'Removing';
                    $scope.VM.progressGet('progressGet', response.responseData, response.persist)
                    .then(function(response) {
                        if(response.data.data.responseData.info.completed) {
                            delete $scope.VM.data.VMs[id];
                            $interval.cancel(timer);
                        }
                    });
                }, 1500);
            });
        });
    };

    $scope.exportVM = function(id, name) {
        $scope.VM.data.VMs[id].state = 'Exporting';

        var defer = $q.defer();
        var promise = defer.promise;

        $scope.Dashboard.getSystemProperties('vboxSystemPropertiesGet', null, null, defer);

        promise.then(function() {
            var format = 'ovf-1.0';
            var filename = $scope.Dashboard.data.System.homeFolder + '/' + name + '_' + Date.now() + '.ova';
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
                        $('#' + id + '-progress').progress({percent: response.data.data.responseData.info.percent});
                        if(response.data.data.responseData.info.completed) {
                            window.onbeforeunload = null;
                            $timeout(function() {
                                $scope.VM.data.VMs[id].state = 'PoweredOff';
                            }, 3000);
                            $interval.cancel(timer);
                        }
                    });
                }, 1500);
            });
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

.controller('ImageListCtrl', ['$scope', 'Image', function($scope, Image) {
    $scope.Image = Image;
    $scope.Image.getList(null);
    $scope.fileName = undefined;

    $scope.remove = function(image) {
        $scope.Image.remove({"name": image.basename});
    };

    $scope.download = function(image) {
        $scope.Image.download(image);
    };

    $scope.upload = function(file) {
        var fd = new FormData();
        fd.append('file', file);
        fd.append('fn', 'upload');
        fd.append('params', null);

        window.onbeforeunload = function(event) {
            return 'Image is uploading !!, please don\'t reload the page.';
        };
        $scope.Image.state.images.uploading = true;

        $scope.Image.upload(fd)
        .success(function(response) {
            console.log(response);
        })
        .finally(function() {
            $scope.Image.getList(null);
            $scope.Image.state.images.uploading = false;
            window.onbeforeunload = null;
        });
    }
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
