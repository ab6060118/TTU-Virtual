'use strict';

angular.module('directives', [])

.directive('progressBar', function() {
    return {
        restrict: 'E',
        templateUrl: 'view/progressbar.html',
        link: function(scope, element, attrs) {
            attrs.$observe('message', function() {
                scope.percent = parseFloat(attrs.used)/parseFloat(attrs.total)*100;
                $(element[0]).find('div.ui.progress').progress({
                    text: {
                        active: attrs.message,
                    },
                    className: {
                        success: 'error',
                    },
                    percent: scope.percent,
                });
            });
        }
    };
});
