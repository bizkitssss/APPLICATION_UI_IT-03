"use strict";
(function () {
    'use strict';
    angular
        .module('itApprovalApp')
        .service('DocumentService', DocumentService);
    DocumentService.$inject = ['$http', '$q', '$timeout', 'APP_CONFIG'];
    function DocumentService($http, $q, $timeout, APP_CONFIG) {
        var documents = [
            {
                id: 1,
                name: 'รายการที่ 1',
                reason: 'Hardware',
                status: 'PENDING',
                rejectReason: null
            },
            {
                id: 2,
                name: 'รายการที่ 2',
                reason: 'Software',
                status: 'PENDING',
                rejectReason: null
            },
            {
                id: 3,
                name: 'รายการที่ 3',
                reason: 'Network',
                status: 'APPROVED',
                rejectReason: null
            },
            {
                id: 4,
                name: 'รายการที่ 4',
                reason: 'Security',
                status: 'REJECTED',
                rejectReason: 'ข้อมูลไม่ครบ'
            }
        ];
        this.getDocuments = function () {
            if (!APP_CONFIG.useMockApi) {
                return $http
                    .get(APP_CONFIG.urlApi + '/api/IT/GetListIT')
                    .then(function (response) {
                    return {
                        data: mapDocuments(response.data.data)
                    };
                });
            }
            return mockResponse(copyDocuments());
        };
        this.approveDocuments = function (payload) {
            if (!APP_CONFIG.useMockApi) {
                return updateItDocuments(payload.documentIds, payload.remark, 'APPROVED');
            }
            updateDocuments(payload.documentIds, 'APPROVED', payload.remark);
            return mockResponse({
                success: true,
                message: 'Approve Success'
            });
        };
        this.rejectDocuments = function (payload) {
            if (!APP_CONFIG.useMockApi) {
                return updateItDocuments(payload.documentIds, payload.reason, 'REJECTED');
            }
            updateDocuments(payload.documentIds, 'REJECTED', payload.reason);
            return mockResponse({
                success: true,
                message: 'Reject Success'
            });
        };
        function updateDocuments(ids, status, reason) {
            documents.forEach(function (item) {
                if (ids.indexOf(item.id) !== -1) {
                    item.status = status;
                    item.reason = reason;
                    item.rejectReason = status === 'REJECTED' ? reason : null;
                }
            });
        }
        function updateItDocuments(ids, reason, status) {
            var updatePayload = ids.map(function (id) {
                return {
                    id: id,
                    reason: reason,
                    status: status
                };
            });
            return $http.post(APP_CONFIG.urlApi + '/api/IT/UpdateListIT', updatePayload);
        }
        function copyDocuments() {
            return angular.copy(documents);
        }
        function mapDocuments(items) {
            return items.map(function (item) {
                return {
                    id: item.id,
                    name: item.name,
                    reason: item.reason,
                    status: item.status,
                    rejectReason: item.status === 'REJECTED' ? item.reason : null
                };
            });
        }
        function mockResponse(data) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve({
                    data: data
                });
            }, 450);
            return deferred.promise;
        }
    }
})();
