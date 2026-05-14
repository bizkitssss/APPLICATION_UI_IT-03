"use strict";
(function () {
    'use strict';
    angular
        .module('itApprovalApp')
        .controller('DocumentApprovalController', DocumentApprovalController);
    DocumentApprovalController.$inject = ['$scope', 'DocumentService'];
    function DocumentApprovalController($scope, DocumentService) {
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
        $scope.loadDocuments = function () {
            $scope.isLoading = true;
            $scope.alert = null;
            return DocumentService.getDocuments()
                .then(function (response) {
                $scope.documentList = response.data.map(function (item) {
                    item.selected = false;
                    return item;
                });
                refreshSelectedItems();
            })
                .catch(function () {
                showAlert('danger', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
            })
                .then(function () {
                $scope.isLoading = false;
            });
        };
        $scope.toggleSelection = function (item) {
            if (item.status === 'APPROVED') {
                item.selected = false;
            }
            refreshSelectedItems();
        };
        $scope.approveSelected = function () {
            if (!hasSelection()) {
                showAlert('warning', 'กรุณาเลือกรายการ');
                return;
            }
            $scope.approveRemark = '';
            $scope.modalForm.reason = '';
            openModal('approve');
        };
        $scope.rejectSelected = function () {
            if (!hasSelection()) {
                showAlert('warning', 'กรุณาเลือกรายการ');
                return;
            }
            $scope.rejectReason = '';
            $scope.modalForm.reason = '';
            openModal('reject');
        };
        $scope.confirmApprove = function () {
            if ($scope.isSaving) {
                return;
            }
            saveDecision(function () {
                var reason = $scope.modalForm.reason.trim();
                return DocumentService.approveDocuments({
                    documentIds: getSelectedIds(),
                    remark: reason
                });
            }, 'อนุมัติรายการเรียบร้อย');
        };
        $scope.confirmReject = function () {
            if ($scope.isSaving) {
                return;
            }
            if (!$scope.modalForm.reason || !$scope.modalForm.reason.trim()) {
                $scope.modalError = 'กรุณาระบุเหตุผล';
                return;
            }
            saveDecision(function () {
                var reason = $scope.modalForm.reason.trim();
                return DocumentService.rejectDocuments({
                    documentIds: getSelectedIds(),
                    reason: reason
                });
            }, 'ไม่อนุมัติรายการเรียบร้อย');
        };
        $scope.closeModal = function () {
            if ($scope.isSaving) {
                return;
            }
            $scope.modalType = null;
            $scope.modalError = null;
        };
        $scope.getStatusText = function (status) {
            return $scope.statusMap[status] || status;
        };
        $scope.getStatusClass = function (status) {
            var classMap = {
                PENDING: 'status-pending',
                APPROVED: 'status-approved',
                REJECTED: 'status-rejected'
            };
            return classMap[status] || 'status-pending';
        };
        function openModal(type) {
            $scope.alert = null;
            $scope.modalError = null;
            $scope.modalType = type;
        }
        function saveDecision(requestFactory, successMessage) {
            $scope.isSaving = true;
            $scope.modalError = null;
            requestFactory()
                .then(function () {
                $scope.modalType = null;
                $scope.modalError = null;
                return $scope.loadDocuments().then(function () {
                    showAlert('success', successMessage);
                });
            })
                .catch(function () {
                $scope.modalError = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
            })
                .then(function () {
                $scope.isSaving = false;
            });
        }
        function hasSelection() {
            refreshSelectedItems();
            return $scope.selectedItems.length > 0;
        }
        function refreshSelectedItems() {
            $scope.selectedItems = $scope.documentList.filter(function (item) {
                return Boolean(item.selected) && item.status !== 'APPROVED';
            });
        }
        function getSelectedIds() {
            refreshSelectedItems();
            return $scope.selectedItems.map(function (item) {
                return item.id;
            });
        }
        function showAlert(type, message) {
            $scope.alert = {
                type: type,
                message: message
            };
        }
        $scope.loadDocuments();
    }
})();
