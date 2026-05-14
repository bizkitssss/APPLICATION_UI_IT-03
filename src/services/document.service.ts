(function (): void {
    'use strict';

    angular
        .module('itApprovalApp')
        .service('DocumentService', DocumentService);

    DocumentService.$inject = ['$http', '$q', '$timeout', 'APP_CONFIG'];

    function DocumentService(
        this: DocumentServiceApi,
        $http: HttpService,
        $q: QService,
        $timeout: TimeoutService,
        APP_CONFIG: AppConfig
    ): void {
        var documents: ApprovalDocument[] = [
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

        this.getDocuments = function (): Promise<ApiResponse<ApprovalDocument[]>> {
            if (!APP_CONFIG.useMockApi) {
                return $http
                    .get<ApiEnvelope<ItDocumentResponse[]>>(APP_CONFIG.urlApi + '/api/IT/GetListIT')
                    .then(function (response: ApiResponse<ApiEnvelope<ItDocumentResponse[]>>): ApiResponse<ApprovalDocument[]> {
                        return {
                            data: mapDocuments(response.data.data)
                        };
                    });
            }

            return mockResponse(copyDocuments());
        };

        this.approveDocuments = function (payload: ApprovePayload): Promise<ApiResponse<ApiResult>> {
            if (!APP_CONFIG.useMockApi) {
                return updateItDocuments(payload.documentIds, payload.remark, 'APPROVED');
            }

            updateDocuments(payload.documentIds, 'APPROVED', payload.remark);

            return mockResponse({
                success: true,
                message: 'Approve Success'
            });
        };

        this.rejectDocuments = function (payload: RejectPayload): Promise<ApiResponse<ApiResult>> {
            if (!APP_CONFIG.useMockApi) {
                return updateItDocuments(payload.documentIds, payload.reason, 'REJECTED');
            }

            updateDocuments(payload.documentIds, 'REJECTED', payload.reason);

            return mockResponse({
                success: true,
                message: 'Reject Success'
            });
        };

        function updateDocuments(ids: number[], status: DocumentStatus, reason: string): void {
            documents.forEach(function (item: ApprovalDocument): void {
                if (ids.indexOf(item.id) !== -1) {
                    item.status = status;
                    item.reason = reason;
                    item.rejectReason = status === 'REJECTED' ? reason : null;
                }
            });
        }

        function updateItDocuments(
            ids: number[],
            reason: string,
            status: DocumentStatus
        ): Promise<ApiResponse<ApiResult>> {
            var updatePayload: UpdateItPayload[] = ids.map(function (id: number): UpdateItPayload {
                return {
                    id: id,
                    reason: reason,
                    status: status
                };
            });

            return $http.post<ApiResult>(APP_CONFIG.urlApi + '/api/IT/UpdateListIT', updatePayload);
        }

        function copyDocuments(): ApprovalDocument[] {
            return angular.copy(documents);
        }

        function mapDocuments(items: ItDocumentResponse[]): ApprovalDocument[] {
            return items.map(function (item: ItDocumentResponse): ApprovalDocument {
                return {
                    id: item.id,
                    name: item.name,
                    reason: item.reason,
                    status: item.status,
                    rejectReason: item.status === 'REJECTED' ? item.reason : null
                };
            });
        }

        function mockResponse<T>(data: T): Promise<ApiResponse<T>> {
            var deferred: Deferred<ApiResponse<T>> = $q.defer<ApiResponse<T>>();

            $timeout(function (): void {
                deferred.resolve({
                    data: data
                });
            }, 450);

            return deferred.promise;
        }
    }
})();
