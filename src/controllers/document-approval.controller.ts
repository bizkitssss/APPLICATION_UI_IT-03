(function (): void {
    'use strict';

    angular
        .module('itApprovalApp')
        .controller('DocumentApprovalController', DocumentApprovalController);

    DocumentApprovalController.$inject = ['$scope', 'DocumentService'];

    function DocumentApprovalController(
        $scope: DocumentApprovalScope,
        DocumentService: DocumentServiceApi
    ): void {
        $scope.documentList = [];
        $scope.selectedItems = [];
        $scope.approveRemark = '';
        $scope.rejectReason = '';
        $scope.modalForm = {
            reason: ''
        };
        $scope.modalType = null;
        $scope.isSaving = false;
        $scope.isLoading = false;
        $scope.alert = null;
        $scope.modalError = null;

        $scope.statusMap = {
            PENDING: 'รออนุมัติ',
            APPROVED: 'อนุมัติ',
            REJECTED: 'ไม่อนุมัติ'
        };

        $scope.loadDocuments = function (): Promise<void> {
            $scope.isLoading = true;
            $scope.alert = null;

            return DocumentService.getDocuments()
                .then(function (response: ApiResponse<ApprovalDocument[]>): void {
                    $scope.documentList = response.data.map(function (item: ApprovalDocument): ApprovalDocument {
                        item.selected = false;
                        return item;
                    });
                    refreshSelectedItems();
                })
                .catch(function (): void {
                    showAlert('danger', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
                })
                .then(function (): void {
                    $scope.isLoading = false;
                });
        };

        $scope.toggleSelection = function (item: ApprovalDocument): void {
            if (item.status === 'APPROVED') {
                item.selected = false;
            }

            refreshSelectedItems();
        };

        $scope.approveSelected = function (): void {
            if (!hasSelection()) {
                showAlert('warning', 'กรุณาเลือกรายการ');
                return;
            }

            $scope.approveRemark = '';
            $scope.modalForm.reason = '';
            openModal('approve');
        };

        $scope.rejectSelected = function (): void {
            if (!hasSelection()) {
                showAlert('warning', 'กรุณาเลือกรายการ');
                return;
            }

            $scope.rejectReason = '';
            $scope.modalForm.reason = '';
            openModal('reject');
        };

        $scope.confirmApprove = function (): void {
            if ($scope.isSaving) {
                return;
            }

            saveDecision(function (): Promise<ApiResponse<ApiResult>> {
                var reason = $scope.modalForm.reason.trim();

                return DocumentService.approveDocuments({
                    documentIds: getSelectedIds(),
                    remark: reason
                });
            }, 'อนุมัติรายการเรียบร้อย');
        };

        $scope.confirmReject = function (): void {
            if ($scope.isSaving) {
                return;
            }

            if (!$scope.modalForm.reason || !$scope.modalForm.reason.trim()) {
                $scope.modalError = 'กรุณาระบุเหตุผล';
                return;
            }

            saveDecision(function (): Promise<ApiResponse<ApiResult>> {
                var reason = $scope.modalForm.reason.trim();

                return DocumentService.rejectDocuments({
                    documentIds: getSelectedIds(),
                    reason: reason
                });
            }, 'ไม่อนุมัติรายการเรียบร้อย');
        };

        $scope.closeModal = function (): void {
            if ($scope.isSaving) {
                return;
            }

            $scope.modalType = null;
            $scope.modalError = null;
        };

        $scope.getStatusText = function (status: DocumentStatus): string {
            return $scope.statusMap[status] || status;
        };

        $scope.getStatusClass = function (status: DocumentStatus): string {
            var classMap: Record<DocumentStatus, string> = {
                PENDING: 'status-pending',
                APPROVED: 'status-approved',
                REJECTED: 'status-rejected'
            };

            return classMap[status] || 'status-pending';
        };

        function openModal(type: Exclude<ModalType, null>): void {
            $scope.alert = null;
            $scope.modalError = null;
            $scope.modalType = type;
        }

        function saveDecision(
            requestFactory: () => Promise<ApiResponse<ApiResult>>,
            successMessage: string
        ): void {
            $scope.isSaving = true;
            $scope.modalError = null;

            requestFactory()
                .then(function (): Promise<void> {
                    $scope.modalType = null;
                    $scope.modalError = null;

                    return $scope.loadDocuments().then(function (): void {
                        showAlert('success', successMessage);
                    });
                })
                .catch(function (): void {
                    $scope.modalError = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
                })
                .then(function (): void {
                    $scope.isSaving = false;
                });
        }

        function hasSelection(): boolean {
            refreshSelectedItems();
            return $scope.selectedItems.length > 0;
        }

        function refreshSelectedItems(): void {
            $scope.selectedItems = $scope.documentList.filter(function (item: ApprovalDocument): boolean {
                return Boolean(item.selected) && item.status !== 'APPROVED';
            });
        }

        function getSelectedIds(): number[] {
            refreshSelectedItems();
            return $scope.selectedItems.map(function (item: ApprovalDocument): number {
                return item.id;
            });
        }

        function showAlert(type: AlertType, message: string): void {
            $scope.alert = {
                type: type,
                message: message
            };
        }

        $scope.loadDocuments();
    }
})();
