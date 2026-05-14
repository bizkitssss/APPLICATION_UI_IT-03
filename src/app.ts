(function (): void {
    'use strict';

    angular
        .module('itApprovalApp', [])
        .constant('APP_CONFIG', {
            urlApi: 'https://localhost:44309',
            useMockApi: false
        } as AppConfig);
})();
