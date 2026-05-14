declare const angular: AngularStatic;

interface AngularStatic {
    module(name: string, requires?: string[]): AngularModule;
    copy<T>(value: T): T;
}

interface AngularModule {
    constant(name: string, value: unknown): AngularModule;
    service(name: string, constructor: InjectableFunction): AngularModule;
    controller(name: string, constructor: InjectableFunction): AngularModule;
}

type InjectableFunction = Function & {
    $inject?: string[];
};

interface AppConfig {
    urlApi: string;
    useMockApi: boolean;
}

type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type ModalType = 'approve' | 'reject' | null;
type AlertType = 'success' | 'warning' | 'danger';

interface ApprovalDocument {
    id: number;
    name: string;
    reason: string | null;
    status: DocumentStatus;
    rejectReason: string | null;
    selected?: boolean;
}

interface ItDocumentResponse {
    id: number;
    name: string;
    reason: string | null;
    status: DocumentStatus;
}

interface ApiEnvelope<T> {
    success: boolean;
    status: number;
    data: T;
    message: string;
    error: string | null;
}

interface ApiResponse<T> {
    data: T;
}

interface ApiResult {
    success: boolean;
    message: string;
}

interface UpdateItPayload {
    id: number;
    reason: string;
    status: DocumentStatus;
}

interface ApprovePayload {
    documentIds: number[];
    remark: string;
}

interface RejectPayload {
    documentIds: number[];
    reason: string;
}

interface HttpService {
    get<T>(url: string): Promise<ApiResponse<T>>;
    post<T>(url: string, payload: unknown): Promise<ApiResponse<T>>;
}

interface Deferred<T> {
    resolve(value: T): void;
    promise: Promise<T>;
}

interface QService {
    defer<T>(): Deferred<T>;
    all<T>(promises: Promise<T>[]): Promise<T[]>;
}

interface TimeoutService {
    (callback: () => void, delay?: number): void;
}

interface DocumentServiceApi {
    getDocuments(): Promise<ApiResponse<ApprovalDocument[]>>;
    approveDocuments(payload: ApprovePayload): Promise<ApiResponse<ApiResult>>;
    rejectDocuments(payload: RejectPayload): Promise<ApiResponse<ApiResult>>;
}

interface FeedPost {
    id: number;
    username: string;
    postDate: Date;
    imageUrl: string;
    comments: FeedComment[];
}

interface FeedComment {
    id: number;
    username: string;
    commentText: string;
    createdDate: Date;
}

interface AddCommentPayload {
    postId: number;
    username: string;
    commentText: string;
}

interface PostServiceApi {
    getPost(): Promise<ApiResponse<FeedPost>>;
    addComment(payload: AddCommentPayload): Promise<ApiResponse<FeedComment>>;
}

interface AlertMessage {
    type: AlertType;
    message: string;
}

interface ModalForm {
    reason: string;
}

interface DocumentApprovalScope {
    documentList: ApprovalDocument[];
    selectedItems: ApprovalDocument[];
    approveRemark: string;
    rejectReason: string;
    modalForm: ModalForm;
    modalType: ModalType;
    isSaving: boolean;
    isLoading: boolean;
    alert: AlertMessage | null;
    modalError: string | null;
    statusMap: Record<DocumentStatus, string>;
    loadDocuments(): Promise<void>;
    toggleSelection(item: ApprovalDocument): void;
    approveSelected(): void;
    rejectSelected(): void;
    confirmApprove(): void;
    confirmReject(): void;
    closeModal(): void;
    getStatusText(status: DocumentStatus): string;
    getStatusClass(status: DocumentStatus): string;
}

interface CommentFeedScope {
    post: FeedPost | null;
    newCommentText: string;
    comment: { text: string; }
    commentError: string | null;
    isPostLoading: boolean;
    isCommentSaving: boolean;
    maxCommentLength: number;
    loadPost(): Promise<void>;
    submitComment(event?: KeyboardEvent): void;
    getRemainingChars(): number;
}
