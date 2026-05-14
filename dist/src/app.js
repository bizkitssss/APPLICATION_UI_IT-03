"use strict";
(function () {
    'use strict';
    angular
        .module('itApprovalApp', [])
        .constant('APP_CONFIG', {
        urlApi: 'https://localhost:44309',
        useMockApi: false
    });
})();
